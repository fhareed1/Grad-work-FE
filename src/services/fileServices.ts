import apiClient from "@/config/axiosInstance";
import { filePayloadType } from "@/types/file";

// Create a file data
const createFile = async (payload: filePayloadType) => {
  const response = await apiClient.post("/file", payload);
  return response.data;
};

const fileServices = {
  createFile,
};

export default fileServices;
