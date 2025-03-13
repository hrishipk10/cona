
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  userName?: string;
}

export const DashboardHeader = ({ userName = "James" }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-foreground-secondary font-bold">Good morning, {userName}!</h1>
      <div className="flex items-center space-x-4">
        <Button variant="destructive" className="rounded-xl gap-2" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
        <Avatar className="bg-foreground">
          <AvatarImage src="/avatars/batman.jpg" />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};
