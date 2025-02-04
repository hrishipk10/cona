import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoginPageProps {
  type: "admin" | "applicant";
}

const LoginPage = ({ type }: LoginPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === "admin") {
        // Keep existing admin login logic
        if (email === "admin" && password === "admin") {
          toast({
            title: "Login successful",
            description: "Redirecting to dashboard...",
          });
          navigate("/admin/dashboard");
        } else {
          toast({
            title: "Login failed",
            description: "Invalid credentials. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Handle applicant authentication with Supabase
        if (isSignUp) {
          // Validate password before signup
          const passwordError = validatePassword(password);
          if (passwordError) {
            toast({
              title: "Validation Error",
              description: passwordError,
              variant: "destructive",
            });
            setLoading(false);
            return;
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin + '/client/dashboard'
            }
          });

          console.log("Signup response:", { data, error }); // Debug log

          if (error) {
            toast({
              title: "Signup failed",
              description: error.message,
              variant: "destructive",
            });
          } else if (data.user) {
            toast({
              title: "Signup successful",
              description: "Please check your email to verify your account.",
            });
            // Clear form
            setEmail("");
            setPassword("");
            setIsSignUp(false);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          } else if (data.user) {
            toast({
              title: "Login successful",
              description: "Redirecting to dashboard...",
            });
            navigate("/client/dashboard");
          }
        }
      }
    } catch (error) {
      console.error("Auth error:", error); // Debug log
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

      {/* Right side with login/signup form */}
      <div className="bg-background flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur">
          <CardHeader>
            <h2 className="text-3xl font-semibold text-center text-primary mb-2">
              {type === "admin" 
                ? "Admin Login" 
                : isSignUp ? "Create Account" : "Applicant Login"}
            </h2>
            <p className="text-muted-foreground text-center">
              {type === "admin"
                ? "Access the CV management dashboard"
                : isSignUp 
                  ? "Sign up to submit your CV"
                  : "Login to track your application"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative">
                <User2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
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
                  disabled={loading}
                  required
                  minLength={6}
                />
                {isSignUp && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Login")}
              </Button>
            </form>

            {type === "applicant" && (
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  disabled={loading}
                >
                  {isSignUp 
                    ? "Already have an account? Login" 
                    : "Don't have an account? Sign Up"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;