import api from "./axios";

export const getBorrowings = async () => {
  const response = await api.get("/borrowing/all");

  return response.data;
};

export const borrowBook = async (borrowingData) => {
  const response = await api.post("/borrowing/borrow", borrowingData);

  return response.data;
};
