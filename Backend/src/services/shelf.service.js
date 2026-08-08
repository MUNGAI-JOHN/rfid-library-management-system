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

const getAll = async () => {
  return await prisma.shelf.findMany({
    orderBy: {
      shelfName: "asc",
    },
  });
};

module.exports = {
  create,
  getAll,
};
