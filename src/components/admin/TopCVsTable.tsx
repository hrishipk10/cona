
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

interface TopCVsTableProps {
  cvs: CV[];
  title: string;
  showSkills?: boolean;
}

export const TopCVsTable = ({ cvs, title, showSkills = false }: TopCVsTableProps) => {
  return (
    <Table>
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
          <TableRow key={cv.id}>
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
  );
};
