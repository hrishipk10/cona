
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/admin/Sidebar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface SettingsFormValues {
  company_name: string;
}

const SettingsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const form = useForm<SettingsFormValues>({
    defaultValues: {
      company_name: "",
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Error fetching settings:", error);
        throw error;
      }

      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        company_name: settings.company_name,
      });
    }
  }, [settings, form]);

  const updateSettings = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      const { error } = await supabase
        .from("settings")
        .update({
          company_name: values.company_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings?.id);

      if (error) {
        throw error;
      }
      
      return values;
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Company settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating settings",
        description: error.message,
      });
    },
  });

  const onSubmit = (values: SettingsFormValues) => {
    updateSettings.mutate(values);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-primary relative md:flex flex-col items-center justify-center p-8 min-h-screen">
      <Sidebar />

      <div className="ml-[88px] p-6 w-full">
        <div className="bg-secondary backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-['Karla']">Settings</h1>
            <Button variant="destructive" className="rounded-xl gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="font-['Karla']">Company Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateSettings.isPending}
                >
                  {updateSettings.isPending ? <Spinner /> : null}
                  Save Settings
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
