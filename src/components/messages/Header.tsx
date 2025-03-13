
import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <div className="bg-secondary backdrop-blur rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Messages & Interviews</h1>
        <div className="flex items-center space-x-4">
          <Button variant="destructive" className="rounded-xl gap-2" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
          <Avatar className="bg-foreground">
            <AvatarImage src="/avatars/batman.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default Header;
