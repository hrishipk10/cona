
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";

interface Interview {
  id: string;
  scheduled_at: string;
  status: string;
  feedback: string | null;
  cv_id: string;
  cvs: {
    applicant_name: string;
  };
}

export const UpcomingInterviews = () => {
  const navigate = useNavigate();

  const { data: interviews, isLoading, error } = useQuery({
    queryKey: ["interviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interviews")
        .select("*, cvs(applicant_name)")
        .order("scheduled_at", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data as Interview[];
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-secondary backdrop-blur border-none">
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-secondary backdrop-blur border-none">
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading interviews</p>
        </CardContent>
      </Card>
    );
  }

  if (!interviews || interviews.length === 0) {
    return (
      <Card className="bg-secondary backdrop-blur border-none">
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No upcoming interviews scheduled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary backdrop-blur border-none">
      <CardHeader>
        <CardTitle>Upcoming Interviews</CardTitle>
        <CardDescription>Your next 5 scheduled interviews</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div key={interview.id} className="flex items-center gap-4">
              <div className="bg-primary text-primary-foreground rounded-full p-2">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{interview.cvs?.applicant_name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(interview.scheduled_at), "PPP")} at {format(parseISO(interview.scheduled_at), "p")}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/admin/cv/${interview.cv_id}`)}
              >
                View CV
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
