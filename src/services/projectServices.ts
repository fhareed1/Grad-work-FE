import apiClient from "@/config/axiosInstance";

// Get all projects in a department
const getAllProjects = async (
  school_id: string,
  college_id: string,
  department_id: string
) => {
  const response = await apiClient.get(
    `/school/${school_id}/college/${college_id}/department/${department_id}/project`
  );
  return response.data;
};

// Get a project by ID
const getProjectById = async (
  school_id: string,
  college_id: string,
  department_id: string,
  project_id: string
) => {
  const response = await apiClient.get(
    `/school/${school_id}/college/${college_id}/department/${department_id}/project/${project_id}`
  );
  console.log("projectId: ", response.data);

  return response.data;
};

const projectServices = {
  getAllProjects,
  getProjectById,
};

export default projectServices;
