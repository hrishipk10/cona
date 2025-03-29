
import { Button } from "@/components/ui/button";
import {
  Edit,
  Upload,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
} from "lucide-react";

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
    avatar_url?: string;
  };
  onEdit: () => void;
  isAdmin?: boolean;
}

const CVDisplay = ({ cv, onEdit, isAdmin = false }: CVDisplayProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-secondary shadow-lg rounded-lg">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6">
        {cv.avatar_url ? (
          <img
            src={cv.avatar_url}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-primary"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center">
            <Upload className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        <div className="mt-4 md:mt-0 text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {cv.applicant_name}
          </h1>
          {cv.current_job_title && (
            <p className="text-xl text-muted-foreground mt-2">
              {cv.current_job_title}
            </p>
          )}
          {cv.industry_experience && (
            <p className="text-muted-foreground mt-1">{cv.industry_experience}</p>
          )}
          {/* Social Links */}
          <div className="flex justify-center md:justify-start space-x-4 mt-4">
            {cv.linkedin_profile && (
              <a
                href={cv.linkedin_profile}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            )}
            {cv.github_profile && (
              <a
                href={cv.github_profile}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
            )}
            {cv.portfolio_link && (
              <a
                href={cv.portfolio_link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Globe className="w-6 h-6" />
              </a>
            )}
          </div>
        </div>
        {/* Application Status */}
        <div className="mt-4 md:mt-0 text-center md:text-right">
          <h2 className="text-xl font-semibold text-primary mb-4">
            Application Status
          </h2>
          <p
            className={`capitalize inline-block px-3 py-1 rounded-full text-sm font-medium ${
              cv.status === "accepted"
                ? "bg-green-100 text-green-800"
                : cv.status === "rejected"
                ? "bg-destructive/10 text-red-800"
                : "bg-background text-red-400"
            }`}
          >
            {cv.status}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-border my-6"></div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">
              Contact Information
            </h2>
            <div className="space-y-2 text-foreground">
              {cv.email && (
                <p className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary" />
                  {cv.email}
                </p>
              )}
              {cv.phone && (
                <p className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-primary" />
                  {cv.phone}
                </p>
              )}
              {cv.address && (
                <p className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  {cv.address}
                </p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {cv.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-primary text-background px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Languages Known */}
          {cv.languages_known && cv.languages_known.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">
                Languages Known
              </h2>
              <div className="flex flex-wrap gap-2">
                {cv.languages_known.map((language, index) => (
                  <span
                    key={index}
                    className="bg-primary text-background px-3 py-1 rounded-full text-sm"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {cv.education && (
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">
                Education
              </h2>
              <p className="text-foreground">{cv.education}</p>
            </div>
          )}

          {/* Certifications */}
          {cv.certifications && (
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">
                Certifications
              </h2>
              <p className="text-foreground">{cv.certifications}</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Professional Experience */}
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">
              Professional Experience
            </h2>
            <p className="text-foreground">
              <span className="font-medium">Years of Experience:</span>{" "}
              {cv.years_experience} years
            </p>
            {cv.career_goals && (
              <p className="text-foreground mt-2">{cv.career_goals}</p>
            )}
          </div>

          {/* Work Preferences */}
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">
              Work Preferences
            </h2>
            <p className="text-foreground">
              <span className="font-medium">Willing to Relocate:</span>{" "}
              {cv.willingness_to_relocate ? "Yes" : "No"}
            </p>
            <p className="text-foreground">
              <span className="font-medium">Available for Remote Work:</span>{" "}
              {cv.availability_for_remote_work ? "Yes" : "No"}
            </p>
          </div>

          {/* Desired Salary */}
          {cv.desired_salary && (
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">
                Desired Salary
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary text-background px-3 py-1 rounded-full text-sm">
                  {cv.desired_salary}
                </span>
              </div>
            </div>
          )}

          {/* References */}
          {cv.references && (
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">
                References
              </h2>
              <p className="text-foreground">{cv.references}</p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-6"></div>

      {/* Edit Button - Only show for non-admin users or when explicitly allowed */}
      {!isAdmin && (
        <div className="flex justify-end">
          <Button
            onClick={onEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit CV
          </Button>
        </div>
      )}
    </div>
  );
};

export default CVDisplay;
