import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Home } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-card/95 backdrop-blur border border-border rounded-lg p-2 shadow-lg">
        <Button
          asChild
          variant={location.pathname === "/" ? "default" : "ghost"}
          size="sm"
        >
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Formulário
          </Link>
        </Button>
        
        <Button
          asChild
          variant={location.pathname === "/dashboard" ? "default" : "ghost"}
          size="sm"
        >
          <Link to="/dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        
        <Button
          asChild
          variant={location.pathname === "/pedidos" ? "default" : "ghost"}
          size="sm"
        >
          <Link to="/pedidos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pedidos
          </Link>
        </Button>
      </div>
    </nav>
  );
};