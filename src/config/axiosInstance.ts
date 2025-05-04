// import {ROUTES} from '@/router/routes';
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");
    if (token) {
      token = token.replace(/"/g, "");
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log("From interceptors: ", response);
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // localStorage.removeItem("token");
      console.log("Token would have been removed");
      // window.location.href = ROUTES.login;
    }
    return Promise.reject(error);
  }
);

export default apiClient;
