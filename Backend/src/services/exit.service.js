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
      message: "No library book detected.",
      exitLog,
    };
  }

  // STEP 3: Check if scanned RFID belongs to a library book
  const book = await prisma.book.findUnique({
    where: {
      rfid_bid: bookRfid,
    },
  });

  // Unknown book (not registered)
  if (!book) {
    const exitLog = await prisma.exitLogs.create({
      data: {
        patronRfid,
        bookAuthorized: true,
      },
    });

    return {
      authorized: true,
      message: "Object is not a library resource.",
      exitLog,
    };
  }

  // STEP 4: Check borrowing record
  const borrowing = await prisma.borrowingBook.findFirst({
    where: {
      patronRfid,
      bookRfid,
      returned: false,
    },
  });

  // Book was not borrowed
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
      message: "Unauthorized library book.",
      exitLog,
    };
  }

  // STEP 5: Mark borrowing as returned
  await prisma.borrowingBook.update({
    where: {
      id: borrowing.id,
    },
    data: {
      returned: true,
      returnedDate: new Date(),
    },
  });

  // STEP 6: Make the book available again
  await prisma.book.update({
    where: {
      rfid_bid: bookRfid,
    },
    data: {
      available: true,
    },
  });

  // STEP 7: Save exit log
  const exitLog = await prisma.exitLogs.create({
    data: {
      patronRfid,
      bookRfid,
      bookAuthorized: true,
    },
  });

  return {
    authorized: true,
    message: "Exit authorized.",
    exitLog,
  };
};

module.exports = {
  exitLibrary,
};
