
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { Database } from "@/integrations/supabase/types";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

interface ExperienceClusterChartProps {
  experienceGroups: Record<string, CV[]>;
}

export const ExperienceClusterChart = ({ experienceGroups }: ExperienceClusterChartProps) => {
  return (
    <div className="h-[300px]">
      <ChartContainer
        config={{
          experience: {
            theme: {
              light: "hsl(var(--primary))",
              dark: "hsl(var(--primary))",
            },
          },
        }}
      >
        <BarChart
          data={Object.entries(experienceGroups).map(([range, cvs]) => ({
            range,
            count: cvs.length,
          }))}
          margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
        >
          <XAxis dataKey="range" />
          <YAxis />
          <ChartTooltip />
          <Bar dataKey="count" fill="var(--color-experience)" />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
