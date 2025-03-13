
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle, Clock, Users, Briefcase } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

interface StatsOverviewProps {
  cvs: CV[];
}

export const StatsOverview = ({ cvs }: StatsOverviewProps) => {
  const totalApplications = cvs.length;
  const pendingApplications = cvs.filter(cv => cv.status === 'pending').length;
  const acceptedApplications = cvs.filter(cv => cv.status === 'accepted').length;
  const averageExperience = cvs.length > 0 
    ? cvs.reduce((acc, cv) => acc + cv.years_experience, 0) / cvs.length 
    : 0;

  return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      <Card className="bg-white/80 backdrop-blur border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CheckCircle className="h-6 w-6" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <h2 className="text-2xl font-bold">{acceptedApplications}</h2>
          <p className="text-sm text-gray-500">Accepted applications</p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <Clock className="h-6 w-6" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <h2 className="text-2xl font-bold">{pendingApplications}</h2>
          <p className="text-sm text-gray-500">Pending review</p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <Users className="h-6 w-6" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <h2 className="text-2xl font-bold">{totalApplications}</h2>
          <p className="text-sm text-gray-500">Total applicants</p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <Briefcase className="h-6 w-6" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <h2 className="text-2xl font-bold">{averageExperience.toFixed(1)}</h2>
          <p className="text-sm text-gray-500">Average experience (years)</p>
        </CardContent>
      </Card>
    </div>
  );
};
