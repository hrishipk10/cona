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
  Download,
} from "lucide-react";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    theme?: string;
  };
  onEdit: () => void;
  isAdmin?: boolean;
  onThemeChange?: (theme: string) => void;
}

const CVDisplay = ({ cv, onEdit, isAdmin = false, onThemeChange }: CVDisplayProps) => {
  const cvRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!cvRef.current) return;

    const canvas = await html2canvas(cvRef.current, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for external images
      logging: false,
      backgroundColor: getThemeBackground(cv.theme || 'default'),
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${cv.applicant_name}-CV.pdf`);
  };

  const getThemeBackground = (theme: string): string => {
    switch (theme) {
      case 'dark': return '#1a1a1a';
      case 'blue': return '#f0f5ff';
      case 'green': return '#f0fff4';
      case 'purple': return '#f5f0ff';
      default: return '#ffffff';
    }
  };

  const getThemeClasses = (theme: string): string => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-white shadow-xl';
      case 'blue':
        return 'bg-blue-50 text-blue-900 shadow-lg';
      case 'green':
        return 'bg-green-50 text-green-900 shadow-lg';
      case 'purple':
        return 'bg-purple-50 text-purple-900 shadow-lg';
      default:
        return 'bg-secondary shadow-lg';
    }
  };

  const getHeaderClasses = (theme: string): string => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-white';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-secondary text-foreground';
    }
  };

  const getAccentClasses = (theme: string): string => {
    switch (theme) {
      case 'dark':
        return 'text-blue-400';
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      case 'purple':
        return 'text-purple-600';
      default:
        return 'text-primary';
    }
  };

  const getButtonClasses = (theme: string): string => {
    switch (theme) {
      case 'dark':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'blue':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'green':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'purple':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      default:
        return '';
    }
  };

  const getSkillClasses = (theme: string): string => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-700 text-white';
      case 'blue':
        return 'bg-blue-200 text-blue-800';
      case 'green':
        return 'bg-green-200 text-green-800';
      case 'purple':
        return 'bg-purple-200 text-purple-800';
      default:
        return 'bg-primary text-background';
    }
  };

  const themeValue = cv.theme || 'default';
  const themeClasses = getThemeClasses(themeValue);
  const headerClasses = getHeaderClasses(themeValue);
  const accentClasses = getAccentClasses(themeValue);
  const skillClasses = getSkillClasses(themeValue);

  return (
    <div>
      {!isAdmin && onThemeChange && (
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Theme:</span>
            <Select
              value={themeValue}
              onValueChange={onThemeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div ref={cvRef} className={`max-w-4xl mx-auto p-6 rounded-lg ${themeClasses}`}>
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
            <h1 className="text-3xl font-bold">
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
                  className={`hover:${accentClasses} transition-colors`}
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {cv.github_profile && (
                <a
                  href={cv.github_profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hover:${accentClasses} transition-colors`}
                >
                  <Github className="w-6 h-6" />
                </a>
              )}
              {cv.portfolio_link && (
                <a
                  href={cv.portfolio_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hover:${accentClasses} transition-colors`}
                >
                  <Globe className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
          {/* Application Status */}
          <div className="mt-4 md:mt-0 text-center md:text-right">
            <h2 className={`text-xl font-semibold ${accentClasses} mb-4`}>
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
              <h2 className={`text-xl font-semibold ${accentClasses} mb-4`}>
                Contact Information
              </h2>
              <div className="space-y-2">
                {cv.email && (
                  <p className="flex items-center">
                    <Mail className={`w-5 h-5 mr-2 ${accentClasses}`} />
                    {cv.email}
                  </p>
                )}
                {cv.phone && (
                  <p className="flex items-center">
                    <Phone className={`w-5 h-5 mr-2 ${accentClasses}`} />
                    {cv.phone}
                  </p>
                )}
                {cv.address && (
                  <p className="flex items-center">
                    <MapPin className={`w-5 h-5 mr-2 ${accentClasses}`} />
                    {cv.address}
                  </p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className={`text-xl font-semibold ${accentClasses} mb-4`}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {cv.skills.map((skill, index) => (
                  <span
                    key={index}
                    className={`${skillClasses} px-3 py-1 rounded-full text-sm`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages Known */}
            {cv.languages_known && cv.languages_known.length > 0 && (
              <div>
                <h2 className={`text-xl font-semibold ${accentClasses} mb-4`}>
                  Languages Known
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cv.languages_known.map((language, index) => (
                    <span
                      key={index}
                      className={`${skillClasses} px-3 py-1 rounded-full text-sm`}
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
                <h2 className={`text-xl font-semibold ${accentClasses} mb-4`}>
                  Education
                </h2>
                <p>{cv.education}</p>
              </div>
            )}

            {/* Certifications */}
            {cv.certifications && (
              <div>
                <h2 className={`text-xl font-semibold ${accentClasses} mb-4`}>
                  Certifications
                </h2>
                <p>{cv.certifications}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Professional Experience */}
            <div>
              <h2 className={`text-xl font-semibold ${accentClasses} mb-4`}>
                Professional Experience
              </h2>
              <p>
                <span className="font-medium">Years of Experience:</span>{" "}
                {cv.years_experience} years
              </p>
              {cv.career_goals && (
                <p className="mt-2">{cv.career_goals}</p>
              )}
            </div>

            {/* Work Preferences */}
            <div>
              <h2 className={`text-xl font-semibold ${accentClasses} mb-4`}>
                Work Preferences
              </h2>
              <p>
                <span className="font-medium">Willing to Relocate:</span>{" "}
                {cv.willingness_to_relocate ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-medium">Available for Remote Work:</span>{" "}
                {cv.availability_for_remote_work ? "Yes" : "No"}
              </p>
            </div>

            {/* Desired Salary */}
            {cv.desired_salary && (
              <div>
                <h2 className={`text-xl font-semibold ${accentClasses} mb-4`}>
                  Desired Salary
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className={`${skillClasses} px-3 py-1 rounded-full text-sm`}>
                    {cv.desired_salary}
                  </span>
                </div>
              </div>
            )}

            {/* References */}
            {cv.references && (
              <div>
                <h2 className={`text-xl font-semibold ${accentClasses} mb-4`}>
                  References
                </h2>
                <p>{cv.references}</p>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-6"></div>
      </div>

      {/* Actions */}
      <div className="flex justify-end mt-4 gap-3">
        <Button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>

        {!isAdmin && (
          <Button
            onClick={onEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit CV
          </Button>
        )}
      </div>
    </div>
  );
};

export default CVDisplay;
