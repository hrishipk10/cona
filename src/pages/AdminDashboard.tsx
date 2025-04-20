
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ApplicationTrendsChart } from "@/components/admin/ApplicationTrendsChart";
import { ExperienceClusterChart } from "@/components/admin/ExperienceClusterChart";
import { Sidebar } from "@/components/admin/Sidebar";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { TopPerformers } from "@/components/admin/TopPerformers";
import { RecentApplications } from "@/components/admin/RecentApplications";
import { UpcomingInterviews } from "@/components/admin/UpcomingInterviews";
import { JobManagement } from "@/components/admin/JobManagement";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      if (!adminData?.is_admin) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate("/admin/login");
      }
    };
    checkAdminStatus();
  }, [navigate, toast]);

  const { data: cvs, isLoading: cvsLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cvs")
        .select("*, job_postings(title, department)")
        .order("requirements_match", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("positions")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: jobPostings, isLoading: jobsLoading } = useQuery({
    queryKey: ["job_postings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: interviews, isLoading: interviewsLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interviews")
        .select("*, cvs(applicant_name)");
      if (error) throw error;
      return data;
    },
  });

  if (cvsLoading || positionsLoading || interviewsLoading || jobsLoading) {
    return <div>Loading...</div>;
  }

  if (!cvs) return null;

  const experienceGroups = cvs.reduce((acc, cv) => {
    const group = `${Math.floor(cv.years_experience / 2) * 2}-${Math.floor(cv.years_experience / 2) * 2 + 2} years`;
    if (!acc[group]) acc[group] = [];
    acc[group].push(cv);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="bg-primary relative hidden md:flex flex-col items-center justify-center p-8 min-h-screen">
      <Sidebar />

      <div className="ml-[88px] p-6">
        <div className="bg-secondary backdrop-blur rounded-xl p-6 mb-6">
          <DashboardHeader />
          <StatsOverview cvs={cvs} />
        </div>
        
        <div className="mb-6">
          <Card className="bg-white/80 backdrop-blur border-none shadow-none rounded-xl mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filter Applications</h3>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filters</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="job-filter" className="text-sm font-medium mb-1 block">
                    Job Position
                  </Label>
                  <Select>
                    <SelectTrigger id="job-filter">
                      <SelectValue placeholder="All Positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      {jobPostings?.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status-filter" className="text-sm font-medium mb-1 block">
                    Application Status
                  </Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sort-by" className="text-sm font-medium mb-1 block">
                    Sort By
                  </Label>
                  <Select defaultValue="match">
                    <SelectTrigger id="sort-by">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match">Requirements Match</SelectItem>
                      <SelectItem value="experience">Years of Experience</SelectItem>
                      <SelectItem value="recent">Recent Applications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <JobManagement />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-secondary backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Application Trends</h2>
              <p className="text-sm text-gray-500 mb-4">Last 30 days application activity</p>
              <ApplicationTrendsChart cvs={cvs} />
            </div>

            <TopPerformers cvs={cvs} />
          </div>

          <div className="space-y-6">
            <ExperienceClusterChart experienceGroups={experienceGroups} />
            <UpcomingInterviews interviews={interviews} />
            <RecentApplications cvs={cvs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
