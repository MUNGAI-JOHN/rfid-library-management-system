const prisma = require("../config/prisma");
const notificationService = require("./notification.service");

const enterLibrary = async (patronRfid) => {
  const patron = await prisma.patron.findUnique({
    where: {
      rfid_uid: patronRfid,
    },
  });

  if (!patron) {
    throw new Error("Patron not found.");
  }

  const entrance = await prisma.entranceLogs.create({
    data: {
      patronRfid,
    },
  });

  let notification = null;

  if (patron.status === "PROBLEMATIC_PATRON") {
    notification = await notificationService.createNotification({
      title: "Problematic Patron Detected",
      message: `${patron.fullName} entered the library and is marked as a problematic patron.`,
      type: "PROBLEMATIC_PATRON",
      priority: "HIGH",
      patronRfid: patron.rfid_uid,
    });
  }

  return {
    entrance,
    patron: {
      id: patron.id,
      fullName: patron.fullName,
      rfid_uid: patron.rfid_uid,
      status: patron.status,
    },
    notification,
  };
};

const getEntranceLog = async () => {
  const entranceLog = await prisma.entranceLogs.findMany({
    orderBy: {
      id: "desc",
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
    },
  });
  return entranceLog;
};

module.exports = {
  enterLibrary,
  getEntranceLog,
};
