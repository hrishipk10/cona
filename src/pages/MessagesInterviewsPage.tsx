
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
import { LogOut, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Sidebar } from "@/components/admin/Sidebar";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type Interview = Database["public"]["Tables"]["interviews"]["Row"] & { cvs?: { applicant_name: string } };

const MessagesInterviewsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Add a query to fetch company settings
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching settings:", error);
        throw error;
      }
      
      return data || { company_name: "Cona" }; // Default if no settings found
    },
  });

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

  const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
    mutationFn: async (data: { cv_id: string; message: string }) => {
      console.log("Sending message with cv_id:", data.cv_id);
      const { error } = await supabase
        .from("messages")
        .insert([
          {
            cv_id: data.cv_id,
            message: data.message,
            read: false,
          },
        ]);
      
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
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

  const { mutate: updateInterviewDate, isPending: isUpdatingInterview } = useMutation({
    mutationFn: async (data: { cv_id: string; date: Date }) => {
      // Get the current user's ID to set as recruiter_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User not authenticated");

      console.log("Checking for existing interview with cv_id:", data.cv_id);
      const { data: existingInterview, error: fetchError } = await supabase
        .from("interviews")
        .select("id")
        .eq("cv_id", data.cv_id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking existing interview:", fetchError);
        throw fetchError;
      }

      console.log("Existing interview check result:", existingInterview);

      if (existingInterview) {
        console.log("Updating existing interview:", existingInterview.id);
        const { error } = await supabase
          .from("interviews")
          .update({
            scheduled_at: data.date.toISOString(),
            updated_at: new Date().toISOString(),
            recruiter_id: user.id,
          })
          .eq("id", existingInterview.id);
        
        if (error) {
          console.error("Interview update error:", error);
          throw error;
        }
      } else {
        console.log("Creating new interview for cv_id:", data.cv_id);
        console.log("Current user ID (recruiter_id):", user.id);
        const { error } = await supabase
          .from("interviews")
          .insert([
            {
              cv_id: data.cv_id,
              scheduled_at: data.date.toISOString(),
              status: "scheduled",
              recruiter_id: user.id,
            },
          ]);
        
        if (error) {
          console.error("Interview insertion error:", error);
          throw error;
        }
      }

      // Get the CV to use the applicant name in the message
      const { data: cv, error: cvError } = await supabase
        .from("cvs")
        .select("applicant_name")
        .eq("id", data.cv_id)
        .single();

      if (cvError) {
        console.error("Error fetching CV:", cvError);
        throw cvError;
      }

      const companyName = settings?.company_name || "Cona";
      
      // Send a notification message about the interview to the applicant
      const interview = existingInterview ? "rescheduled" : "scheduled";
      const interviewMessage = `Hello ${cv.applicant_name}, your interview with ${companyName} has been ${interview} for ${format(data.date, "EEEE, MMMM do, yyyy 'at' h:mm a")}. Please make sure you're available at this time.`;
      
      const { error: messageError } = await supabase
        .from("messages")
        .insert([
          {
            cv_id: data.cv_id,
            message: interviewMessage,
            read: false,
          },
        ]);
      
      if (messageError) {
        console.error("Error sending interview message:", messageError);
        throw messageError;
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
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error) => {
      console.error("Failed to schedule interview:", error);
      toast({
        title: "Error",
        description: `Failed to schedule interview: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const acceptedCvs = cvs?.filter(cv => cv.status === "accepted") || [];
  const rejectedCvs = cvs?.filter(cv => cv.status === "rejected") || [];
  
  console.log("Accepted CVs:", acceptedCvs);
  console.log("Rejected CVs:", rejectedCvs);

  const findInterviewForCv = (cvId: string) => {
    return interviews?.find(interview => interview.cv_id === cvId);
  };

  const handleSendMessage = (cvId: string) => {
    if (message.trim()) {
      sendMessage({
        cv_id: cvId,
        message: message.trim(),
      });
    }
  };

  const handleUpdateInterviewDate = () => {
    if (selectedCvId && selectedDate) {
      updateInterviewDate({
        cv_id: selectedCvId,
        date: selectedDate,
      });
    }
  };

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
    <div className="bg-primary relative md:flex flex-col items-center justify-center p-8 min-h-screen">
      <Sidebar />

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
