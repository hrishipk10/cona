import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthCard from "./AuthCard";

const LoginPage = ({ type }: { type: "admin" | "applicant" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!validatePassword(password)) {
        toast({
          title: "Invalid Password",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        return;
      }

      if (e.currentTarget.dataset.action === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account Exists",
              description: "An account with this email already exists. Please log in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Signup Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else if (data.user) {
          toast({
            title: "Signup Successful",
            description: "Please check your email to verify your account before logging in.",
          });
          setEmail("");
          setPassword("");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else if (data.user) {
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          navigate(`/${type}/dashboard`);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title={type === "admin" ? "Admin Portal" : "Applicant Portal"}
      subtitle={`${type === "admin" ? "Admin access" : "Apply for positions"}`}
    >
      <form className="space-y-4" onSubmit={handleAuth}>
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <p className="text-sm text-gray-500">
            Password must be at least 6 characters long
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1"
            data-action="login"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Login"}
          </Button>
          <Button
            type="submit"
            variant="outline"
            className="flex-1"
            data-action="signup"
            disabled={isLoading}
            onClick={handleAuth}
          >
            {isLoading ? "Loading..." : "Sign Up"}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};

export default LoginPage;