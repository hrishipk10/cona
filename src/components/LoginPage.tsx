import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  type: "admin" | "applicant";
}

const LoginPage = ({ type }: LoginPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For testing purposes only - hardcoded credentials
    if (username === "admin" && password === "admin") {
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      if (type === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/client/dashboard");
      }
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side with logo */}
      <div className="bg-primary relative hidden md:flex flex-col items-center justify-center p-8">
        <div className="absolute inset-0 curved-lines" />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-light text-secondary mb-2">Cona</h1>
          <p className="text-secondary/80 text-lg tracking-wider">
            CV MANAGEMENT SYSTEM
          </p>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="bg-background flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur">
          <CardHeader>
            <h2 className="text-3xl font-semibold text-center text-primary mb-2">
              {type === "admin" ? "Admin Login" : "Applicant Login"}
            </h2>
            <p className="text-muted-foreground text-center">
              {type === "admin"
                ? "Access the CV management dashboard"
                : "Submit and track your application"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Username"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;