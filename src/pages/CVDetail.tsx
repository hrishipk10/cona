
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import CVDisplay from "@/components/CVDisplay";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

const CVDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const handleEdit = () => {
    console.log("Edit CV clicked");
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
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
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="bg-background backdrop-blur border-none">
          <CardHeader className="p-6 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold">CV Detail</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <CVDisplay cv={cv} onEdit={handleEdit} />
          </CardContent>
          <CardFooter className="p-6 border-t border-gray-200">
            <Button onClick={handleEdit}>Edit CV</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CVDetail;
