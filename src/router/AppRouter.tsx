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
import ProtectedRoutes from "./ProtectedRouter";
import PublicRoutes from "./PublicRoutes";

const AppRouter = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      {/* Public (auth) routes */}
      <Route
        path={ROUTES.login}
        element={
          <PublicRoutes>
            <Login />
          </PublicRoutes>
        }
      />
      <Route
        path={ROUTES.signUp}
        element={
          <PublicRoutes>
            <Signup />
          </PublicRoutes>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />

      <Route element={<ProtectedRoutes />}>
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
      </Route>
    </Routes>
  );
};

export default AppRouter;
