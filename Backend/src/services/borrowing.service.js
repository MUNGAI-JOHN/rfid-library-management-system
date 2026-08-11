const prisma = require("../config/prisma");

const borrowBook = async ({ patronRfid, bookRfid }) => {
  if (!patronRfid) {
    throw new Error("Patron RFID is required");
  }

  if (!bookRfid) {
    throw new Error("Book RFID is required");
  }

  // Find patron
  const patron = await prisma.patron.findUnique({
    where: {
      rfid_uid: patronRfid,
    },
  });

  if (!patron) {
    throw new Error("Patron not found");
  }

  // Find book
  const book = await prisma.book.findUnique({
    where: {
      rfid_bid: bookRfid,
    },
    include: {
      shelf: true,
    },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  if (book.location === "WITH_PATRON") {
    throw new Error("Book is already borrowed");
  }

  if (book.location === "ON_SHELF") {
    throw new Error(
      "Book is still on the shelf. Please take it through the Smart Shelf process first."
    );
  }

  // Make sure the book does not already have an active borrowing
  const existingBorrowing = await prisma.borrowingBook.findFirst({
    where: {
      bookRfid,
      returned: false,
    },
  });

  if (existingBorrowing) {
    throw new Error("Book is already borrowed");
  }

  // Automatically calculate due date
  // Currently: 14 days from today
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  // Perform all database changes as one transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create borrowing record
    const borrowing = await tx.borrowingBook.create({
      data: {
        patronRfid,
        bookRfid,
        dueDate,
      },
    });

    // Change book location
    const updatedBook = await tx.book.update({
      where: {
        rfid_bid: bookRfid,
      },
      data: {
        location: "WITH_PATRON",
      },
    });

    // Record activity
    await tx.shelfActivity.create({
      data: {
        patronRfid,
        bookRfid,
        eventType: "BOOK_BORROWED",
      },
    });

    return {
      borrowing,
      book: updatedBook,
    };
  });

  return {
    borrowingId: result.borrowing.id,

    patron: {
      id: patron.id,
      fullName: patron.fullName,
      rfid_uid: patron.rfid_uid,
      status: patron.status,
    },

    book: {
      id: result.book.id,
      bookTitle: result.book.bookTitle,
      rfid_bid: result.book.rfid_bid,
      shelfName: book.shelf.shelfName,
      location: result.book.location,
    },

    borrowDate: result.borrowing.borrowDate,
    dueDate: result.borrowing.dueDate,

    message: "Book borrowed successfully",
  };
};

const getAllBorrowings = async () => {
  return await prisma.borrowingBook.findMany({
    orderBy: {
      borrowDate: "desc",
    },

    include: {
      patron: {
        select: {
          id: true,
          fullName: true,
          rfid_uid: true,
          status: true,
        },
      },

      book: {
        select: {
          id: true,
          bookTitle: true,
          rfid_bid: true,
          location: true,
        },
      },
    },
  });
};

module.exports = {
  borrowBook,
  getAllBorrowings,
};
