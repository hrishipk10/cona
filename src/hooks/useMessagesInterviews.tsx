
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type Interview = Database["public"]["Tables"]["interviews"]["Row"] & { cvs?: { applicant_name: string } };

export const useMessagesInterviews = () => {
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

  // Handle form submission for messages
  const handleSendMessage = (cvId: string) => {
    if (message.trim()) {
      sendMessage({
        cv_id: cvId,
        message: message.trim(),
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  // Filter CVs by status
  const acceptedCvs = cvs?.filter(cv => cv.status === "accepted") || [];
  const rejectedCvs = cvs?.filter(cv => cv.status === "rejected") || [];
  
  console.log("Accepted CVs:", acceptedCvs);
  console.log("Rejected CVs:", rejectedCvs);

  return {
    cvs,
    interviews,
    acceptedCvs,
    rejectedCvs,
    cvsLoading,
    interviewsLoading,
    selectedDate,
    setSelectedDate,
    selectedCvId,
    setSelectedCvId,
    message,
    setMessage,
    isSendingMessage,
    handleSendMessage,
    handleLogout
  };
};
