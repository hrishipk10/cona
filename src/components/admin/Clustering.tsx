import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

interface ClusteringProps {
  clusters: Record<string, CV[]>;
}

const Clustering: React.FC<ClusteringProps> = ({ clusters }) => {
  return (
    <Card>
      <CardContent>
        {Object.keys(clusters).map((cluster) => (
          <div key={cluster}>
            <h3>{cluster}</h3>
            <ul>
              {clusters[cluster].map((cv) => (
                <li key={cv.id}>{cv.applicant_name}</li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Clustering;