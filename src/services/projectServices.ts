import apiClient from "@/config/axiosInstance";
import { CreateProjectPayload } from "@/types/project";

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

  return response.data;
};

// Create a new project
const createProject = async (payload: CreateProjectPayload, school_id: string) => {
  const response = await apiClient.post(
    `/school/${school_id}/project`,
    payload
  );
  return response;
};

const projectServices = {
  getAllProjects,
  getProjectById,
  createProject,
};

export default projectServices;
