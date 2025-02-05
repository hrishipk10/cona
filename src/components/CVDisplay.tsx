import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit } from "lucide-react";

interface CVDisplayProps {
  cv: {
    applicant_name: string;
    years_experience: number;
    skills: string[];
    status: string;
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