
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, SortAsc, MessageSquare, Settings } from "lucide-react";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-[88px] bg-black flex flex-col items-center py-8 text-white">
      <div className="mb-12">
        <span className="text-xl font-bold">Cona</span>
      </div>
      <nav className="flex flex-col items-center space-y-8">
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${isActive('/admin/dashboard') ? 'bg-gray-700' : ''} text-white`} 
          onClick={() => navigate("/admin/dashboard")}
        >
          <Home className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${isActive('/admin/sorting') ? 'bg-gray-700' : ''} text-white`} 
          onClick={() => navigate("/admin/sorting")}
        >
          <SortAsc className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${isActive('/admin/messages') ? 'bg-gray-700' : ''} text-white`} 
          onClick={() => navigate("/admin/messages")}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${isActive('/admin/settings') ? 'bg-gray-700' : ''} text-white`}
          onClick={() => navigate("/admin/settings")}
        >
          <Settings className="h-6 w-6" />
        </Button>
      </nav>
    </div>
  );
};
