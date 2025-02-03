import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormFields } from "./cv-form/FormFields";
import { FileUpload } from "./cv-form/FileUpload";
import { formSchema, type CVFormData } from "./cv-form/types";
import { useSubmitCV } from "./cv-form/useSubmitCV";

const CVForm = () => {
  const form = useForm<CVFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      education: "",
      experience: "",
      skills: "",
    },
  });

  const { submitCV, isSubmitting } = useSubmitCV();

  const onSubmit = async (data: CVFormData) => {
    const success = await submitCV(data);
    if (success) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormFields form={form} />
        <FileUpload form={form} />
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit CV"}
        </Button>
      </form>
    </Form>
  );
};

export default CVForm;