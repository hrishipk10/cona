import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/admin/Sidebar";
import { LogOut, Check, X, ChevronRight, ChevronDown, ChevronUp, Search } from "lucide-react";

const SortingPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceRange, setExperienceRange] = useState<number[]>([0, 10]);
  const [salaryRange, setSalaryRange] = useState<number[]>([0, 200000]);
  const [employmentType, setEmploymentType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"relevance" | "experience">("relevance");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: cvs, isLoading, error } = useQuery({
    queryKey: ["cvs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cvs")
        .select("*")
        .order("application_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    // Fetch initial data or perform any initial setup here
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const filteredCvs = cvs
    ?.filter((cv) => {
      const term = searchTerm.toLowerCase();
      return (
        cv.applicant_name.toLowerCase().includes(term) ||
        cv.current_job_title?.toLowerCase().includes(term) ||
        cv.skills.some((skill) => skill.toLowerCase().includes(term))
      );
    })
    .filter((cv) => {
      if (selectedSkills.length === 0) return true;
      return selectedSkills.every((skill) =>
        cv.skills.some((cvSkill) => cvSkill.toLowerCase().includes(skill.toLowerCase()))
      );
    })
    .filter((cv) => cv.years_experience >= experienceRange[0] && cv.years_experience <= experienceRange[1])
    .filter((cv) => cv.expected_salary >= salaryRange[0] && cv.expected_salary <= salaryRange[1])
    .filter((cv) => {
      if (employmentType === "all") return true;
      return cv.employment_type === employmentType;
    })
    .sort((a, b) => {
      if (sortOrder === "experience") {
        return b.years_experience - a.years_experience;
      }
      return 0;
    });

  return (
    <div className="bg-primary relative md:flex flex-col items-center justify-center p-8 min-h-screen">
      <Sidebar />

      <div className="ml-[88px] p-6 w-full">
        <div className="bg-secondary backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">CV Sorting</h1>
            <div className="flex items-center space-x-4">
              <Button variant="destructive" className="rounded-xl gap-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between mt-6">
            <div className="flex items-center space-x-2 w-full md:w-auto mb-2 md:mb-0">
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by name, job title, or skills"
                className="rounded-xl bg-white/10 border-none text-white placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filter
              {isFilterOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          {isFilterOpen && (
            <Card className="mt-4 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-bold mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "JavaScript",
                        "React",
                        "Node.js",
                        "Python",
                        "SQL",
                        "HTML",
                        "CSS",
                        "TypeScript",
                        "AWS",
                        "Docker",
                      ].map((skill) => (
                        <Button
                          key={skill}
                          variant="secondary"
                          className={`text-xs rounded-full ${
                            selectedSkills.includes(skill) ? "bg-primary text-white" : ""
                          }`}
                          onClick={() => {
                            if (selectedSkills.includes(skill)) {
                              setSelectedSkills(selectedSkills.filter((s) => s !== skill));
                            } else {
                              setSelectedSkills([...selectedSkills, skill]);
                            }
                          }}
                        >
                          {skill}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold mb-2">Experience</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{experienceRange[0]} years</span>
                        <span>{experienceRange[1]} years</span>
                      </div>
                      <Slider
                        defaultValue={experienceRange}
                        min={0}
                        max={10}
                        step={1}
                        onValueChange={(value) => setExperienceRange(value)}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold mb-2">Salary Expectation</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>${salaryRange[0]}</span>
                        <span>${salaryRange[1]}</span>
                      </div>
                      <Slider
                        defaultValue={salaryRange}
                        min={0}
                        max={200000}
                        step={10000}
                        onValueChange={(value) => setSalaryRange(value)}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold mb-2">Employment Type</h4>
                    <RadioGroup defaultValue={employmentType} onValueChange={setEmploymentType}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" className="border-2 rounded-full" />
                        <Label htmlFor="all" className="text-xs">
                          All
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full-time" id="full-time" className="border-2 rounded-full" />
                        <Label htmlFor="full-time" className="text-xs">
                          Full-time
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="part-time" id="part-time" className="border-2 rounded-full" />
                        <Label htmlFor="part-time" className="text-xs">
                          Part-time
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="contract" id="contract" className="border-2 rounded-full" />
                        <Label htmlFor="contract" className="text-xs">
                          Contract
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCvs?.map((cv) => (
            <Card key={cv.id} className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10 mt-1">
                      {cv.avatar_url ? (
                        <AvatarImage src={cv.avatar_url} alt={cv.applicant_name} />
                      ) : (
                        <AvatarFallback>{cv.applicant_name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{cv.applicant_name}</h3>
                      <p className="text-sm text-gray-500">
                        {cv.current_job_title || "Applicant"} • {cv.years_experience} years
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cv.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {cv.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{cv.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/admin/cv/${cv.id}`)}>
                    View CV <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SortingPage;
