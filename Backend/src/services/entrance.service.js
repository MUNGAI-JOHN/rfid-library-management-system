const prisma = require("../config/prisma");

const enterLibrary = async (patronRfid) => {
  const patron = await prisma.patron.findUnique({
    where: {
      rfid_uid: patronRfid,
    },
  });

  if (!patron) {
    throw new Error("Patron not found.");
  }

  // if (patron.status === "PROBLEMATIC_PATRON") {
  //   throw new Error("Access denied. Patron is blacklisted.");
  // }

  const entrance = await prisma.entranceLogs.create({
    data: {
      patronRfid,
    },
  });

  return entrance;
};

const getEntranceLog = async () => {
  const entranceLog = await prisma.entranceLogs.findMany({
    orderBy: {
      id: "desc",
    },
  });
  return entranceLog;
};

module.exports = {
  enterLibrary,
  getEntranceLog,
};
