import { Calendar } from "./ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

const InterviewTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={new Date()}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No past interviews found.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewTab;