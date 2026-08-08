const prisma = require("../config/prisma");

const create = async (bookData) => {
  const { bookTitle, rfid_bid, shelfName } = bookData;

  // Check if book already exists
  const existingBook = await prisma.book.findUnique({
    where: {
      rfid_bid,
    },
  });

  if (existingBook) {
    throw new Error("Book already exists.");
  }

  // Check if shelf exists
  const shelf = await prisma.shelf.findUnique({
    where: {
      shelfName: shelfName,
    },
  });

  if (!shelf) {
    throw new Error("Shelf not found.");
  }

  // Create book
  const book = await prisma.book.create({
    data: {
      bookTitle,
      rfid_bid,
      shelf: {
        connect: {
          id: shelf.id,
        },
      },
    },
  });

  return {
    id: book.id,
    bookTitle: book.bookTitle,
    rfid_bid: book.rfid_bid,
    shelfName: book.shelfName,
  };
};

module.exports = {
  create,
};
