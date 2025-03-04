import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { ApplicationTrendsChart } from "@/components/admin/ApplicationTrendsChart";
import { ExperienceClusterChart } from "@/components/admin/ExperienceClusterChart";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {  
  Users,
  Briefcase,
  CheckCircle,
  LogOut,
  Home,
  SortAsc,
  FileText,
  Settings,
  Clock
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type Position = Database["public"]["Tables"]["positions"]["Row"];
type Interview = Database["public"]["Tables"]["interviews"]["Row"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentDate] = useState(new Date());

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

  const { data: interviews, isLoading: interviewsLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interviews")
        .select("*, cvs(applicant_name)");
      if (error) throw error;
      return data as (Interview & { cvs: { applicant_name: string } })[];
    },
  });

  if (cvsLoading || positionsLoading || interviewsLoading) {
    return <div>Loading...</div>;
  }

  if (!cvs) return null;

  const totalApplications = cvs.length;
  const pendingApplications = cvs.filter(cv => cv.status === 'pending').length;
  const acceptedApplications = cvs.filter(cv => cv.status === 'accepted').length;
  const averageExperience = cvs.reduce((acc, cv) => acc + cv.years_experience, 0) / cvs.length;

  const recentCVs = [...cvs]
    .sort((a, b) => new Date(b.application_date || b.created_at || '').getTime() - new Date(a.application_date || a.created_at || '').getTime())
    .slice(0, 4);

  const upcomingInterviews = interviews 
    ? [...interviews]
        .filter(interview => interview.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 4)
    : [];

  const topPerformers = [...cvs]
    .map(cv => {
      const skillsScore = (cv.skills?.length || 0) * 2;
      const experienceScore = cv.years_experience * 5;
      const matchScore = cv.requirements_match || 0;
      const certificationBonus = cv.certifications ? 15 : 0;
      const referencesBonus = cv.references ? 10 : 0;
      const totalScore = skillsScore + experienceScore + matchScore + certificationBonus + referencesBonus;
      return { ...cv, performanceScore: totalScore };
    })
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 5);

  const experienceGroups = cvs.reduce((acc, cv) => {
    const group = `${Math.floor(cv.years_experience / 2) * 2}-${Math.floor(cv.years_experience / 2) * 2 + 2} years`;
    if (!acc[group]) acc[group] = [];
    acc[group].push(cv);
    return acc;
  }, {} as Record<string, CV[]>);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 24) {
      return diffInHours < 1 ? "Just now" : `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-primary relative hidden md:flex flex-col items-center justify-center p-8 min-h-screen">
      <div className="fixed left-0 top-0 h-full w-[88px] bg-black flex flex-col items-center py-8 text-white">
        <div className="mb-12">
          <span className="text-xl font-bold">Cona</span>
        </div>
        <div className="flex flex-col items-center space-y-8">
          <Button variant="ghost" size="icon" className="text-white bg-gray-700" onClick={() => navigate("/admin/dashboard")}>
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white" onClick={() => navigate("/admin/sorting")}>
            <SortAsc className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white" onClick={() => navigate("/admin/messages")}>
            <FileText className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="ml-[88px] p-6">
        <div className="bg-secondary backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-foreground-secondary font-bold">Good morning, James!</h1>
            <div className="flex items-center space-x-4">
              <Button variant="destructive" className="rounded-xl gap-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
              <Avatar className="bg-foreground">
                <AvatarImage src="/avatars/batman.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>

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
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card className="bg-secondary backdrop-blur border-none">
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
                <CardDescription>Last 30 days application activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ApplicationTrendsChart cvs={cvs} />
              </CardContent>
            </Card>

            <Card className="bg-secondary backdrop-blur border-none">
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Outstanding candidates by skills, experience and match</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((cv, index) => (
                    <div key={index} className="flex items-center">
                      <Avatar className="h-10 w-10 mr-4 bg-black text-white">
                        {cv.avatar_url ? (
                          <AvatarImage src={cv.avatar_url} alt={cv.applicant_name} />
                        ) : (
                          <AvatarFallback>{cv.applicant_name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{cv.applicant_name}</p>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-sm text-gray-500">
                            {cv.current_job_title || "Applicant"} • {cv.years_experience} yrs
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            • {cv.skills.length} skills
                          </span>
                          {cv.certifications && (
                            <span className="text-sm text-green-600 ml-1">• Certified</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => navigate(`/admin/cv/${cv.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => navigate("/admin/applications")}
                >
                  View all candidates
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <ExperienceClusterChart experienceGroups={experienceGroups} />

            <Card className="bg-secondary backdrop-blur border-none">
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingInterviews.length > 0 ? (
                    upcomingInterviews.map((interview, index) => (
                      <div key={index} className="flex items-center">
                        <div className="bg-black text-white rounded-full p-2 mr-4">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{interview.cvs?.applicant_name || "Candidate"}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            {new Date(interview.scheduled_at).toLocaleDateString()} at {new Date(interview.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => navigate(`/admin/interviews/${interview.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No upcoming interviews scheduled</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => navigate("/admin/interviews")}
                >
                  Manage all interviews
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-secondary backdrop-blur border-none">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCVs.map((cv, index) => (
                    <div 
                      key={index} 
                      className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                      onClick={() => navigate(`/admin/cv/${cv.id}`)}
                    >
                      <Avatar className="h-10 w-10 mr-4">
                        {cv.avatar_url ? (
                          <AvatarImage src={cv.avatar_url} />
                        ) : (
                          <AvatarFallback>{cv.applicant_name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{cv.applicant_name}</p>
                        <p className="text-sm text-gray-500">{cv.current_job_title || "Applicant"} • {cv.years_experience} years</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">{formatDate(cv.application_date || cv.created_at)}</span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            cv.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : cv.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {cv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/admin/applications")}
                >
                  View all applications
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
