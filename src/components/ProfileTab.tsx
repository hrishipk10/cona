import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { User, Upload } from "lucide-react";

const ProfileTab = () => {
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>
            <User className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Picture
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={profile?.applicant_name || ""}
            readOnly={!isEditing}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile?.email || ""}
            readOnly={!isEditing}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={profile?.phone || ""}
            readOnly={!isEditing}
          />
        </div>
      </div>

      <Button
        onClick={() => setIsEditing(!isEditing)}
        variant={isEditing ? "default" : "outline"}
      >
        {isEditing ? "Save Changes" : "Edit Profile"}
      </Button>
    </div>
  );
};

export default ProfileTab;