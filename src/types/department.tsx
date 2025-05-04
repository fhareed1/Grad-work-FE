export interface DepartmentType {
  id: string;
  name: string;
  projects: number;
  image?: string;
}

export interface RawDepartment {
  id: string;
  name: string;
  collegeId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    projects: number;
  };
}

export type DepartmentWithProjectCount = {
  _count: {
    projects: number;
  };
};