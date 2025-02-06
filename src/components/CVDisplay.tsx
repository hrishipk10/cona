import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit } from "lucide-react";

interface CVDisplayProps {
  cv: {
    applicant_name: string;
    years_experience: number;
    skills: string[];
    status: string;
    email?: string;
    phone?: string;
    address?: string;
    linkedin_profile?: string;
    github_profile?: string;
    portfolio_link?: string;
    current_job_title?: string;
    languages_known?: string[];
    education?: string;
    certifications?: string;
    references?: string;
    desired_salary?: string;
    willingness_to_relocate?: boolean;
    availability_for_remote_work?: boolean;
    industry_experience?: string;
    career_goals?: string;
  };
  onEdit: () => void;
}

const CVDisplay = ({ cv, onEdit }: CVDisplayProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">Full Name</h3>
        <p>{cv.applicant_name}</p>
      </div>

      <div>
        <h3 className="font-medium">Contact Information</h3>
        <div className="space-y-2">
          <p>Email: {cv.email}</p>
          <p>Phone: {cv.phone}</p>
          <p>Address: {cv.address}</p>
        </div>
      </div>

      <div>
        <h3 className="font-medium">Professional Links</h3>
        <div className="space-y-2">
          <p>LinkedIn: {cv.linkedin_profile}</p>
          <p>GitHub: {cv.github_profile}</p>
          <p>Portfolio: {cv.portfolio_link}</p>
        </div>
      </div>

      <div>
        <h3 className="font-medium">Current Position</h3>
        <p>{cv.current_job_title}</p>
      </div>

      <div>
        <h3 className="font-medium">Years of Experience</h3>
        <p>{cv.years_experience} years</p>
      </div>

      <div>
        <h3 className="font-medium">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {cv.skills.map((skill: string, index: number) => (
            <span
              key={index}
              className="bg-secondary px-2 py-1 rounded-md text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium">Languages Known</h3>
        <div className="flex flex-wrap gap-2">
          {cv.languages_known?.map((language: string, index: number) => (
            <span
              key={index}
              className="bg-secondary px-2 py-1 rounded-md text-sm"
            >
              {language}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium">Education</h3>
        <p>{cv.education}</p>
      </div>

      <div>
        <h3 className="font-medium">Certifications</h3>
        <p>{cv.certifications}</p>
      </div>

      <div>
        <h3 className="font-medium">References</h3>
        <p>{cv.references}</p>
      </div>

    
      <div>
  <h3 className="font-medium">Desired Salary</h3>
  <div className="flex flex-wrap gap-2">
    <span className="bg-secondary px-2 py-1 rounded-md text-sm">
      {cv.desired_salary}
    </span>
  </div>
</div>

      <div>
        <h3 className="font-medium">Work Preferences</h3>
        <div className="space-y-2">
          <p>Willing to Relocate: {cv.willingness_to_relocate ? "Yes" : "No"}</p>
          <p>Available for Remote Work: {cv.availability_for_remote_work ? "Yes" : "No"}</p>
        </div>
      </div>

      <div>
        <h3 className="font-medium">Industry Experience</h3>
        <p>{cv.industry_experience}</p>
      </div>

      <div>
        <h3 className="font-medium">Career Goals</h3>
        <p>{cv.career_goals}</p>
      </div>

      <div>
        <h3 className="font-medium">Status</h3>
        <p className="capitalize">{cv.status}</p>
      </div>

      <Button
        variant="outline"
        onClick={onEdit}
        className="flex items-center gap-2"
      >
        <Edit className="h-4 w-4" />
        Edit CV
      </Button>
    </div>
  );
};

export default CVDisplay;
