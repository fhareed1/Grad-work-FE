import apiClient from "@/config/axiosInstance";

// Get all departments in a college
const getAllDepartments = async (school_id: string, college_id: string) => {
  const response = await apiClient.get(
    `/school/${school_id}/college/${college_id}/departments`
  );

  return response.data;
};

// Get all supervisors in a department
const getAllSupervisors = async (department_id: string) => {
  const response = await apiClient.get(
    `/school/project/department/${department_id}/supervisors`
  );

  return response.data;
};

const departmentServices = {
  getAllDepartments,
  getAllSupervisors,
};

export default departmentServices;
