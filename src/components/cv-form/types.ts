import { z } from "zod";

export const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  education: z.string().min(1, "Education details are required"),
  experience: z.string().min(1, "Work experience is required"),
  skills: z.string().min(1, "Skills are required"),
  cvFile: z.any().optional(),
});

export type CVFormData = z.infer<typeof formSchema>;