import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import CVFormFields from "./CVFormFields";

interface CVFormData {
  fullName: string;
  email: string;
  phone: string;
  education: string;
  experience: string;
  skills: string;
  cvFile?: FileList;
}

interface CVFormProps {
  existingCV?: any;
  onSubmitSuccess?: () => void;
}

const CVForm = ({ existingCV, onSubmitSuccess }: CVFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<CVFormData>({
    defaultValues: existingCV
      ? {
          fullName: existingCV.applicant_name,
          experience: `${existingCV.years_experience} years`,
          skills: existingCV.skills.join(", "),
        }
      : {},
  });
  const { toast } = useToast();

  const onSubmit = async (data: CVFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const yearsMatch = data.experience.match(/(\d+)\s*years?/i);
      const yearsExperience = yearsMatch ? parseInt(yearsMatch[1]) : 0;
      const skillsArray = data.skills.split(',').map(skill => skill.trim());

      const { error } = existingCV
        ? await supabase
            .from('cvs')
            .update({
              applicant_name: data.fullName,
              years_experience: yearsExperience,
              skills: skillsArray,
            })
            .eq('id', existingCV.id)
        : await supabase
            .from('cvs')
            .insert({
              applicant_name: data.fullName,
              years_experience: yearsExperience,
              skills: skillsArray,
              status: 'pending',
              user_id: user.id,
            });

      if (error) {
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your CV. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success!",
        description: existingCV
          ? "Your CV has been updated successfully."
          : "Your CV has been submitted successfully. We'll review it soon.",
      });

      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting CV:', error);
      toast({
        title: "Error",
        description: "Failed to submit CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CVFormFields form={form} isNewSubmission={!existingCV} />
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Submitting..."
            : existingCV
            ? "Update CV"
            : "Submit CV"}
        </Button>
      </form>
    </Form>
  );
};

export default CVForm;