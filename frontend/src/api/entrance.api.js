import api from "./axios";

export const getEntranceLogs = async () => {
  const response = await api.get("/entrance/entrancelog");

  return response.data;
};

export const scanEntrance = async (patronRfid) => {
  const response = await api.post("/entrance/scan", {
    patronRfid,
  });

  return response.data;
};
