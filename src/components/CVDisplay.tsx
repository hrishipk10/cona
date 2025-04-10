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
  ExternalLink,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    theme_color?: string;
  };
  onEdit: () => void;
  isAdmin?: boolean;
  onThemeChange?: (theme: string) => void;
  onThemeColorChange?: (color: string) => void;
}

// Theme color palettes
const COLOR_PALETTES = {
  default: [
    { name: "Default Blue", value: "default" },
    { name: "Dark", value: "dark" },
    { name: "Blue", value: "blue" },
    { name: "Green", value: "green" },
    { name: "Purple", value: "purple" }
  ],
  minimal: [
    { name: "Gray", value: "gray" },
    { name: "Blue", value: "blue" },
    { name: "Green", value: "green" },
    { name: "Purple", value: "purple" },
    { name: "Red", value: "red" }
  ],
  elegant: [
    { name: "Blue", value: "blue" },
    { name: "Teal", value: "teal" },
    { name: "Purple", value: "purple" },
    { name: "Burgundy", value: "burgundy" },
    { name: "Forest", value: "forest" }
  ],
  creative: [
    { name: "Orange", value: "orange" },
    { name: "Pink", value: "pink" },
    { name: "Teal", value: "teal" },
    { name: "Purple", value: "purple" },
    { name: "Green", value: "green" }
  ]
};

const CVDisplay = ({ cv, onEdit, isAdmin = false, onThemeChange, onThemeColorChange }: CVDisplayProps) => {
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
    const themeType = theme.split("-")[0] || "default";
    const themeColor = theme.split("-")[1] || "";

    switch (themeType) {
      case 'minimal':
        return getMinimalBackground(themeColor);
      case 'elegant':
        return getElegantBackground(themeColor);
      case 'creative':
        return getCreativeBackground(themeColor);
      default:
        return getDefaultBackground(themeColor);
    }
  };

  const getDefaultBackground = (color: string): string => {
    switch (color) {
      case 'dark': return '#1a1a1a';
      case 'blue': return '#f0f5ff';
      case 'green': return '#f0fff4';
      case 'purple': return '#f5f0ff';
      default: return '#ffffff';
    }
  };

  const getMinimalBackground = (color: string): string => {
    switch (color) {
      case 'blue': return '#f0f7ff';
      case 'green': return '#f0faf4';
      case 'purple': return '#f5f3ff';
      case 'red': return '#fff5f5';
      default: return '#ffffff'; // gray is default
    }
  };

  const getElegantBackground = (color: string): string => {
    switch (color) {
      case 'teal': return '#e6fffa';
      case 'purple': return '#f6f5ff';
      case 'burgundy': return '#fff5f7';
      case 'forest': return '#f0fff4';
      default: return '#f8f9fa'; // blue is default
    }
  };

  const getCreativeBackground = (color: string): string => {
    switch (color) {
      case 'pink': return '#fff0f6';
      case 'teal': return '#e6fffa';
      case 'purple': return '#f3f0ff';
      case 'green': return '#ebfbee';
      default: return '#fff8f0'; // orange is default
    }
  };

  // New function to render social links with proper formatting
  const renderSocialLinks = (
    linkedinProfile?: string,
    githubProfile?: string,
    portfolioLink?: string,
    className?: string,
    iconClassName?: string,
    labelClassName?: string
  ) => {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className || ""}`}>
        {linkedinProfile && (
          <a
            href={linkedinProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline transition-colors"
          >
            <Linkedin className={`${iconClassName || "w-5 h-5"}`} />
            <span className={labelClassName || ""}>LinkedIn</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>
        )}
        {githubProfile && (
          <a
            href={githubProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline transition-colors"
          >
            <Github className={`${iconClassName || "w-5 h-5"}`} />
            <span className={labelClassName || ""}>GitHub</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>
        )}
        {portfolioLink && (
          <a
            href={portfolioLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline transition-colors"
          >
            <Globe className={`${iconClassName || "w-5 h-5"}`} />
            <span className={labelClassName || ""}>Portfolio</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>
        )}
      </div>
    );
  };

  const renderTheme = () => {
    const themeParts = (cv.theme || 'default').split('-');
    const themeType = themeParts[0];
    const themeColor = themeParts[1] || '';
    
    switch (themeType) {
      case 'minimal':
        return renderMinimalTheme(themeColor);
      case 'elegant':
        return renderElegantTheme(themeColor);
      case 'creative':
        return renderCreativeTheme(themeColor);
      default:
        return renderDefaultTheme(themeColor);
    }
  };

  const renderDefaultTheme = (themeColor: string) => {
    const themeClasses = getThemeClasses(themeColor);
    const headerClasses = getHeaderClasses(themeColor);
    const accentClasses = getAccentClasses(themeColor);
    const skillClasses = getSkillClasses(themeColor);

    return (
      <div className={`max-w-4xl mx-auto p-6 rounded-lg ${themeClasses}`}>
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
            {/* Updated Social Links */}
            <div className="mt-4 flex-wrap">
              {renderSocialLinks(
                cv.linkedin_profile, 
                cv.github_profile, 
                cv.portfolio_link, 
                "justify-center md:justify-start",
                `w-5 h-5 ${accentClasses}`
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
    );
  };

  const renderMinimalTheme = (themeColor: string = '') => {
    const accentColor = getMinimalAccentColor(themeColor);
    const bgColor = getMinimalBackground(themeColor);

    return (
      <div className={`max-w-4xl mx-auto p-8 rounded-lg shadow-sm`} style={{ backgroundColor: bgColor }}>
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-sans font-bold tracking-tight text-gray-900 mb-2">
            {cv.applicant_name}
          </h1>
          {cv.current_job_title && (
            <p className="text-lg text-gray-600 mb-4">{cv.current_job_title}</p>
          )}
          
          {/* Contact Row */}
          <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-600">
            {cv.email && (
              <span className="flex items-center">
                <Mail className={`w-4 h-4 mr-1`} style={{ color: accentColor }} />
                {cv.email}
              </span>
            )}
            {cv.phone && (
              <span className="flex items-center">
                <Phone className={`w-4 h-4 mr-1`} style={{ color: accentColor }} />
                {cv.phone}
              </span>
            )}
            {cv.address && (
              <span className="flex items-center">
                <MapPin className={`w-4 h-4 mr-1`} style={{ color: accentColor }} />
                {cv.address}
              </span>
            )}
          </div>

          {/* Updated Social Links */}
          {renderSocialLinks(
            cv.linkedin_profile, 
            cv.github_profile, 
            cv.portfolio_link, 
            "justify-center mt-4",
            "w-5 h-5",
            "text-sm"
          )}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Experience */}
          <div>
            <h2 className="text-lg font-semibold border-b border-gray-200 pb-2 mb-4" style={{ color: accentColor }}>
              Professional Experience
            </h2>
            <p className="mb-2">
              <span className="font-medium">Years of Experience:</span>{" "}
              {cv.years_experience} years
            </p>
            {cv.industry_experience && (
              <p className="mb-2">
                <span className="font-medium">Industry:</span> {cv.industry_experience}
              </p>
            )}
            {cv.career_goals && (
              <p className="text-gray-600 italic">{cv.career_goals}</p>
            )}
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-lg font-semibold border-b border-gray-200 pb-2 mb-4" style={{ color: accentColor }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {cv.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-md text-sm text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          {cv.languages_known && cv.languages_known.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4" style={{ color: accentColor }}>
                Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {cv.languages_known.map((language, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-md text-sm text-white"
                    style={{ backgroundColor: accentColor }}
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
              <h2 className="text-lg font-semibold border-b border-gray-200 pb-2 mb-4" style={{ color: accentColor }}>
                Education
              </h2>
              <p>{cv.education}</p>
            </div>
          )}

          {/* Certifications */}
          {cv.certifications && (
            <div>
              <h2 className="text-lg font-semibold border-b border-gray-200 pb-2 mb-4" style={{ color: accentColor }}>
                Certifications
              </h2>
              <p>{cv.certifications}</p>
            </div>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <h3 className="text-md font-medium mb-2" style={{ color: accentColor }}>Work Preferences</h3>
              <p className="text-sm">
                <span className="font-medium">Willing to Relocate:</span>{" "}
                {cv.willingness_to_relocate ? "Yes" : "No"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Available for Remote Work:</span>{" "}
                {cv.availability_for_remote_work ? "Yes" : "No"}
              </p>
            </div>

            {cv.desired_salary && (
              <div>
                <h3 className="text-md font-medium mb-2" style={{ color: accentColor }}>Salary Expectation</h3>
                <p className="text-sm">{cv.desired_salary}</p>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex justify-end mt-4">
            <span
              className={`capitalize inline-block px-3 py-1 rounded-full text-sm font-medium ${
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
      </div>
    );
  };

  const renderElegantTheme = (themeColor: string = '') => {
    const accentColor = getElegantAccentColor(themeColor);
    const bgColor = getElegantBackground(themeColor);
    const headerColor = getElegantHeaderColor(themeColor);

    return (
      <div className="max-w-4xl mx-auto p-10 rounded-lg shadow-md" style={{ backgroundColor: bgColor }}>
        {/* Header with avatar and name */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          {cv.avatar_url ? (
            <img
              src={cv.avatar_url}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover border-4 shadow-md"
              style={{ borderColor: headerColor }}
            />
          ) : (
            <div className="w-36 h-36 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: headerColor }}>
              <Upload className="w-10 h-10 text-white" />
            </div>
          )}
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-sans font-bold tracking-tight mb-1" style={{ color: accentColor }}>
              {cv.applicant_name}
            </h1>
            
            {cv.current_job_title && (
              <p className="text-xl mb-4 font-light text-gray-600">
                {cv.current_job_title}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-600">
              {cv.email && (
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" style={{ color: accentColor }} />
                  {cv.email}
                </span>
              )}
              {cv.phone && (
                <span className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" style={{ color: accentColor }} />
                  {cv.phone}
                </span>
              )}
              {cv.address && (
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" style={{ color: accentColor }} />
                  {cv.address}
                </span>
              )}
            </div>
            
            {/* Updated Social Links */}
            {renderSocialLinks(
              cv.linkedin_profile,
              cv.github_profile,
              cv.portfolio_link,
              "justify-center md:justify-start mt-4",
              "w-5 h-5",
              "text-sm",
            )}
          </div>
          
          {/* Status */}
          <div className="mt-4 md:mt-0">
            <span
              className={`capitalize inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
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
        
        {/* Elegant divider */}
        <div className="relative h-px mb-10" style={{ background: `linear-gradient(to right, transparent, ${accentColor}40, transparent)` }}>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rotate-45" 
            style={{ backgroundColor: bgColor, borderColor: accentColor, borderWidth: '1px' }}></div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left Column - 1/3 */}
          <div className="space-y-8">
            {/* Skills */}
            <div>
              <h2 className="text-lg font-semibold border-b pb-2 mb-4" 
                style={{ color: accentColor, borderColor: `${accentColor}40` }}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {cv.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-md text-sm"
                    style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            {cv.languages_known && cv.languages_known.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4" 
                  style={{ color: accentColor, borderColor: `${accentColor}40` }}>
                  Languages
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cv.languages_known.map((language, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-md text-sm"
                      style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Work Preferences */}
            <div>
              <h2 className="text-lg font-semibold border-b pb-2 mb-4" 
                style={{ color: accentColor, borderColor: `${accentColor}40` }}>
                Work Preferences
              </h2>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className={cv.willingness_to_relocate ? "text-green-600" : "text-red-600"}>●</span>
                  <span className="font-medium">Willing to Relocate:</span>{" "}
                  {cv.willingness_to_relocate ? "Yes" : "No"}
                </p>
                <p className="flex items-center gap-2">
                  <span className={cv.availability_for_remote_work ? "text-green-600" : "text-red-600"}>●</span>
                  <span className="font-medium">Remote Work:</span>{" "}
                  {cv.availability_for_remote_work ? "Yes" : "No"}
                </p>
              </div>
            </div>
            
            {/* Desired Salary */}
            {cv.desired_salary && (
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4" 
                  style={{ color: accentColor, borderColor: `${accentColor}40` }}>
                  Salary Expectation
                </h2>
                <p className="font-mono font-semibold" style={{ color: accentColor }}>{cv.desired_salary}</p>
              </div>
            )}
          </div>
          
          {/* Right Column - 2/3 */}
          <div className="space-y-8 md:col-span-2">
            {/* Experience */}
            <div>
              <h2 className="text-lg font-semibold border-b pb-2 mb-4" 
                style={{ color: accentColor, borderColor: `${accentColor}40` }}>
                Professional Experience
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: accentColor }} className="font-semibold">{cv.years_experience} Years Experience</span>
                  {cv.industry_experience && (
                    <span className="text-gray-500 text-sm">{cv.industry_experience}</span>
                  )}
                </div>
                {cv.career_goals && (
                  <div className="mt-2 p-4 bg-white rounded-md border-l-4 italic text-gray-600" style={{ borderColor: accentColor }}>
                    <p>{cv.career_goals}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Education */}
            {cv.education && (
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4" 
                  style={{ color: accentColor, borderColor: `${accentColor}40` }}>
                  Education
                </h2>
                <p className="text-gray-700">{cv.education}</p>
              </div>
            )}
            
            {/* Certifications */}
            {cv.certifications && (
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4" 
                  style={{ color: accentColor, borderColor: `${accentColor}40` }}>
                  Certifications
                </h2>
                <p className="text-gray-700">{cv.certifications}</p>
              </div>
            )}
            
            {/* References */}
            {cv.references && (
              <div>
                <h2 className="text-lg font-semibold border-b pb-2 mb-4" 
                  style={{ color: accentColor, borderColor: `${accentColor}40` }}>
                  References
                </h2>
                <p className="text-gray-700 italic">{cv.references}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCreativeTheme = (themeColor: string = '') => {
    const colors = getCreativeColors(themeColor);

    return (
      <div className="max-w-4xl mx-auto rounded-xl shadow-lg overflow-hidden" 
        style={{ background: `linear-gradient(to bottom right, ${colors.bgStart}, ${colors.bgEnd})` }}>
        {/* Header */}
        <div className="relative h-48 rounded-t-xl" 
          style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}>
          <div className="absolute -bottom-16 left-10">
            {cv.avatar_url ? (
              <img
                src={cv.avatar_url}
                alt="Profile"
                className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <Upload className="w-10 h-10" style={{ color: colors.primary }} />
              </div>
            )}
          </div>
          
          <div className="absolute bottom-4 right-8 left-56">
            <h1 className="text-3xl font-sans font-bold text-white">
              {cv.applicant_name}
            </h1>
            {cv.current_job_title && (
              <p className="text-white/80 text-lg">{cv.current_job_title}</p>
            )}
          </div>
        </div>
        
        {/* Status badge */}
        <div className="flex justify-end mt-4 mr-8">
          <span
            className={`capitalize inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
              cv.status === "accepted"
                ? "bg-green-100 text-green-800"
                : cv.status === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-
