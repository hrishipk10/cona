
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, parseISO } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";

const InterviewCard = ({ interview }: { interview: any }) => (
  <Card className="border rounded-lg shadow-sm mb-4">
    <CardContent className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg text-primary">
            {format(parseISO(interview.scheduled_at), 'EEEE, MMMM do, yyyy')}
          </p>
          <p className="text-muted-foreground">
            {format(parseISO(interview.scheduled_at), 'hh:mm a')}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              interview.status === "confirmed"
                ? "bg-green-100 text-green-800"
                : interview.status === "pending"
                ? "bg-secondary text-secondary-foreground"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {interview.status}
          </span>
          {interview.feedback && (
            <p className="text-sm text-muted-foreground mt-1">
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
      .eq("cv_id", cv.id);
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
    const interviewDate = new Date(interview.scheduled_at).toDateString();
    return (
      selectedDate && interviewDate === selectedDate.toDateString()
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-2xl font-bold text-primary">Interview Schedule</h3>
        </CardHeader>
        <CardContent>
          <div className="md:flex md:space-x-8">
            <div className="md:w-1/3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <div className="md:w-2/3 mt-6 md:mt-0 space-y-4">
              {interviewsByDate && interviewsByDate.length > 0 ? (
                interviewsByDate.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))
              ) : (
                <p className="text-center text-muted-foreground">
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
