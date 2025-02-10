
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DashboardSummaryCards } from "@/components/admin/DashboardSummaryCards";
import { TopCVsTable } from "@/components/admin/TopCVsTable";
import { ExperienceClusterChart } from "@/components/admin/ExperienceClusterChart";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

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

  const { data: cvs, isLoading } = useQuery({
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const totalApplications = cvs?.length || 0;
  const averageExperience = cvs 
    ? cvs.reduce((acc, cv) => acc + cv.years_experience, 0) / cvs.length
    : 0;
  const acceptedApplications = cvs?.filter(cv => cv.status === 'accepted').length || 0;
  const pendingApplications = cvs?.filter(cv => cv.status === 'pending').length || 0;

  const topCVsByRequirements = cvs?.slice(0, 5) || [];
  const topCVsByExperience = [...(cvs || [])]
    .sort((a, b) => b.years_experience - a.years_experience)
    .slice(0, 5);

  const experienceGroups = cvs?.reduce((acc, cv) => {
    const group = `${Math.floor(cv.years_experience / 2) * 2}-${
      Math.floor(cv.years_experience / 2) * 2 + 2
    } years`;
    if (!acc[group]) acc[group] = [];
    acc[group].push(cv);
    return acc;
  }, {} as Record<string, CV[]>) || {};

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <DashboardSummaryCards
        totalApplications={totalApplications}
        averageExperience={averageExperience}
        acceptedApplications={acceptedApplications}
        pendingApplications={pendingApplications}
      />

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="cluster">Clusters</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top CVs by Requirements Match</CardTitle>
            </CardHeader>
            <CardContent>
              <TopCVsTable cvs={topCVsByRequirements} title="Top CVs by Requirements Match" />
            </CardContent>
          </Card>

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

        <TabsContent value="cluster" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Experience Clusters</CardTitle>
            </CardHeader>
            <CardContent>
              <ExperienceClusterChart experienceGroups={experienceGroups} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
