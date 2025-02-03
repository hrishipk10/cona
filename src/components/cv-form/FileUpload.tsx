import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Upload } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CVFormData } from "./types";

interface FileUploadProps {
  form: UseFormReturn<CVFormData>;
}

export const FileUpload = ({ form }: FileUploadProps) => {
  return (
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
                    <span className="font-semibold">Click to upload</span> or drag
                    and drop
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
  );
};