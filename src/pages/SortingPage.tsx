
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, SortAsc, FileText, Settings, Filter, Search, X, ArrowUpDown, Sliders, Code, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
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
  matchWeight: number;
  certificationBonus: number;
  referencesBonus: number;
  languagesWeight: number;
}

const SortingPage = () => {
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [maxExperience, setMaxExperience] = useState<number>(30);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showScoringConfig, setShowScoringConfig] = useState<boolean>(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  
  // Default scoring config
  const [scoringConfig, setScoringConfig] = useState<ScoringConfig>({
    skillsWeight: 2,
    experienceWeight: 5,
    matchWeight: 1,
    certificationBonus: 15,
    referencesBonus: 10,
    languagesWeight: 1
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: cvs, isLoading, error } = useQuery({
    queryKey: ["cvs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cvs").select("*");
      if (error) throw error;
      return data as CV[];
    },
  });

  // Function to extract all unique skills from CVs
  const allSkills = cvs
    ? Array.from(
        new Set(
          cvs.flatMap((cv) => cv.skills || [])
        )
      ).sort()
    : [];

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
      description: "All filtering criteria have been reset.",
    });
  };

  const resetScoringConfig = () => {
    setScoringConfig({
      skillsWeight: 2,
      experienceWeight: 5,
      matchWeight: 1,
      certificationBonus: 15,
      referencesBonus: 10,
      languagesWeight: 1
    });
    
    toast({
      title: "Scoring reset",
      description: "Scoring configuration has been reset to default values.",
    });
  };

  const saveScoringConfig = () => {
    toast({
      title: "Scoring configuration saved",
      description: "Your scoring preferences have been applied.",
    });
    setShowScoringConfig(false);
  };

  const toggleSort = (criteria: SortCriteria) => {
    if (sortCriteria === criteria) {
      // Toggle sort order if same criteria
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new criteria and default to descending
      setSortCriteria(criteria);
      setSortOrder("desc");
    }
  };

  // Check if a CV contains any selected programming languages
  const hasSelectedLanguages = (cv: CV): boolean => {
    if (selectedLanguages.length === 0) return true;
    
    // Check programming languages in skills
    const hasInSkills = cv.skills?.some(skill => 
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
      const skillsScore = (cv.skills?.length || 0) * scoringConfig.skillsWeight;
      const experienceScore = cv.years_experience * scoringConfig.experienceWeight;
      const matchScore = (cv.requirements_match || 0) * scoringConfig.matchWeight;
      const certificationBonus = cv.certifications ? scoringConfig.certificationBonus : 0;
      const referencesBonus = cv.references ? scoringConfig.referencesBonus : 0;
      const languagesScore = (cv.languages_known?.length || 0) * scoringConfig.languagesWeight;
      
      const totalScore = skillsScore + experienceScore + matchScore + 
                         certificationBonus + referencesBonus + languagesScore;
      
      return { ...cv, performanceScore: totalScore };
    });
  };

  // Filter and sort CVs
  const filteredAndSortedCVs = cvs
    ? scoreCVs(
        cvs.filter((cv) => {
          // Filter by status
          if (statusFilter !== "all" && cv.status !== statusFilter) {
            return false;
          }

          // Filter by search query
          if (
            searchQuery &&
            !cv.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !cv.current_job_title?.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            return false;
          }

          // Filter by selected skills (AND logic)
          if (
            selectedSkills.length > 0 &&
            !selectedSkills.every((skill) => cv.skills?.includes(skill))
          ) {
            return false;
          }

          // Filter by experience range
          if (cv.years_experience < minExperience || cv.years_experience > maxExperience) {
            return false;
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
        const multiplier = sortOrder === "asc" ? 1 : -1;

        switch (sortCriteria) {
          case "experience":
            return multiplier * (a.years_experience - b.years_experience);
          case "skills":
            return multiplier * ((a.skills?.length || 0) - (b.skills?.length || 0));
          case "rating":
            return multiplier * ((a.rating || 0) - (b.rating || 0));
          case "name":
            return multiplier * a.applicant_name.localeCompare(b.applicant_name);
          case "date":
            const dateA = a.application_date || a.created_at || "";
            const dateB = b.application_date || b.created_at || "";
            return multiplier * dateA.localeCompare(dateB);
          case "score":
            return multiplier * (a.performanceScore - b.performanceScore);
          default:
            return 0;
        }
      })
    : [];

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

  // Format the skill name for display
  const formatSkillName = (skill: string) => {
    return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
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
        {/* Header and Search */}
        <Card className="mb-6 bg-secondary backdrop-blur border-none">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>CV Sorting & Filtering</CardTitle>
                <CardDescription>Find and sort candidates by multiple criteria</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowScoringConfig(!showScoringConfig)}
                >
                  <Sliders className="h-4 w-4" />
                  {showScoringConfig ? "Hide Scoring" : "Scoring Config"}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search bar */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or job title..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scoring configuration (conditionally displayed) */}
            {showScoringConfig && (
              <div className="border rounded-lg p-4 mt-4 space-y-4 bg-white/30">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Scoring Configuration</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetScoringConfig}
                  >
                    Reset to Default
                  </Button>
                </div>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="skills-weight">Skills Weight</Label>
                        <span className="text-sm font-medium">{scoringConfig.skillsWeight}</span>
                      </div>
                      <Slider 
                        id="skills-weight"
                        min={0} 
                        max={10} 
                        step={1}
                        value={[scoringConfig.skillsWeight]} 
                        onValueChange={(value) => setScoringConfig(prev => ({ ...prev, skillsWeight: value[0] }))} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Points per skill</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="exp-weight">Experience Weight</Label>
                        <span className="text-sm font-medium">{scoringConfig.experienceWeight}</span>
                      </div>
                      <Slider 
                        id="exp-weight"
                        min={0} 
                        max={10} 
                        step={1}
                        value={[scoringConfig.experienceWeight]} 
                        onValueChange={(value) => setScoringConfig(prev => ({ ...prev, experienceWeight: value[0] }))} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Points per year of experience</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="match-weight">Requirements Match Weight</Label>
                        <span className="text-sm font-medium">{scoringConfig.matchWeight}</span>
                      </div>
                      <Slider 
                        id="match-weight"
                        min={0} 
                        max={5} 
                        step={0.5}
                        value={[scoringConfig.matchWeight]} 
                        onValueChange={(value) => setScoringConfig(prev => ({ ...prev, matchWeight: value[0] }))} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Multiplier for requirements match</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="cert-bonus">Certification Bonus</Label>
                        <span className="text-sm font-medium">{scoringConfig.certificationBonus}</span>
                      </div>
                      <Slider 
                        id="cert-bonus"
                        min={0} 
                        max={50} 
                        step={5}
                        value={[scoringConfig.certificationBonus]} 
                        onValueChange={(value) => setScoringConfig(prev => ({ ...prev, certificationBonus: value[0] }))} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Bonus points for having certifications</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="ref-bonus">References Bonus</Label>
                        <span className="text-sm font-medium">{scoringConfig.referencesBonus}</span>
                      </div>
                      <Slider 
                        id="ref-bonus"
                        min={0} 
                        max={50} 
                        step={5}
                        value={[scoringConfig.referencesBonus]} 
                        onValueChange={(value) => setScoringConfig(prev => ({ ...prev, referencesBonus: value[0] }))} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Bonus points for having references</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="lang-weight">Languages Weight</Label>
                        <span className="text-sm font-medium">{scoringConfig.languagesWeight}</span>
                      </div>
                      <Slider 
                        id="lang-weight"
                        min={0} 
                        max={5} 
                        step={0.5}
                        value={[scoringConfig.languagesWeight]} 
                        onValueChange={(value) => setScoringConfig(prev => ({ ...prev, languagesWeight: value[0] }))} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Points per language known</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={saveScoringConfig}>
                    Apply Scoring Configuration
                  </Button>
                </div>
              </div>
            )}

            {/* Advanced filters (conditionally displayed) */}
            {showFilters && (
              <div className="border rounded-lg p-4 mt-4 space-y-4 bg-white/30">
                <h3 className="text-lg font-medium">Advanced Filters</h3>
                <Separator />
                
                {/* Experience Range */}
                <div>
                  <h4 className="font-medium mb-2">Experience Range (years)</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor="min-exp">Minimum</Label>
                      <Input
                        id="min-exp"
                        type="number"
                        min="0"
                        max="30"
                        value={minExperience}
                        onChange={(e) => setMinExperience(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="max-exp">Maximum</Label>
                      <Input
                        id="max-exp"
                        type="number"
                        min="0"
                        max="30"
                        value={maxExperience}
                        onChange={(e) => setMaxExperience(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Skills filter */}
                <div>
                  <h4 className="font-medium mb-2">Skills (AND logic)</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedSkills.map(skill => (
                      <Badge 
                        key={skill} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => toggleSkill(skill)}
                      >
                        {formatSkillName(skill)}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {allSkills.map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`skill-${skill}`}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                        />
                        <Label htmlFor={`skill-${skill}`} className="truncate">
                          {formatSkillName(skill)}
                        </Label>
                      </div>
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
                  <Badge variant="outline" className="capitalize">
                    Status: {statusFilter}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="outline">
                    Search: "{searchQuery}"
                  </Badge>
                )}
                {(minExperience > 0 || maxExperience < 30) && (
                  <Badge variant="outline">
                    Experience: {minExperience}-{maxExperience} years
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

        {/* Sorting Controls */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant={sortCriteria === "score" ? "default" : "outline"}
            onClick={() => toggleSort("score")}
            className="gap-2"
          >
            <ArrowUpDown className={`h-4 w-4 ${sortCriteria === "score" ? "text-primary-foreground" : "text-foreground"}`} />
            Total Score {sortCriteria === "score" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
          </Button>
          <Button
            variant={sortCriteria === "experience" ? "default" : "outline"}
            onClick={() => toggleSort("experience")}
            className="gap-2"
          >
            <ArrowUpDown className={`h-4 w-4 ${sortCriteria === "experience" ? "text-primary-foreground" : "text-foreground"}`} />
            Experience {sortCriteria === "experience" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
          </Button>
          <Button
            variant={sortCriteria === "skills" ? "default" : "outline"}
            onClick={() => toggleSort("skills")}
            className="gap-2"
          >
            <ArrowUpDown className={`h-4 w-4 ${sortCriteria === "skills" ? "text-primary-foreground" : "text-foreground"}`} />
            Skills {sortCriteria === "skills" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
          </Button>
          <Button
            variant={sortCriteria === "rating" ? "default" : "outline"}
            onClick={() => toggleSort("rating")}
            className="gap-2"
          >
            <ArrowUpDown className={`h-4 w-4 ${sortCriteria === "rating" ? "text-primary-foreground" : "text-foreground"}`} />
            Rating {sortCriteria === "rating" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
          </Button>
          <Button
            variant={sortCriteria === "name" ? "default" : "outline"}
            onClick={() => toggleSort("name")}
            className="gap-2"
          >
            <ArrowUpDown className={`h-4 w-4 ${sortCriteria === "name" ? "text-primary-foreground" : "text-foreground"}`} />
            Name {sortCriteria === "name" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
          </Button>
          <Button
            variant={sortCriteria === "date" ? "default" : "outline"}
            onClick={() => toggleSort("date")}
            className="gap-2"
          >
            <ArrowUpDown className={`h-4 w-4 ${sortCriteria === "date" ? "text-primary-foreground" : "text-foreground"}`} />
            Date {sortCriteria === "date" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
          </Button>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredAndSortedCVs.length} results {cvs && cvs.length !== filteredAndSortedCVs.length ? `(filtered from ${cvs.length})` : ""}
        </div>

        {/* Sorted CVs List */}
        <Card className="bg-secondary backdrop-blur border-none">
          <CardHeader>
            <CardTitle>Sorted Applications</CardTitle>
            <CardDescription>
              {sortCriteria === "score" && `Sorted by total score ${sortOrder === "desc" ? "highest to lowest" : "lowest to highest"}`}
              {sortCriteria === "experience" && `Sorted by years of experience ${sortOrder === "desc" ? "highest to lowest" : "lowest to highest"}`}
              {sortCriteria === "skills" && `Sorted by number of skills ${sortOrder === "desc" ? "highest to lowest" : "lowest to highest"}`}
              {sortCriteria === "rating" && `Sorted by rating ${sortOrder === "desc" ? "highest to lowest" : "lowest to highest"}`}
              {sortCriteria === "name" && `Sorted by name ${sortOrder === "asc" ? "A to Z" : "Z to A"}`}
              {sortCriteria === "date" && `Sorted by application date ${sortOrder === "desc" ? "newest to oldest" : "oldest to newest"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAndSortedCVs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No applications match your current filters</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedCVs.map((cv, index) => (
                  <div
                    key={index}
                    className="flex items-center hover:bg-gray-100 p-4 rounded-lg transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/cv/${cv.id}`)}
                  >
                    <Avatar className="h-12 w-12 mr-4">
                      {cv.avatar_url ? (
                        <AvatarImage src={cv.avatar_url} alt={cv.applicant_name} />
                      ) : (
                        <AvatarFallback>{cv.applicant_name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{cv.applicant_name}</p>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-500 mr-2">
                          {cv.current_job_title || "Applicant"} • {cv.years_experience} years
                        </p>
                        {/* Display top skills (up to 3) */}
                        <div className="flex gap-1">
                          {cv.skills?.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {formatSkillName(skill)}
                            </Badge>
                          ))}
                          {cv.skills && cv.skills.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{cv.skills.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        Score: {cv.performanceScore.toFixed(0)}
                      </Badge>
                      <div>
                        <span className="text-sm text-gray-500">
                          {formatDate(cv.application_date || cv.created_at)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cv.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : cv.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {cv.status}
                        </span>
                        {cv.rating && (
                          <span className="ml-2 text-sm font-medium">
                            {cv.rating}/5
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
