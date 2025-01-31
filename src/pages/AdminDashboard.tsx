import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type CV = Database["public"]["Tables"]["cvs"]["Row"];

const AdminDashboard = () => {
  const { data: cvs, isLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cvs")
        .select("*")
        .order("requirements_match", { ascending: false });

      if (error) throw error;
      return data as CV[];
    },
  });

  const topCVsByRequirements = cvs?.slice(0, 5) || [];
  const topCVsByExperience = [...(cvs || [])].sort((a, b) => b.years_experience - a.years_experience).slice(0, 5);

  // Group CVs by years of experience
  const experienceGroups = cvs?.reduce((acc, cv) => {
    const group = `${Math.floor(cv.years_experience / 2) * 2}-${Math.floor(cv.years_experience / 2) * 2 + 2} years`;
    if (!acc[group]) acc[group] = [];
    acc[group].push(cv);
    return acc;
  }, {} as Record<string, CV[]>) || {};

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="cluster">Clusters</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Top CVs by Requirements Match */}
          <Card>
            <CardHeader>
              <CardTitle>Top CVs by Requirements Match</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Match %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCVsByRequirements.map((cv) => (
                    <TableRow key={cv.id}>
                      <TableCell>{cv.applicant_name}</TableCell>
                      <TableCell>{cv.years_experience} years</TableCell>
                      <TableCell>{cv.requirements_match}%</TableCell>
                      <TableCell>{cv.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top CVs by Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Most Experienced Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCVsByExperience.map((cv) => (
                    <TableRow key={cv.id}>
                      <TableCell>{cv.applicant_name}</TableCell>
                      <TableCell>{cv.years_experience} years</TableCell>
                      <TableCell>{cv.skills.join(", ")}</TableCell>
                      <TableCell>{cv.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cluster" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Experience Clusters</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;