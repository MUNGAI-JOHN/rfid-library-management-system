import api from "./axios";

export const createShelf = async (shelfData) => {
  const response = await api.post("/shelf/create", shelfData);

  return response.data;
};

export const getShelves = async () => {
  const response = await api.get("/shelf/all");

  return response.data;
};

export const getShelfById = async (id) => {
  const response = await api.get(`/shelf/${id}`);

  return response.data;
};
