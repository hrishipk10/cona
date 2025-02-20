import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import CVDisplay from "@/components/CVDisplay";
import { supabase } from "@/integrations/supabase/client";

const CVDetail = () => {
  const { id } = useParams();

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
    // Placeholder function for editing the CV
    console.log("Edit CV clicked");
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
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>CV Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <CVDisplay cv={cv} onEdit={handleEdit} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CVDetail;
