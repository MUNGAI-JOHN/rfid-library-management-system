const prisma = require("../config/prisma");

const borrowBook = async (borrowData) => {
  const { patronRfid, bookRfid, dueDate } = borrowData;

  // Check if patron exists
  const patron = await prisma.patron.findUnique({
    where: {
      rfid_uid: patronRfid,
    },
  });

  if (!patron) {
    throw new Error("Patron not found.");
  }

  // Check if book exists
  const book = await prisma.book.findUnique({
    where: {
      rfid_bid: bookRfid,
    },
  });

  if (!book) {
    throw new Error("Book not found.");
  }

  // Check if the book is already borrowed
  if (!book.available) {
    throw new Error("Book is already borrowed.");
  }

  // Check if this patron already has an active borrowing
  const existingBorrow = await prisma.borrowingBook.findFirst({
    where: {
      patronRfid,
      bookRfid,
      returned: false,
    },
  });

  if (existingBorrow) {
    throw new Error("This patron has already borrowed this book.");
  }

  // Transaction
  const borrowing = await prisma.$transaction(async (tx) => {
    const borrowRecord = await tx.borrowingBook.create({
      data: {
        patronRfid,
        bookRfid,
        dueDate: new Date(dueDate),
      },
    });

    await tx.book.update({
      where: {
        rfid_bid: bookRfid,
      },
      data: {
        available: false,
      },
    });

    return borrowRecord;
  });

  return borrowing;
};

module.exports = {
  borrowBook,
};
