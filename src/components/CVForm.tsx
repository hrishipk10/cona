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
  address: string;
  linkedinProfile: string;
  githubProfile: string;
  portfolioLink: string;
  currentJobTitle: string;
  experience: string;
  education: string;
  certifications: string;
  references: string;
  skills: string;
  languagesKnown: string;
  desiredSalary: string;
  willingnessToRelocate: boolean;
  availabilityForRemoteWork: boolean;
  industryExperience: string;
  careerGoals: string;
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
          email: existingCV.email,
          phone: existingCV.phone,
          address: existingCV.address,
          linkedinProfile: existingCV.linkedin_profile,
          githubProfile: existingCV.github_profile,
          portfolioLink: existingCV.portfolio_link,
          currentJobTitle: existingCV.current_job_title,
          experience: `${existingCV.years_experience} years`,
          education: existingCV.education,
          certifications: existingCV.certifications,
          references: existingCV.references,
          skills: existingCV.skills.join(", "),
          languagesKnown: existingCV.languages_known?.join(", ") || "",
          desiredSalary: existingCV.desired_salary,
          willingnessToRelocate: existingCV.willingness_to_relocate,
          availabilityForRemoteWork: existingCV.availability_for_remote_work,
          industryExperience: existingCV.industry_experience,
          careerGoals: existingCV.career_goals,
        }
      : {
          willingnessToRelocate: false,
          availabilityForRemoteWork: false,
        },
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
      const languagesArray = data.languagesKnown.split(',').map(lang => lang.trim());

      const cvData = {
        applicant_name: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        linkedin_profile: data.linkedinProfile,
        github_profile: data.githubProfile,
        portfolio_link: data.portfolioLink,
        current_job_title: data.currentJobTitle,
        years_experience: yearsExperience,
        education: data.education,
        certifications: data.certifications,
        references: data.references,
        skills: skillsArray,
        languages_known: languagesArray,
        desired_salary: data.desiredSalary,
        willingness_to_relocate: data.willingnessToRelocate,
        availability_for_remote_work: data.availabilityForRemoteWork,
        industry_experience: data.industryExperience,
        career_goals: data.careerGoals,
      };

      const { error } = existingCV
        ? await supabase
            .from('cvs')
            .update(cvData)
            .eq('id', existingCV.id)
        : await supabase
            .from('cvs')
            .insert({
              ...cvData,
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