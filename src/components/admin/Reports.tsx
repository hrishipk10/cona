import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

interface ReportsProps {
  cvs: CV[];
}

const Reports: React.FC<ReportsProps> = ({ cvs }) => {
  const totalApplications = cvs.length;
  const averageExperience = cvs.reduce((acc, cv) => acc + cv.years_experience, 0) / cvs.length;
  const uiDesigners = cvs.filter(cv => cv.skills.includes('UI Design')).length;

  return (
    <Card>
      <CardContent>
        <p>Total Applications: {totalApplications}</p>
        <p>Average Experience: {averageExperience.toFixed(2)} years</p>
        <p>Number of UI Designers: {uiDesigners}</p>
      </CardContent>
    </Card>
  );
};

export default Reports;