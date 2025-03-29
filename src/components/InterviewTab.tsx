
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, parseISO } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const InterviewCard = ({ interview }: { interview: any }) => (
  <Card className="border rounded-lg shadow-sm mb-4 bg-background">
    <CardContent className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-start space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-lg text-primary">
              {format(parseISO(interview.scheduled_at), 'EEEE, MMMM do, yyyy')}
            </p>
            <div className="flex items-center text-muted-foreground mt-1">
              <Clock className="h-4 w-4 mr-1" />
              <span>{format(parseISO(interview.scheduled_at), 'h:mm a')}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <Badge
            className={`${
              interview.status === "confirmed"
                ? "bg-green-100 hover:bg-green-200 text-green-800"
                : interview.status === "pending" || interview.status === "scheduled"
                ? "bg-secondary text-secondary-foreground"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {interview.status === "scheduled" ? "pending" : interview.status}
          </Badge>
          {interview.feedback && (
            <p className="text-sm text-muted-foreground mt-2">
              Feedback: {interview.feedback}
            </p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const InterviewTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const fetchUserInterviews = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No user found");

    const { data: cv, error: cvError } = await supabase
      .from("cvs")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (cvError) throw cvError;
    if (!cv) return [];

    const { data: interviews, error: interviewsError } = await supabase
      .from("interviews")
      .select("*")
      .eq("cv_id", cv.id)
      .order("scheduled_at", { ascending: true });
    if (interviewsError) throw interviewsError;

    return interviews;
  };

  const {
    data: interviews,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userInterviews"],
    queryFn: fetchUserInterviews,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive">
        Error fetching interviews: {(error as Error).message}
      </div>
    );
  }

  const interviewsByDate = interviews?.filter((interview) => {
    if (!selectedDate) return false;
    const interviewDate = new Date(interview.scheduled_at).toDateString();
    return interviewDate === selectedDate.toDateString();
  });

  const upcomingInterviews = interviews?.filter((interview) => {
    const interviewDate = new Date(interview.scheduled_at);
    return interviewDate >= new Date();
  });

  return (
    <div className="space-y-6">
      <Card className="bg-background">
        <CardHeader>
          <h3 className="text-2xl font-bold text-primary">Interview Schedule</h3>
          <p className="text-muted-foreground">
            You have {upcomingInterviews?.length || 0} upcoming interviews
          </p>
        </CardHeader>
        <CardContent>
          <div className="md:flex md:space-x-8">
            <div className="md:w-1/3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border bg-background"
                disabled={(date) => {
                  // Disable past dates
                  return date < new Date(new Date().setHours(0, 0, 0, 0));
                }}
              />
            </div>
            <div className="md:w-2/3 mt-6 md:mt-0 space-y-4">
              {interviewsByDate && interviewsByDate.length > 0 ? (
                interviewsByDate.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No interviews scheduled on this date.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewTab;
