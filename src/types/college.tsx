import { DepartmentWithProjectCount } from "./department";

export type CollegeWithDepartments = {
  id: string;
  name: string;
  image: string;
  schoolId: string;
  departments: DepartmentWithProjectCount[];
  projects?: number; // Will be added in frontend
};
