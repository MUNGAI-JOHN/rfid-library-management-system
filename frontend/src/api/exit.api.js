import api from "./axios";

export const getExitLogs = async () => {
  const response = await api.get("/exit/exitlog");

  return response.data;
};

export const scanExit = async (patronRfid, bookRfid = null) => {
  const response = await api.post("/exit/scan", {
    patronRfid,
    bookRfid,
  });

  return response.data;
};
