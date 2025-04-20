
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText, MessageSquare, User, Calendar, LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import CVForm from "@/components/CVForm";
import Messages from "@/components/Messages";
import InterviewTab from "@/components/InterviewTab";
import { supabase } from "@/integrations/supabase/client";
import JobListings from "@/components/JobListings";
import ProfileTab from "@/components/ProfileTab";

const ClientDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found, redirecting to login");
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page",
          variant: "destructive",
        });
        navigate("/applicant/login");
      } else {
        console.log("Session found:", session.user.id);
        setAuthCheckComplete(true);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to login");
        navigate("/applicant/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const { data: existingCV, isLoading, error: cvError } = useQuery({
    queryKey: ['userCV'],
    queryFn: async () => {
      console.log("Fetching user CV");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found when fetching CV");
        throw new Error('No user found');
      }
      console.log("User ID for CV fetch:", user.id);

      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching CV:", error);
        throw error;
      }
      
      console.log("CV data fetched:", data);
      return data;
    },
    enabled: authCheckComplete,
  });

  const { data: unreadMessagesCount } = useQuery({
    queryKey: ['unreadMessages'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: cv, error: cvError } = await supabase
        .from("cvs")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (cvError) throw cvError;
      if (!cv) return 0;

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('cv_id', cv.id)
        .eq('read', false);
      
      if (error) throw error;
      return count;
    },
    enabled: !!existingCV,
  });

  const { data: upcomingInterviews } = useQuery({
    queryKey: ['upcomingInterviews'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: cv, error: cvError } = await supabase
        .from("cvs")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (cvError) throw cvError;
      if (!cv) return 0;

      const { count, error } = await supabase
        .from('interviews')
        .select('*', { count: 'exact' })
        .eq('cv_id', cv.id)
        .gt('scheduled_at', new Date().toISOString());
      
      if (error) throw error;
      return count;
    },
    enabled: !!existingCV,
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "You have been logged out successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  if (!authCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <Spinner />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <Spinner />
        <span className="ml-2">Loading your profile...</span>
      </div>
    );
  }

  if (cvError) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-primary p-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 max-w-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>Error loading your CV: {cvError.message}</p>
        </div>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['userCV'] })}>
          Try Again
        </Button>
        <Button variant="ghost" onClick={handleLogout} className="mt-2">
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-karla font-semibold text-secondary">
            {existingCV ? `Welcome back, ${existingCV.applicant_name}` : 'Welcome to the Recruitment Portal'}
          </h1>
          <Button variant="destructive" className="rounded-xl gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Job Listings
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Interviews
              {upcomingInterviews && upcomingInterviews > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {upcomingInterviews}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
              {unreadMessagesCount && unreadMessagesCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadMessagesCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <JobListings />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="interviews">
            <InterviewTab />
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-medium font-karla">Messages</h2>
                <p className="text-muted-foreground font-inconsolata">
                  View messages from administrators
                </p>
              </CardHeader>
              <CardContent>
                <Messages />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
