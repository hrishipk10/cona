
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

interface TopPerformersProps {
  cvs: CV[];
}

export const TopPerformers = ({ cvs }: TopPerformersProps) => {
  const navigate = useNavigate();

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

  return (
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
  );
};
