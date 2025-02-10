
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoginPage from "@/components/LoginPage";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is admin before navigating
  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin || false;
  };

  const handleAdminAuth = async (email: string, password: string) => {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login failed",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
      return false;
    }

    if (user) {
      const isAdmin = await checkAdminStatus(user.id);
      if (!isAdmin) {
        toast({
          title: "Access denied",
          description: "This account does not have admin privileges",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return false;
      }
      toast({
        title: "Login successful",
        description: "Welcome back, admin!",
      });
      return true;
    }

    return false;
  };

  return (
    <LoginPage 
      type="admin" 
      customAuthHandler={handleAdminAuth}
      defaultEmail="admin@gmail.com"
    />
  );
};

export default AdminLogin;
