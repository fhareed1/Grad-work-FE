import { ROUTES } from "./routes";
import { Route, Routes } from "react-router-dom";
import { NotFound } from "@/pages/not-found/not-found";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import Dashboard from "@/pages/dashboard";
import College from "@/pages/dashboard/college";
import Department from "@/pages/dashboard/department";
import Projects from "@/pages/dashboard/project/project";
import ProjectDetails from "@/pages/dashboard/project/projectDetails";

const AppRouter = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path={ROUTES.signUp} element={<Signup />} />
      <Route path={ROUTES.login} element={<Login />} />
      <Route path="*" element={<NotFound />} />

      {/* Project Routes */}
      <Route path={ROUTES.dashboard} element={<Dashboard />}>
        {/* College */}
        <Route path={ROUTES.college} element={<College />} />

        {/* Department */}
        <Route path={ROUTES.department} element={<Department />} />

        {/* Projects */}
        <Route path={ROUTES.project} element={<Projects />} />
        <Route path={ROUTES.projectDetails} element={<ProjectDetails />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
