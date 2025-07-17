import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Home } from "lucide-react";
export const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-lg px-2 py-2">
        <div className="flex items-center space-x-1">
          <Button
            asChild
            variant={isActive('/') ? 'default' : 'ghost'}
            size="sm"
            className="rounded-full"
          >
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Início
            </Link>
          </Button>
          
          <Button
            asChild
            variant={isActive('/pedidos') ? 'default' : 'ghost'}
            size="sm"
            className="rounded-full"
          >
            <Link to="/pedidos">
              <FileText className="h-4 w-4 mr-2" />
              Pedidos
            </Link>
          </Button>
          
          <Button
            asChild
            variant={isActive('/dashboard') ? 'default' : 'ghost'}
            size="sm"
            className="rounded-full"
          >
            <Link to="/dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};