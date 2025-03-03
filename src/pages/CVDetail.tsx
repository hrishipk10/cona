
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CVDisplay from "@/components/CVDisplay";
import { supabase } from "@/integrations/supabase/client";

const CVDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [interviewDate, setInterviewDate] = useState<Date | undefined>(undefined);
  const [showInterviewDatePicker, setShowInterviewDatePicker] = useState(false);

  const { data: cv, isLoading, error } = useQuery({
    queryKey: ["cv", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cvs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateCVStatus = useMutation({
    mutationFn: async ({ status, interviewDate }: { status: string, interviewDate?: Date }) => {
      // 1. Update CV status
      const { data: updatedCV, error: updateError } = await supabase
        .from("cvs")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      
      if (updateError) throw updateError;

      // 2. If accepted and has interview date, create an interview record
      if (status === "accepted" && interviewDate) {
        const { error: interviewError } = await supabase
          .from("interviews")
          .insert({
            cv_id: id,
            scheduled_at: interviewDate.toISOString(),
            status: "pending",
          });
        
        if (interviewError) throw interviewError;
      }

      // 3. Send a notification message to the user
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          user_id: updatedCV.user_id,
          message: status === "accepted" 
            ? `Your CV has been accepted! ${interviewDate ? `Your interview is scheduled for ${format(interviewDate, 'PPP')} at ${format(interviewDate, 'p')}.` : ''}`
            : "We regret to inform you that your CV has been rejected. Thank you for your interest.",
          read: false
        });
      
      if (messageError) throw messageError;

      return updatedCV;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv", id] });
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast({
        title: "Success",
        description: "CV status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update CV status: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleEdit = () => {
    console.log("Edit CV clicked");
  };

  const handleAccept = () => {
    setShowInterviewDatePicker(true);
  };

  const handleReject = () => {
    updateCVStatus.mutate({ status: "rejected" });
  };

  const handleConfirmInterview = () => {
    if (!interviewDate) {
      toast({
        title: "Error",
        description: "Please select an interview date",
        variant: "destructive",
      });
      return;
    }
    updateCVStatus.mutate({ status: "accepted", interviewDate });
    setShowInterviewDatePicker(false);
  };

  const handleCancelInterview = () => {
    setShowInterviewDatePicker(false);
    setInterviewDate(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Error loading CV: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-primary min-h-screen p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <Card className="bg-background backdrop-blur border-none">
          <CardHeader className="p-6 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold">CV Detail</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <CVDisplay cv={cv} onEdit={handleEdit} />
          </CardContent>
          <CardFooter className="p-6 border-t border-gray-200 flex justify-between">
            <Button onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</Button>
            <div className="flex gap-2">
              {cv.status === "pending" && (
                <>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    disabled={updateCVStatus.isPending}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={handleAccept}
                    disabled={updateCVStatus.isPending}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                </>
              )}
              {cv.status !== "pending" && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  cv.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : cv.status === "rejected"
                    ? "bg-destructive/10 text-red-800"
                    : "bg-background text-red-400"
                }`}>
                  {cv.status.charAt(0).toUpperCase() + cv.status.slice(1)}
                </div>
              )}
              <Button onClick={handleEdit}>Edit CV</Button>
            </div>
          </CardFooter>
        </Card>

        {showInterviewDatePicker && (
          <Card className="mt-4 bg-background backdrop-blur border-none">
            <CardHeader className="p-6 border-b border-gray-200">
              <CardTitle className="text-xl font-bold">Schedule Interview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${
                          !interviewDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {interviewDate ? format(interviewDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={interviewDate}
                        onSelect={setInterviewDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {interviewDate && (
                    <div className="mt-2">
                      <label className="text-sm font-medium">Time</label>
                      <Input
                        type="time"
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':').map(Number);
                          const newDate = new Date(interviewDate);
                          newDate.setHours(hours, minutes);
                          setInterviewDate(newDate);
                        }}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelInterview}>Cancel</Button>
              <Button onClick={handleConfirmInterview} disabled={!interviewDate}>Confirm</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CVDetail;
