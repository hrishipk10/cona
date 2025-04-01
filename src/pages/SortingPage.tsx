
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
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, Check, X, ChevronRight, ChevronDown, ChevronUp, Search, 
  Filter, ArrowUpDown, Sliders, Code, Briefcase 
} from "lucide-react";

// Define types
type SortCriteria = "experience" | "skills" | "rating" | "name" | "date" | "score";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "pending" | "accepted" | "rejected";

// Define programming languages to filter by
const programmingLanguages = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "Swift", 
  "Go", "Rust", "PHP", "Kotlin", "Dart", "R", "SQL", "HTML", "CSS", "Shell",
  "Scala", "Perl", "Haskell", "Lua"
];

// Define job positions to filter by
const jobPositions = [
  "UI Designer", "UX Designer", "Frontend Developer", "Backend Developer", 
  "Full Stack Developer", "Project Manager", "Product Manager", "DevOps Engineer",
  "Data Scientist", "Machine Learning Engineer", "QA Engineer", "Mobile Developer",
  "System Administrator", "Database Administrator", "Game Developer", "Security Engineer",
  "Technical Writer", "IT Support Specialist", "Cloud Engineer", "Technical Lead",
  "Software Architect", "CTO", "IT Manager"
];

// Define scoring configuration interface
interface ScoringConfig {
  skillsWeight: number;
  experienceWeight: number;
  educationWeight: number;
  matchWeight: number;
}

// Type for CV object from database
type CV = any; // Simplified for this example

const SortingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [minExperience, setMinExperience] = useState<number>(0);
  const [maxExperience, setMaxExperience] = useState<number>(30);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showScoringConfig, setShowScoringConfig] = useState<boolean>(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  // Default scoring config
  const [scoringConfig, setScoringConfig] = useState<ScoringConfig>({
    skillsWeight: 0.4,
    experienceWeight: 0.3,
    educationWeight: 0.2,
    matchWeight: 0.1
  });

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const togglePosition = (position: string) => {
    setSelectedPositions(prev =>
      prev.includes(position)
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setSelectedSkills([]);
    setSelectedLanguages([]);
    setSelectedPositions([]);
    setMinExperience(0);
    setMaxExperience(30);
    toast({
      title: "Filters cleared",
      description: "All filtering criteria have been reset."
    });
  };

  const updateScoringConfig = (config: Partial<ScoringConfig>) => {
    setScoringConfig(prev => ({
      ...prev,
      ...config
    }));
    
    toast({
      title: "Scoring updated",
      description: "CV scoring weights have been updated."
    });
  };

  // Check if CV matches search query
  const matchesSearchQuery = (cv: CV): boolean => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Check name
    if (cv.applicant_name?.toLowerCase().includes(query)) return true;
    
    // Check skills
    if (cv.skills?.some((skill: string) => skill.toLowerCase().includes(query))) return true;
    
    // Check job title
    if (cv.current_job_title?.toLowerCase().includes(query)) return true;
    
    return false;
  };

  // Check if a CV contains any selected programming languages
  const hasSelectedLanguages = (cv: CV): boolean => {
    if (selectedLanguages.length === 0) return true;
    
    // Check programming languages in skills
    const hasInSkills = cv.skills?.some((skill: string) => 
      selectedLanguages.some(lang => skill.toLowerCase().includes(lang.toLowerCase()))
    );
    
    // Check programming languages in education or other text fields
    const hasInEducation = selectedLanguages.some(lang => 
      cv.education?.toLowerCase().includes(lang.toLowerCase())
    );
    
    // Check programming languages in industry experience
    const hasInExperience = selectedLanguages.some(lang => 
      cv.industry_experience?.toLowerCase().includes(lang.toLowerCase())
    );
    
    return hasInSkills || hasInEducation || hasInExperience;
  };

  // Check if a CV is related to selected job positions
  const hasSelectedPositions = (cv: CV): boolean => {
    if (selectedPositions.length === 0) return true;
    
    // Check position in current job title
    const hasInTitle = selectedPositions.some(position => 
      cv.current_job_title?.toLowerCase().includes(position.toLowerCase())
    );
    
    // Check position in industry experience
    const hasInExperience = selectedPositions.some(position => 
      cv.industry_experience?.toLowerCase().includes(position.toLowerCase())
    );
    
    // Check position in career goals
    const hasInGoals = selectedPositions.some(position => 
      cv.career_goals?.toLowerCase().includes(position.toLowerCase())
    );
    
    return hasInTitle || hasInExperience || hasInGoals;
  };

  // Calculate scores for each CV using the configured weights
  const scoreCVs = (cvList: CV[]) => {
    return cvList.map(cv => {
      // Calculate skill score based on matching skills
      const skillScore = selectedSkills.length > 0
        ? selectedSkills.filter(skill => 
            cv.skills?.some((cvSkill: string) => 
              cvSkill.toLowerCase().includes(skill.toLowerCase())
            )
          ).length / selectedSkills.length
        : 0.5; // Neutral score if no skills selected
      
      // Calculate experience score (normalized to 0-1)
      const experienceScore = Math.min(cv.years_experience / 10, 1);
      
      // Calculate education score (simplified)
      const educationScore = cv.education ? 0.8 : 0.2;
      
      // Calculate requirements match score
      const matchScore = cv.requirements_match ? cv.requirements_match / 100 : 0.5;
      
      // Calculate weighted score
      const totalScore = 
        skillScore * scoringConfig.skillsWeight +
        experienceScore * scoringConfig.experienceWeight +
        educationScore * scoringConfig.educationWeight +
        matchScore * scoringConfig.matchWeight;
      
      return {
        ...cv,
        _score: totalScore
      };
    });
  };

  // Filter and sort CVs
  const filteredAndSortedCVs = () => {
    if (!cvs) return [];
    
    // First filter the CVs
    return scoreCVs(
      cvs.filter(cv => {
          // Filter by status
          if (statusFilter !== "all" && cv.status !== statusFilter) {
            return false;
          }
          
          // Filter by search query
          if (!matchesSearchQuery(cv)) {
            return false;
          }
          
          // Filter by experience
          if (cv.years_experience < minExperience || cv.years_experience > maxExperience) {
            return false;
          }
          
          // Filter by selected skills
          if (selectedSkills.length > 0) {
            const hasAllSelectedSkills = selectedSkills.every(skill =>
              cv.skills?.some((cvSkill: string) => 
                cvSkill.toLowerCase().includes(skill.toLowerCase())
              )
            );
            
            if (!hasAllSelectedSkills) {
              return false;
            }
          }

          // Filter by programming languages
          if (!hasSelectedLanguages(cv)) {
            return false;
          }

          // Filter by job positions
          if (!hasSelectedPositions(cv)) {
            return false;
          }

          return true;
        })
      ).sort((a, b) => {
        // Sort by the selected criteria
        switch (sortCriteria) {
          case "experience":
            return sortOrder === "asc" 
              ? a.years_experience - b.years_experience
              : b.years_experience - a.years_experience;
          
          case "name":
            return sortOrder === "asc"
              ? a.applicant_name.localeCompare(b.applicant_name)
              : b.applicant_name.localeCompare(a.applicant_name);
          
          case "date":
            return sortOrder === "asc"
              ? new Date(a.application_date).getTime() - new Date(b.application_date).getTime()
              : new Date(b.application_date).getTime() - new Date(a.application_date).getTime();
          
          case "rating":
            return sortOrder === "asc"
              ? (a.rating || 0) - (b.rating || 0)
              : (b.rating || 0) - (a.rating || 0);
          
          case "score":
          default:
            return sortOrder === "asc"
              ? a._score - b._score
              : b._score - a._score;
        }
      });
  };

  if (isLoading) {
    return (
      <div className="bg-primary relative md:flex flex-col items-center justify-center p-8 min-h-screen">
        <Sidebar />
        <div className="ml-[88px] p-6 w-full flex items-center justify-center">
          <div className="text-xl">Loading CVs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-primary relative md:flex flex-col items-center justify-center p-8 min-h-screen">
        <Sidebar />
        <div className="ml-[88px] p-6 w-full flex items-center justify-center">
          <div className="text-xl text-red-500">Error: {error.message}</div>
        </div>
      </div>
    );
  }

  const filteredCVList = filteredAndSortedCVs();

  return (
    <div className="bg-primary relative md:flex flex-col items-center justify-center p-8 min-h-screen">
      <Sidebar />

      <div className="ml-[88px] p-6 w-full">
        <div className="bg-secondary backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">CV Sorting</h1>
            <Button variant="destructive" className="rounded-xl gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <Card className="mt-4 bg-white">
            <CardContent className="p-4">
              {/* Search and filter controls */}
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, skills, or job title..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={showFilters ? "default" : "outline"}
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-1"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                  
                  <Button
                    variant={showScoringConfig ? "default" : "outline"}
                    onClick={() => setShowScoringConfig(!showScoringConfig)}
                    className="gap-1"
                  >
                    <Sliders className="h-4 w-4" />
                    Scoring
                  </Button>
                  
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
              
              {/* Sort controls */}
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="text-sm">Sort by:</span>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    variant={sortCriteria === "score" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSortCriteria("score");
                      setSortOrder(sortOrder === "desc" && sortCriteria === "score" ? "asc" : "desc");
                    }}
                  >
                    Match Score {sortCriteria === "score" && (sortOrder === "desc" ? "↓" : "↑")}
                  </Button>
                  
                  <Button
                    variant={sortCriteria === "experience" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSortCriteria("experience");
                      setSortOrder(sortOrder === "desc" && sortCriteria === "experience" ? "asc" : "desc");
                    }}
                  >
                    Experience {sortCriteria === "experience" && (sortOrder === "desc" ? "↓" : "↑")}
                  </Button>
                  
                  <Button
                    variant={sortCriteria === "name" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSortCriteria("name");
                      setSortOrder(sortOrder === "desc" && sortCriteria === "name" ? "asc" : "desc");
                    }}
                  >
                    Name {sortCriteria === "name" && (sortOrder === "desc" ? "↓" : "↑")}
                  </Button>
                  
                  <Button
                    variant={sortCriteria === "date" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSortCriteria("date");
                      setSortOrder(sortOrder === "desc" && sortCriteria === "date" ? "asc" : "desc");
                    }}
                  >
                    Date {sortCriteria === "date" && (sortOrder === "desc" ? "↓" : "↑")}
                  </Button>
                  
                  <Button
                    variant={sortCriteria === "rating" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSortCriteria("rating");
                      setSortOrder(sortOrder === "desc" && sortCriteria === "rating" ? "asc" : "desc");
                    }}
                  >
                    Rating {sortCriteria === "rating" && (sortOrder === "desc" ? "↓" : "↑")}
                  </Button>
                </div>
              </div>
              
              {/* Filter options */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4 mt-4 bg-gray-50 rounded-lg">
                  {/* Status filter */}
                  <div>
                    <h4 className="font-medium mb-2">Application Status</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all" />
                            <Label htmlFor="all">All</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pending" id="pending" />
                            <Label htmlFor="pending">Pending</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="accepted" id="accepted" />
                            <Label htmlFor="accepted">Accepted</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rejected" id="rejected" />
                            <Label htmlFor="rejected">Rejected</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                  
                  {/* Experience filter */}
                  <div>
                    <h4 className="font-medium mb-2">Experience Range</h4>
                    <div className="px-2">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>{minExperience} years</span>
                        <span>{maxExperience} years</span>
                      </div>
                      <Slider
                        defaultValue={[minExperience, maxExperience]}
                        max={30}
                        step={1}
                        onValueChange={(values) => {
                          setMinExperience(values[0]);
                          setMaxExperience(values[1]);
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Skills filter */}
                  <div>
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedSkills.map(skill => (
                        <Badge 
                          key={skill} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {["React", "JavaScript", "Python", "Node.js", "AWS", "SQL", "TypeScript", "Java"].map(skill => (
                        <Badge 
                          key={skill}
                          variant={selectedSkills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Programming Languages Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-4 w-4" />
                      <h4 className="font-medium">Programming Languages</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedLanguages.map(language => (
                        <Badge 
                          key={language} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => toggleLanguage(language)}
                        >
                          {language}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {programmingLanguages.map(language => (
                        <div key={language} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`lang-${language}`}
                            checked={selectedLanguages.includes(language)}
                            onCheckedChange={() => toggleLanguage(language)}
                          />
                          <Label htmlFor={`lang-${language}`} className="truncate">
                            {language}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Job Positions Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4" />
                      <h4 className="font-medium">Job Positions</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedPositions.map(position => (
                        <Badge 
                          key={position} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => togglePosition(position)}
                        >
                          {position}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {jobPositions.map(position => (
                        <div key={position} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`pos-${position}`}
                            checked={selectedPositions.includes(position)}
                            onCheckedChange={() => togglePosition(position)}
                          />
                          <Label htmlFor={`pos-${position}`} className="truncate">
                            {position}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Active filters display */}
              {(statusFilter !== "all" || searchQuery || selectedSkills.length > 0 || 
                selectedLanguages.length > 0 || selectedPositions.length > 0 || 
                minExperience > 0 || maxExperience < 30) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm text-muted-foreground mt-1">Active filters:</span>
                  {statusFilter !== "all" && (
                    <Badge variant="outline">
                      Status: {statusFilter}
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="outline">
                      Search: {searchQuery}
                    </Badge>
                  )}
                  {(minExperience > 0 || maxExperience < 30) && (
                    <Badge variant="outline">
                      Experience: {minExperience} - {maxExperience} years
                    </Badge>
                  )}
                  {selectedSkills.length > 0 && (
                    <Badge variant="outline">
                      Skills: {selectedSkills.length} selected
                    </Badge>
                  )}
                  {selectedLanguages.length > 0 && (
                    <Badge variant="outline">
                      Languages: {selectedLanguages.length} selected
                    </Badge>
                  )}
                  {selectedPositions.length > 0 && (
                    <Badge variant="outline">
                      Positions: {selectedPositions.length} selected
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCVList.map(cv => (
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
                        {cv.skills.slice(0, 3).map((skill: string) => (
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
