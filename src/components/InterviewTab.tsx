
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const InterviewTab = () => {
  const { data: interviews, isLoading } = useQuery({
    queryKey: ['userInterviews'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: cv } = await supabase
        .from('cvs')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!cv) return [];

      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('cv_id', cv.id);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Interview Schedule</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md border"
            />
            <div className="space-y-4">
              {interviews?.map((interview) => (
                <Card key={interview.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {new Date(interview.scheduled_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(interview.scheduled_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize">{interview.status}</p>
                        {interview.feedback && (
                          <p className="text-sm text-muted-foreground">
                            Feedback: {interview.feedback}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {interviews?.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No interviews scheduled
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
