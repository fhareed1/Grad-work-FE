export const ROUTES = {
  // Auth
  login: "/auth/login",
  signUp: "/auth/register",

  // Dashboard
  dashboard: "/school/:schoolId",
  college: "/school/:schoolId/college",
  department: "/school/:schoolId/college/:collegeId/department",
  project: '/school/:schoolId/college/:collegeId/department/:departmentId/projects',
  projectDetails: '/school/:schoolId/college/:collegeId/department/:departmentId/project/:projectId'
};
