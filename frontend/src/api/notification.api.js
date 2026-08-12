import api from "./axios";

export const getAllNotifications = async () => {
  const response = await api.get("/notification/all");

  return response.data;
};

export const getUnreadNotifications = async () => {
  const response = await api.get("/notification/unread");

  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notification/${id}/read`);

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/notification/read-all");

  return response.data;
};
