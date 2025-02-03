import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CVFormData } from "./types";

export const useSubmitCV = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const submitCV = async (data: CVFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit your CV.",
          variant: "destructive",
        });
        navigate("/applicant/login");
        return;
      }

      const yearsMatch = data.experience.match(/(\d+)\s*years?/i);
      const yearsExperience = yearsMatch ? parseInt(yearsMatch[1]) : 0;
      const skillsArray = data.skills.split(',').map(skill => skill.trim());

      const { error } = await supabase
        .from('cvs')
        .insert({
          applicant_name: data.fullName,
          years_experience: yearsExperience,
          skills: skillsArray,
          status: 'pending',
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Your CV has been submitted successfully!",
      });

      return true;
    } catch (error) {
      console.error('Error submitting CV:', error);
      toast({
        title: "Error",
        description: "Failed to submit CV. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitCV, isSubmitting };
};