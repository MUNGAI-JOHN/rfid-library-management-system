const prisma = require("../config/prisma");

const create = async ({ shelfName, description }) => {
  const existingShelf = await prisma.shelf.findUnique({
    where: {
      shelfName,
    },
  });

  if (existingShelf) {
    throw new Error("Shelf already exists.");
  }

  return await prisma.shelf.create({
    data: {
      shelfName,
      description,
    },
  });
};

const getAllShelves = async () => {
  return await prisma.shelf.findMany({
    orderBy: {
      shelfName: "asc",
    },

    include: {
      books: {
        where: {
          location: "ON_SHELF",
        },

        orderBy: {
          bookTitle: "asc",
        },

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

const getShelfById = async (id) => {
  return await prisma.shelf.findUnique({
    where: {
      id: Number(id),
    },

    include: {
      books: {
        where: {
          location: "ON_SHELF",
        },

        orderBy: {
          bookTitle: "asc",
        },

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
  create,
  getAllShelves,
  getShelfById,
};
