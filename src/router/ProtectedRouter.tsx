import {useState, useEffect} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {Loader} from 'lucide-react';
import { ROUTES } from './routes';


const ProtectedRoutes = () => {
  const [isLoading, setIsLoading] = useState(true);
  const savedToken: string | null = localStorage.getItem('token');
  const token: string | null = savedToken ? JSON.parse(savedToken) : null;

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate(ROUTES.login);
    }
    setIsLoading(false);
  }, [token, navigate]);

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
