import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

interface TopCVsTableProps {
  cvs: CV[];
  title: string;
  showSkills?: boolean;
}

export const TopCVsTable = ({ cvs, title, showSkills = false }: TopCVsTableProps) => {
  const navigate = useNavigate();

  const handleRowClick = (id: string) => {
    navigate(`/admin/cv/${id}`);
  };

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full leading-normal">
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>{showSkills ? "Skills" : "Match %"}</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cvs.map((cv) => (
            <TableRow 
              key={cv.id} 
              className="hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
              onClick={() => handleRowClick(cv.id)}
            >
              <TableCell>{cv.applicant_name}</TableCell>
              <TableCell>{cv.years_experience} years</TableCell>
              <TableCell>
                {showSkills ? cv.skills.join(", ") : `${cv.requirements_match}%`}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cv.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : cv.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {cv.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
