import api from "./axios";

export const createPatron = async (patronData) => {
  const response = await api.post("/patron/create", patronData);

  return response.data;
};
export const getPatrons = async () => {
  const response = await api.get("/patron/getAll");

  return response.data;
};
export const updatePatron = async (id, patronData) => {
  const response = await api.put(`/patron/${id}`, patronData);

  return response.data;
};
