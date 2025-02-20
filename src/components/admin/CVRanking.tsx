import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

interface CVRankingProps {
  cvs: CV[];
}

const CVRanking: React.FC<CVRankingProps> = ({ cvs }) => {
  const navigate = useNavigate();

  const handleRowClick = (id: string) => {
    navigate(`/admin/cv/${id}`);
  };

  return (
    <Card>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-full leading-normal">
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Match %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cvs.map((cv, index) => (
                <TableRow 
                  key={cv.id} 
                  className="hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                  onClick={() => handleRowClick(cv.id)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{cv.applicant_name}</TableCell>
                  <TableCell>{cv.requirements_match}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CVRanking;