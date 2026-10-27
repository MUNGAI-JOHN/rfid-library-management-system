const prisma = require("../config/prisma");

const exitLibrary = async (patronRfid, bookRfid = null) => {
  // STEP 1: Check patron
  const patron = await prisma.patron.findUnique({
    where: {
      rfid_uid: patronRfid,
    },
  });

  if (!patron) {
    throw new Error("Patron not found.");
  }

  const patronEnter = await prisma.entranceLogs.findFirst({
    where: {
      patronRfid,
    },
    orderBy: {
      entranceTime: "desc",
    },
  });

  if (!patronEnter) {
    throw new Error("Patron has not verified entrance. Please scan at the library entrance first.");
  }

  const previousExit = await prisma.exitLogs.findFirst({
    where: {
      patronRfid,
      exitTime: {
        gt: patronEnter.entranceTime,
      },
    },
    orderBy: {
      exitTime: "desc",
    },
  });

  if (previousExit) {
    throw new Error(
      "Patron has already exited the library. Please scan at the entrance before exiting again."
    );
  }

  // STEP 2: No book detected
  if (!bookRfid) {
    const exitLog = await prisma.exitLogs.create({
      data: {
        patronRfid,
        bookAuthorized: true,
      },
    });

    return {
      authorized: true,
      message: "No library book detected. Exit allowed.",
      exitLog,
    };
  }

  // STEP 3: Check whether RFID belongs to a registered book
  const book = await prisma.book.findUnique({
    where: {
      rfid_bid: bookRfid,
    },
  });

  // Unknown RFID = personal/non-library item
  if (!book) {
    const exitLog = await prisma.exitLogs.create({
      data: {
        patronRfid,
        bookRfid,
        bookAuthorized: true,
      },
    });

    return {
      authorized: true,
      message: "Unknown RFID. No registered library book detected.",
      exitLog,
    };
  }

  // STEP 4: Check whether this patron has borrowed this book
  const borrowing = await prisma.borrowingBook.findFirst({
    where: {
      patronRfid,
      bookRfid,
      returned: false,
    },
  });

  // STEP 5: Library book has NOT been borrowed
  if (!borrowing) {
    const exitLog = await prisma.exitLogs.create({
      data: {
        patronRfid,
        bookRfid,
        bookAuthorized: false,
      },
    });

    return {
      authorized: false,
      message: "Unauthorized library book. This book has not been borrowed.",
      exitLog,
    };
  }

  // STEP 6: Book was properly borrowed
  // DO NOT mark it as returned here.

  const exitLog = await prisma.exitLogs.create({
    data: {
      patronRfid,
      bookRfid,
      bookAuthorized: true,
    },
  });

  return {
    authorized: true,
    message: "Exit authorized. Borrowed book confirmed.",
    exitLog,
    book: {
      bookTitle: book.bookTitle,
      rfid_bid: book.rfid_bid,
      location: book.location,
    },
    borrowing: {
      id: borrowing.id,
      borrowDate: borrowing.borrowDate,
      dueDate: borrowing.dueDate,
    },
  };
};

const getExitLogs = async () => {
  const exitLogs = await prisma.exitLogs.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      patron: {
        select: {
          id: true,
          fullName: true,
          rfid_uid: true,
        },
      },
      book: {
        select: {
          id: true,
          bookTitle: true,
          rfid_bid: true,
        },
      },
    },
  });

  return exitLogs;
};

module.exports = {
  exitLibrary,
  getExitLogs,
};
