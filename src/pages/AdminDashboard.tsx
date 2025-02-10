
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { TopCVsTable } from "@/components/admin/TopCVsTable";
import { ExperienceClusterChart } from "@/components/admin/ExperienceClusterChart";
import { DashboardMetrics } from "@/components/admin/DashboardMetrics";
import { ApplicationTrendsChart } from "@/components/admin/ApplicationTrendsChart";
import { DashboardSummaryCards } from "@/components/admin/DashboardSummaryCards";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type Position = Database["public"]["Tables"]["positions"]["Row"];

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
        .select("*")
        .order("requirements_match", { ascending: false });

      if (error) throw error;
      return data as CV[];
    },
  });

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("positions")
        .select("*");

      if (error) throw error;
      return data as Position[];
    },
  });

  if (cvsLoading || positionsLoading) {
    return <div>Loading...</div>;
  }

  if (!cvs) return null;

  const experienceGroups = cvs.reduce((acc, cv) => {
    const group = `${Math.floor(cv.years_experience / 2) * 2}-${
      Math.floor(cv.years_experience / 2) * 2 + 2
    } years`;
    if (!acc[group]) acc[group] = [];
    acc[group].push(cv);
    return acc;
  }, {} as Record<string, CV[]>);

  const topCVsByRequirements = cvs.slice(0, 5);
  const topCVsByExperience = [...cvs]
    .sort((a, b) => b.years_experience - a.years_experience)
    .slice(0, 5);

  const totalApplications = cvs.length;
  const averageExperience = cvs.reduce((acc, cv) => acc + cv.years_experience, 0) / cvs.length;
  const acceptedApplications = cvs.filter(cv => cv.status === 'accepted').length;
  const pendingApplications = cvs.filter(cv => cv.status === 'pending').length;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <DashboardSummaryCards 
        totalApplications={totalApplications}
        averageExperience={averageExperience}
        acceptedApplications={acceptedApplications}
        pendingApplications={pendingApplications}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top CVs by Requirements Match</CardTitle>
            </CardHeader>
            <CardContent>
              <TopCVsTable cvs={topCVsByRequirements} title="Top CVs by Requirements Match" />
            </CardContent>
          </Card>

          <DashboardMetrics cvs={cvs} positions={positions} />
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Experienced Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <TopCVsTable 
                cvs={topCVsByExperience} 
                title="Most Experienced Candidates" 
                showSkills={true} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Trends</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ApplicationTrendsChart cvs={cvs} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experience Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ExperienceClusterChart experienceGroups={experienceGroups} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
