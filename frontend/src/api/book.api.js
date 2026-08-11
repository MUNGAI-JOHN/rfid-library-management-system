import api from "./axios";

export const createBook = async (bookData) => {
  const response = await api.post("/book/create", bookData);

  return response.data;
};
export const getBooks = async () => {
  const response = await api.get("/book/all");

  return response.data;
};
