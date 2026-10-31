import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5121/api",
// });

const api = axios.create({
  baseURL: "https://rfid-library-management-system-62xu.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
