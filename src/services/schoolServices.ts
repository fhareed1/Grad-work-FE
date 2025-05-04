import apiClient from "@/config/axiosInstance";

// Get all schools
const getAllSchools = async () => {
  const response = await apiClient.get("/school");
  return response.data;
};

const schoolServices = {
  getAllSchools,
};

export default schoolServices;
