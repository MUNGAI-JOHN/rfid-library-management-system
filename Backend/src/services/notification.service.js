const prisma = require("../config/prisma");

const createNotification = async ({
  title,
  message,
  type,
  priority = "NORMAL",
  patronRfid = null,
  bookRfid = null,
  shelfActivityId = null,
}) => {
  return await prisma.notification.create({
    data: {
      title,
      message,
      type,
      priority,
      patronRfid,
      bookRfid,
      shelfActivityId,
    },
  });
};

const getAllNotifications = async () => {
  return await prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      shelfActivity: {
        select: {
          id: true,
          imageUrl: true,
          eventType: true,
          createdAt: true,

          patron: {
            select: {
              id: true,
              fullName: true,
              rfid_uid: true,
              status: true,
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
      },
    },
  });
};

const getUnreadNotifications = async () => {
  return await prisma.notification.findMany({
    where: {
      isRead: false,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      shelfActivity: {
        select: {
          id: true,
          imageUrl: true,
          eventType: true,
          createdAt: true,

          patron: {
            select: {
              id: true,
              fullName: true,
              rfid_uid: true,
              status: true,
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
      },
    },
  });
};

const markAsRead = async (id) => {
  return await prisma.notification.update({
    where: {
      id: Number(id),
    },
    data: {
      isRead: true,
    },
  });
};

const markAllAsRead = async () => {
  return await prisma.notification.updateMany({
    where: {
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
};

module.exports = {
  createNotification,
  getAllNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
};
