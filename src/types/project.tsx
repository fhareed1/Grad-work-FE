import { DepartmentType } from "./department";
import { Tag } from "./tag";

export interface Author {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  departmentId: string | null;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supervisor {
  id: string;
  name: string;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  projectId: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  title: string;
  abstract?: string | null;
  visibility?: string;
  authorsId?: string[];
  supervisorId?: string;
  newSupervisor?: { name: string };
  departmentId: string;
  schoolId?: string;
  year: string;
  keywords?: string[];
  customFields?: Record<string, unknown> | null;

  categories?: string[];
  tags?: Tag[];
  files?: ProjectFile[];
}

export interface ProjectData {
  id: string;
  title: string;
  abstract: string | null;
  visibility: string;
  supervisorId: string;
  departmentId: string;
  schoolId: string;
  year: number;
  createdAt: string;
  updatedAt: string;
  completionDate: string | null;
  keywords: string[];
  customFields: Record<string, unknown> | null;
  authors: Author[];
  supervisor: Supervisor;
  department: DepartmentType;
  school: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    archivedAt: string | null;
    settings: Record<string, unknown> | null;
  };
  categories: string[];
  tags: Tag[];
  files: ProjectFile[];
  views?: number;
  downloads?: number;
  likes?: number;
  thumbnail?: string;
}
