
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Database } from "@/integrations/supabase/types";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

interface ExperienceClusterChartProps {
  experienceGroups: Record<string, CV[]>;
}

export const ExperienceClusterChart = ({ experienceGroups }: ExperienceClusterChartProps) => {
  const data = Object.entries(experienceGroups).map(([range, cvs]) => ({
    range,
    count: cvs.length,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
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
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <XAxis dataKey="range" />
            <YAxis />
            <ChartTooltip />
            <Bar dataKey="count" fill="var(--color-experience)" />
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};
