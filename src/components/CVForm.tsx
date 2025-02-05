import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Upload } from "lucide-react";

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

      // Parse years of experience from the experience text
      const yearsMatch = data.experience.match(/(\d+)\s*years?/i);
      const yearsExperience = yearsMatch ? parseInt(yearsMatch[1]) : 0;

      // Convert skills string to array
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Experience</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 5 years"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List your technical skills, separated by commas (e.g., JavaScript, React, Node.js)"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!existingCV && (
          <FormField
            control={form.control}
            name="cvFile"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Upload CV Document</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="cv-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or
                          drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, or DOCX (MAX. 10MB)
                        </p>
                      </div>
                      <input
                        id="cv-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files) {
                            onChange(e.target.files);
                          }
                        }}
                        {...field}
                      />
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
