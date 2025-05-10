import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { ROUTES } from "./routes";

const ProtectedRoutes = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const token = savedToken ? JSON.parse(savedToken) : null;

    if (!token) {
      navigate(ROUTES.login, { replace: true });
    } else {
      setIsLoading(false); 
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoutes;
