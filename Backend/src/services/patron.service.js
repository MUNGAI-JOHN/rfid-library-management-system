const prisma = require("../config/prisma");

const create = async (patronData) => {
  const { fullName, rfid_uid } = patronData;

  // Check if patron already exists
  const existingPatron = await prisma.patron.findUnique({
    where: {
      rfid_uid,
    },
  });

  if (existingPatron) {
    throw new Error("Patron already exists.");
  }

  // Create patron
  const patron = await prisma.patron.create({
    data: {
      fullName,
      rfid_uid,
    },
  });

  return {
    id: patron.id,
    fullName: patron.fullName,
    rfid_uid: patron.rfid_uid,
  };
};

const getAll = async () => {
  const patrons = await prisma.patron.findMany({
    orderBy: {
      id: "desc",
    },
  });
  return patrons;
};

const update = async (id, patronData) => {
  const { fullName, rfid_uid, status } = patronData;

  const patron = await prisma.patron.update({
    where: {
      id: Number(id),
    },
    data: {
      fullName,
      rfid_uid,
      status,
    },
  });

  return patron;
};

module.exports = {
  create,
  getAll,
  update,
  // getPatronsByStatus,
};
