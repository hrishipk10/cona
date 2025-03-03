
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, SortAsc, FileText, Settings, Filter, Search, X, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type SortCriteria = "experience" | "skills" | "rating" | "name" | "date";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "pending" | "accepted" | "rejected";

const SortingPage = () => {
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("experience");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [maxExperience, setMaxExperience] = useState<number>(30);
  const [showFilters, setShowFilters] = useState<boolean>(false);
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

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setSelectedSkills([]);
    setMinExperience(0);
    setMaxExperience(30);
    toast({
      title: "Filters cleared",
      description: "All filtering criteria have been reset.",
    });
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

  // Filter and sort CVs
  const filteredAndSortedCVs = cvs
    ? cvs
        .filter((cv) => {
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

          return true;
        })
        .sort((a, b) => {
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
              </div>
            )}

            {/* Active filters display */}
            {(statusFilter !== "all" || searchQuery || selectedSkills.length > 0 || minExperience > 0 || maxExperience < 30) && (
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sorting Controls */}
        <div className="mb-4 flex flex-wrap gap-2">
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
                      <span className="text-sm text-gray-500">
                        {formatDate(cv.application_date || cv.created_at)}
                      </span>
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
