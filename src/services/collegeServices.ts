import apiClient from "@/config/axiosInstance";

// Get all colleges
const getAllColleges = async (school_id: string) => {
  const response = await apiClient.get(`/school/${school_id}/college`);
  return response.data;
};

const collegeServices = {
  getAllColleges,
};

export default collegeServices;
