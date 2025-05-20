import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/useAuth";

const PublicRoutes: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const savedToken: string | null = sessionStorage.getItem("token");
  const token: string | null = savedToken ? JSON.parse(savedToken) : null;

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate(`/school/${user?.schoolId}/college`);
    }
  }, [token, navigate, user?.schoolId]);

  return <>{children}</>;
};

export default PublicRoutes;
