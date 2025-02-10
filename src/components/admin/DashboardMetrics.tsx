
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type Position = Database["public"]["Tables"]["positions"]["Row"];

interface DashboardMetricsProps {
  cvs: CV[];
  positions?: Position[];
}

export const DashboardMetrics = ({ cvs, positions }: DashboardMetricsProps) => {
  const totalApplicants = cvs.length;
  const averageMatch = cvs.reduce((acc, cv) => acc + (cv.requirements_match || 0), 0) / (cvs.length || 1);
  const openPositions = positions?.filter(p => p.status === 'open').length || 0;

  const pipelineStats = cvs.reduce((acc, cv) => {
    const status = cv.pipeline_status || 'applied';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalApplicants}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openPositions}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Match Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageMatch.toFixed(1)}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pipelineStats['in_progress'] || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
};
