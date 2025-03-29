
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, SortAsc, MessageSquare, Settings } from "lucide-react";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 h-full w-[88px] bg-black flex flex-col items-center py-8 text-white">
      <div className="mb-12">
        <span className="text-xl font-bold">Cona</span>
      </div>
      <div className="flex flex-col items-center space-y-8">
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${location.pathname.includes('/admin/dashboard') ? 'bg-gray-700' : ''} text-white`} 
          onClick={() => navigate("/admin/dashboard")}
        >
          <Home className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${location.pathname.includes('/admin/sorting') ? 'bg-gray-700' : ''} text-white`} 
          onClick={() => navigate("/admin/sorting")}
        >
          <SortAsc className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${location.pathname.includes('/admin/messages') ? 'bg-gray-700' : ''} text-white`} 
          onClick={() => navigate("/admin/messages")}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white">
          <Settings className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
