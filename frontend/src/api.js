import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.44:8000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = token;
  return req;
});

export default API;
