import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, BriefcaseIcon, TrendingUpIcon, PenLineIcon, CheckCircleIcon, ClockIcon, ClipboardListIcon } from "lucide-react"; // Ensure you have an icon library installed
import { Database } from "@/integrations/supabase/types";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type Position = Database["public"]["Tables"]["positions"]["Row"];

interface DashboardOverviewProps {
  cvs: CV[];
  positions?: Position[];
  totalApplications: number;
  averageExperience: number;
  acceptedApplications: number;
  pendingApplications: number;
}

export const DashboardOverview = ({ 
  cvs, 
  positions, 
  totalApplications, 
  averageExperience, 
  acceptedApplications, 
  pendingApplications 
}: DashboardOverviewProps) => {
  const averageMatch = cvs.reduce((acc, cv) => acc + (cv.requirements_match || 0), 0) / (cvs.length || 1);
  const openPositions = positions?.filter(p => p.status === 'open').length || 0;

  const pipelineStats = cvs.reduce((acc, cv) => {
    const status = cv.pipeline_status || 'applied';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Applicants */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-6 h-6 text-indigo-600" />
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalApplications}</div>
        </CardContent>
      </Card>

      {/* Open Positions */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <BriefcaseIcon className="w-6 h-6 text-indigo-600" />
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openPositions}</div>
        </CardContent>
      </Card>

      {/* Avg. Match Rate */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <TrendingUpIcon className="w-6 h-6 text-indigo-600" />
            <CardTitle className="text-sm font-medium">Avg. Match Rate</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageMatch.toFixed(1)}%</div>
        </CardContent>
      </Card>

      {/* In Pipeline */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <PenLineIcon className="w-6 h-6 text-indigo-600" />
            <CardTitle className="text-sm font-medium">In Pipeline</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pipelineStats['in_progress'] || 0}</div>
        </CardContent>
      </Card>

      {/* Accepted Applications */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <CardTitle className="text-sm font-medium">Accepted Applications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{acceptedApplications}</div>
        </CardContent>
      </Card>

      {/* Pending Review */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-6 h-6 text-yellow-600" />
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingApplications}</div>
        </CardContent>
      </Card>

      {/* Average Experience */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <ClipboardListIcon className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-sm font-medium">Average Experience</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageExperience.toFixed(1)} years</div>
        </CardContent>
      </Card>
    </div>
  );
};
