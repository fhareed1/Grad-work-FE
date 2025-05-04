export interface UserType {
  id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: RoleType;
  schoolId: string;
  departmentId?: string;
}

export interface LoginType {
  email: string;
  password: string;
}

export interface SignUpType {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: RoleType;
  schoolId: string;
  departmentId?: string;
}

export interface collegeType {
  id: string;
  name: string;
}

export interface departmentType {
  id: string;
  name: string;
}

export enum RoleType {
  STUDENT = "STUDENT",
  FACULTY = "FACULTY",
}
