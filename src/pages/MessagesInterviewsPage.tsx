
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { LogOut, Home, SortAsc, MessageCircle, Settings, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type Interview = Database["public"]["Tables"]["interviews"]["Row"] & { cvs?: { applicant_name: string } };

const MessagesInterviewsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Query for fetching all CVs
  const { data: cvs, isLoading: cvsLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: async () => {
      console.log("Fetching CVs");
      const { data, error } = await supabase
        .from("cvs")
        .select("*")
        .order("application_date", { ascending: false });
      
      if (error) {
        console.error("Error fetching CVs:", error);
        throw error;
      }
      console.log("CVs fetched:", data);
      return data as CV[];
    },
  });

  // Query for fetching all interviews
  const { data: interviews, isLoading: interviewsLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interviews")
        .select("*, cvs(applicant_name)")
        .order("scheduled_at", { ascending: true });
      
      if (error) throw error;
      return data as Interview[];
    },
  });

  // Mutation for sending a message
  const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
    mutationFn: async (data: { cv_id: string; message: string }) => {
      const { error } = await supabase
        .from("messages")
        .insert([
          {
            user_id: data.cv_id, // Using cv_id as the user_id for now
            message: data.message,
            read: false,
          },
        ]);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating an interview date
  const { mutate: updateInterviewDate, isPending: isUpdatingInterview } = useMutation({
    mutationFn: async (data: { cv_id: string; date: Date }) => {
      // Check if an interview already exists for this CV
      const { data: existingInterview, error: fetchError } = await supabase
        .from("interviews")
        .select("id")
        .eq("cv_id", data.cv_id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingInterview) {
        // Update existing interview
        const { error } = await supabase
          .from("interviews")
          .update({
            scheduled_at: data.date.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingInterview.id);
        
        if (error) throw error;
      } else {
        // Create new interview
        const { error } = await supabase
          .from("interviews")
          .insert([
            {
              cv_id: data.cv_id,
              scheduled_at: data.date.toISOString(),
              status: "scheduled",
            },
          ]);
        
        if (error) throw error;
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Interview scheduled",
        description: "The interview has been scheduled successfully",
      });
      setSelectedDate(undefined);
      setSelectedCvId(null);
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to schedule interview: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter CVs by status
  const acceptedCvs = cvs?.filter(cv => cv.status === "accepted") || [];
  const rejectedCvs = cvs?.filter(cv => cv.status === "rejected") || [];
  
  console.log("Accepted CVs:", acceptedCvs);
  console.log("Rejected CVs:", rejectedCvs);

  // Helper function to find interview for a CV
  const findInterviewForCv = (cvId: string) => {
    return interviews?.find(interview => interview.cv_id === cvId);
  };

  // Handle form submission for messages
  const handleSendMessage = (cvId: string) => {
    if (message.trim()) {
      sendMessage({
        cv_id: cvId,
        message: message.trim(),
      });
    }
  };

  // Handle updating interview date
  const handleUpdateInterviewDate = () => {
    if (selectedCvId && selectedDate) {
      updateInterviewDate({
        cv_id: selectedCvId,
        date: selectedDate,
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (cvsLoading || interviewsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-primary relative hidden md:flex flex-col items-center justify-center p-8 min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-[88px] bg-black flex flex-col items-center py-8 text-white">
        <div className="mb-12">
          <span className="text-xl font-bold">Cona</span>
        </div>
        <div className="flex flex-col items-center space-y-8">
          <Button variant="ghost" size="icon" className="text-white" onClick={() => navigate("/admin/dashboard")}>
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white" onClick={() => navigate("/admin/sorting")}>
            <SortAsc className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white bg-gray-700" onClick={() => navigate("/admin/messages")}>
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-[88px] p-6 w-full">
        <div className="bg-secondary backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Messages & Interviews</h1>
            <div className="flex items-center space-x-4">
              <Button variant="destructive" className="rounded-xl gap-2" onClick={handleLogout}>
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

        <Tabs defaultValue="accepted" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="accepted">Accepted CVs</TabsTrigger>
            <TabsTrigger value="rejected">Rejected CVs</TabsTrigger>
          </TabsList>

          <TabsContent value="accepted">
            <div className="grid grid-cols-1 gap-4">
              {acceptedCvs.length > 0 ? (
                acceptedCvs.map((cv) => {
                  const interview = findInterviewForCv(cv.id);
                  return (
                    <Card key={cv.id} className="bg-white shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12 mt-1">
                              {cv.avatar_url ? (
                                <AvatarImage src={cv.avatar_url} alt={cv.applicant_name} />
                              ) : (
                                <AvatarFallback>{cv.applicant_name.charAt(0)}</AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <h3 className="font-bold text-lg">{cv.applicant_name}</h3>
                              <p className="text-sm text-gray-500">{cv.current_job_title || "Applicant"} • {cv.years_experience} years</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {cv.skills && cv.skills.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {cv.skills && cv.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{cv.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                              {interview && (
                                <p className="mt-2 text-sm">
                                  <span className="font-medium">Interview:</span>{" "}
                                  {format(new Date(interview.scheduled_at), "PPP 'at' p")}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Schedule Interview
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="end">
                                <div className="p-4">
                                  <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                      setSelectedDate(date);
                                      setSelectedCvId(cv.id);
                                    }}
                                    initialFocus
                                  />
                                  <div className="flex justify-end mt-4">
                                    <Button 
                                      size="sm" 
                                      onClick={handleUpdateInterviewDate}
                                      disabled={!selectedDate || selectedCvId !== cv.id || isUpdatingInterview}
                                    >
                                      {interview ? 'Update Interview' : 'Schedule Interview'}
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Send Message
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80" align="end">
                                <div className="space-y-4">
                                  <h4 className="font-medium">Send Message to {cv.applicant_name}</h4>
                                  <Input
                                    placeholder="Type your message here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                  />
                                  <div className="flex justify-end">
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleSendMessage(cv.id)}
                                      disabled={!message.trim() || isSendingMessage}
                                    >
                                      Send
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>

                            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/cv/${cv.id}`)}>
                              View CV <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center p-8 bg-white rounded-lg">
                  <p className="text-gray-500">No accepted applications yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected">
            <div className="grid grid-cols-1 gap-4">
              {rejectedCvs.length > 0 ? (
                rejectedCvs.map((cv) => (
                  <Card key={cv.id} className="bg-white shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12 mt-1">
                            {cv.avatar_url ? (
                              <AvatarImage src={cv.avatar_url} alt={cv.applicant_name} />
                            ) : (
                              <AvatarFallback>{cv.applicant_name.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg">{cv.applicant_name}</h3>
                            <p className="text-sm text-gray-500">{cv.current_job_title || "Applicant"} • {cv.years_experience} years</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {cv.skills && cv.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {cv.skills && cv.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{cv.skills.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                Send Message
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="end">
                              <div className="space-y-4">
                                <h4 className="font-medium">Send Message to {cv.applicant_name}</h4>
                                <Input
                                  placeholder="Type your message here..."
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                />
                                <div className="flex justify-end">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSendMessage(cv.id)}
                                    disabled={!message.trim() || isSendingMessage}
                                  >
                                    Send
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>

                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/cv/${cv.id}`)}>
                            View CV <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8 bg-white rounded-lg">
                  <p className="text-gray-500">No rejected applications yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MessagesInterviewsPage;
