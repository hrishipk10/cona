import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Edit, MessageSquare } from "lucide-react";
import CVForm from "@/components/CVForm";
import Messages from "@/components/Messages";
import { supabase } from "@/integrations/supabase/client";

const ClientDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);

  const { data: existingCV, isLoading } = useQuery({
    queryKey: ['userCV'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-semibold text-primary">
          {existingCV ? 'Your Dashboard' : 'Submit Your CV'}
        </h1>

        <Tabs defaultValue="cv" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cv" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {existingCV ? 'Your CV' : 'Submit CV'}
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cv">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <h2 className="text-2xl font-medium">
                    {existingCV ? 'CV Information' : 'Submit Your CV'}
                  </h2>
                  <p className="text-muted-foreground">
                    {existingCV
                      ? 'Your current CV information'
                      : 'Please fill in your details and upload your CV document'}
                  </p>
                </div>
                {existingCV && !isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit CV
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {existingCV && !isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Full Name</h3>
                      <p>{existingCV.applicant_name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Years of Experience</h3>
                      <p>{existingCV.years_experience} years</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {existingCV.skills.map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="bg-secondary px-2 py-1 rounded-md text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">Status</h3>
                      <p className="capitalize">{existingCV.status}</p>
                    </div>
                  </div>
                ) : (
                  <CVForm
                    existingCV={existingCV}
                    onSubmitSuccess={() => setIsEditing(false)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-medium">Messages</h2>
                <p className="text-muted-foreground">
                  View messages from administrators
                </p>
              </CardHeader>
              <CardContent>
                <Messages />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;