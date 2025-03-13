
import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type Interview = Database["public"]["Tables"]["interviews"]["Row"] & { cvs?: { applicant_name: string } };

interface CVCardProps {
  cv: CV;
  interview?: Interview;
  onSendMessage: (cvId: string, message: string) => void;
  message: string;
  setMessage: (message: string) => void;
  isSendingMessage: boolean;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedCvId: string | null;
  setSelectedCvId: (id: string | null) => void;
}

const CVCard: React.FC<CVCardProps> = ({
  cv,
  interview,
  onSendMessage,
  message,
  setMessage,
  isSendingMessage,
  selectedDate,
  setSelectedDate,
  selectedCvId,
  setSelectedCvId,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Handle updating interview date
  const handleUpdateInterviewDate = () => {
    if (selectedCvId && selectedDate) {
      updateInterviewDate({
        cv_id: selectedCvId,
        date: selectedDate,
      });
    }
  };

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
                {cv.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {cv.skills.length > 3 && (
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
            {cv.status === "accepted" && (
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
            )}
            
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
                      onClick={() => onSendMessage(cv.id)}
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
};

export default CVCard;
