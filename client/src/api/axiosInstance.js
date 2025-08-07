import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5100/api/v1", // adjust for deployment
});

axiosInstance.interceptors.request.use((config) => {
  if (!config.headers.Authorization) { // Only add if not already set
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = token;
  }
  return config;

});
export default axiosInstance;
