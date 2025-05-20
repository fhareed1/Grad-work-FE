import apiClient from "@/config/axiosInstance";
import { LoginType, SignUpType } from "@/types/auth";

const login = async (payload: LoginType) => {
  const response = await apiClient.post("/auth/login", payload);

  sessionStorage.setItem("token", JSON.stringify(response.data.token));
  sessionStorage.setItem("user", JSON.stringify(response.data.user));
  return response;
};

const signUp = async (payload: SignUpType) => {
  const response = await apiClient.post("/auth/register", payload);
  // // Store the token
  // sessionStorage.setItem("token", response.data.token);
  // // Store user data
  // sessionStorage.setItem("user", JSON.stringify(response.data.user));
  return response;
};

const logout = () => {
  sessionStorage.clear();
};

const authServices = {
  logout,
  login,
  signUp,
};

export default authServices;
