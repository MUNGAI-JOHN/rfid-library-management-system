const prisma = require("../config/prisma");
const path = require("path");

const scanPatron = async (rfid_uid) => {
  if (!rfid_uid) {
    throw new Error("Patron RFID UID is required");
  }

  const patron = await prisma.patron.findUnique({
    where: {
      rfid_uid,
    },
  });

  if (!patron) {
    throw new Error("Patron not found");
  }

  // Check whether there is already an active session
  const existingSession = await prisma.smartShelfSession.findFirst({
    where: {
      active: true,
    },
  });

  // If another session exists, close it
  if (existingSession) {
    await prisma.smartShelfSession.update({
      where: {
        id: existingSession.id,
      },
      data: {
        active: false,
        endedAt: new Date(),
      },
    });
  }

  // Create new session
  const session = await prisma.smartShelfSession.create({
    data: {
      patronRfid: patron.rfid_uid,
    },
  });

  return {
    sessionId: session.id,

    patron: {
      id: patron.id,
      fullName: patron.fullName,
      rfid_uid: patron.rfid_uid,
      status: patron.status,
    },

    requiresPhoto: patron.status === "PROBLEMATIC_PATRON",

    message: "Patron scanned successfully. Waiting for book.",
  };
};

const scanBook = async (bookRfid) => {
  if (!bookRfid) {
    throw new Error("Book RFID is required");
  }

  // Find active Smart Shelf session
  const session = await prisma.smartShelfSession.findFirst({
    where: {
      active: true,
    },
    include: {
      patron: true,
    },
  });

  if (!session) {
    throw new Error("No active patron session");
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

  // Book must currently be on the shelf
  if (book.location !== "ON_SHELF") {
    throw new Error(`Book is currently ${book.location} and cannot be picked`);
  }

  const patron = session.patron;

  // Problematic patron needs photo before we complete the pickup
  if (patron.status === "PROBLEMATIC_PATRON") {
    return {
      sessionId: session.id,

      patron: {
        id: patron.id,
        fullName: patron.fullName,
        rfid_uid: patron.rfid_uid,
        status: patron.status,
      },

      book: {
        id: book.id,
        bookTitle: book.bookTitle,
        rfid_bid: book.rfid_bid,
        shelfName: book.shelf.shelfName,
        location: book.location,
      },

      requiresPhoto: true,

      message: "Problematic patron detected. Capture photo of patron holding the book.",
    };
  }

  // Normal patron
  // Book is now being used inside the library
  const updatedBook = await prisma.book.update({
    where: {
      id: book.id,
    },
    data: {
      location: "IN_LIBRARY",
    },
  });

  // Record the pickup
  const activity = await prisma.shelfActivity.create({
    data: {
      patronRfid: patron.rfid_uid,
      bookRfid: book.rfid_bid,
      eventType: "BOOK_PICKED",
    },
  });

  // Close the Smart Shelf session
  await prisma.smartShelfSession.update({
    where: {
      id: session.id,
    },
    data: {
      active: false,
      endedAt: new Date(),
    },
  });

  return {
    sessionId: session.id,

    patron: {
      id: patron.id,
      fullName: patron.fullName,
      rfid_uid: patron.rfid_uid,
      status: patron.status,
    },

    book: {
      id: updatedBook.id,
      bookTitle: updatedBook.bookTitle,
      rfid_bid: updatedBook.rfid_bid,
      location: updatedBook.location,
    },

    requiresPhoto: false,

    activityId: activity.id,

    message: "Book picked successfully.",
  };
};
const capture = async ({ bookRfid, imagePath }) => {
  if (!bookRfid) {
    throw new Error("Book RFID is required");
  }

  // Find active session
  const session = await prisma.smartShelfSession.findFirst({
    where: {
      active: true,
    },
    include: {
      patron: true,
    },
  });

  if (!session) {
    throw new Error("No active patron session");
  }

  const patron = session.patron;

  // Capture should only happen for problematic patrons
  if (patron.status !== "PROBLEMATIC_PATRON") {
    throw new Error("Image capture is only required for problematic patrons");
  }

  // Find book
  const book = await prisma.book.findUnique({
    where: {
      rfid_bid: bookRfid,
    },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  // Make sure this is the book that was scanned for this session
  if (book.location !== "ON_SHELF") {
    throw new Error("Book is no longer available on the shelf");
  }

  const fileName = path.basename(imagePath);

  // Update book location
  const updatedBook = await prisma.book.update({
    where: {
      id: book.id,
    },
    data: {
      location: "IN_LIBRARY",
    },
  });

  // Record activity with image
  const activity = await prisma.shelfActivity.create({
    data: {
      patronRfid: patron.rfid_uid,
      bookRfid: book.rfid_bid,
      imageUrl: `/uploads/shelf/${fileName}`,
      eventType: "BOOK_PICKED",
    },
  });

  // Close session
  await prisma.smartShelfSession.update({
    where: {
      id: session.id,
    },
    data: {
      active: false,
      endedAt: new Date(),
    },
  });

  return {
    sessionId: session.id,

    patron: {
      id: patron.id,
      fullName: patron.fullName,
      rfid_uid: patron.rfid_uid,
      status: patron.status,
    },

    book: {
      id: updatedBook.id,
      bookTitle: updatedBook.bookTitle,
      rfid_bid: updatedBook.rfid_bid,
      location: updatedBook.location,
    },

    imageUrl: `/uploads/shelf/${fileName}`,

    eventType: "BOOK_PICKED",

    message: "Photo captured and book picked successfully.",
  };
};

module.exports = {
  scanPatron,
  scanBook,
  capture,
};
