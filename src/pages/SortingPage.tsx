import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, SortAsc, FileText, Settings } from "lucide-react";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

const SortingPage = () => {
  const [sortCriteria, setSortCriteria] = useState<string>("");
  const navigate = useNavigate();

  const { data: cvs, isLoading, error } = useQuery({
    queryKey: ["cvs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cvs").select("*");
      if (error) throw error;
      return data as CV[];
    },
  });

  const handleSort = (criteria: string) => {
    setSortCriteria(criteria);
  };

  // Clone the array so that sorting doesn't mutate the original data.
  const sortedCVs = cvs?.slice().sort((a, b) => {
    if (sortCriteria === "experience") {
      return b.years_experience - a.years_experience;
    } else if (sortCriteria === "skills") {
      return (b.skills?.length || 0) - (a.skills?.length || 0);
    } else {
      return 0;
    }
  });

  // Utility function to format dates similar to admindashboard.
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading CVs</div>;

  return (
    <div className="bg-primary relative hidden md:flex flex-col items-center justify-center p-8 min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-[88px] bg-black flex flex-col items-center py-8 text-white">
        <div className="mb-12">
          <span className="text-xl font-bold">Cona</span>
        </div>
        <div className="flex flex-col items-center space-y-8">
          <Button variant="ghost" size="icon" className="text-white" onClick={() => navigate("/admin/dashboard")}>
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white bg-gray-700" onClick={() => navigate("/admin/sorting")}>
            <SortAsc className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white" onClick={() => navigate("/admin/applications")}>
            <FileText className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="ml-[88px] p-6 w-full">
        {/* Sorting Controls */}
        <Card className="mb-6 bg-secondary backdrop-blur border-none">
          <CardHeader>
            <CardTitle>Sort CVs</CardTitle>
            <CardDescription>Select criteria to sort CVs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button
                variant={sortCriteria === "experience" ? "default" : "outline"}
                onClick={() => handleSort("experience")}
              >
                Sort by Experience
              </Button>
              <Button
                variant={sortCriteria === "skills" ? "default" : "outline"}
                onClick={() => handleSort("skills")}
              >
                Sort by Skills
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sorted CVs List */}
        <Card className="bg-secondary backdrop-blur border-none">
          <CardHeader>
            <CardTitle>Sorted Applications</CardTitle>
            {sortCriteria && <CardDescription>Sorted by {sortCriteria}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedCVs && sortedCVs.length > 0 ? (
                sortedCVs.map((cv, index) => (
                  <div
                    key={index}
                    className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    onClick={() => navigate(`/admin/cv/${cv.id}`)}
                  >
                    <Avatar className="h-10 w-10 mr-4">
                      {cv.avatar_url ? (
                        <AvatarImage src={cv.avatar_url} alt={cv.applicant_name} />
                      ) : (
                        <AvatarFallback>{cv.applicant_name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{cv.applicant_name}</p>
                      <p className="text-sm text-gray-500">
                        {cv.current_job_title || "Applicant"} • {cv.years_experience} years
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        {formatDate(cv.application_date || cv.created_at)}
                      </span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          cv.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : cv.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {cv.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No CVs available</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" className="w-full" onClick={() => navigate("/admin/applications")}>
              View all applications
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SortingPage;
