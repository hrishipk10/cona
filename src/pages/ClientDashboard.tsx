import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText, MessageSquare, User, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CVForm from "@/components/CVForm";
import CVDisplay from "@/components/CVDisplay";
import Messages from "@/components/Messages";
import ProfileTab from "@/components/ProfileTab";
import InterviewTab from "@/components/InterviewTab";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const ClientDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-semibold text-primary">
            {existingCV ? 'Your Dashboard' : 'Submit Your CV'}
          </h1>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="cv" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cv" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CV
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Interviews
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cv">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-medium">
                  {existingCV ? 'CV Information' : 'Submit Your CV'}
                </h2>
                <p className="text-muted-foreground">
                  {existingCV
                    ? 'Your current CV information'
                    : 'Please fill in your details and upload your CV document'}
                </p>
              </CardHeader>
              <CardContent>
                {existingCV && !isEditing ? (
                  <CVDisplay cv={existingCV} onEdit={() => setIsEditing(true)} />
                ) : (
                  <CVForm
                    existingCV={existingCV}
                    onSubmitSuccess={() => setIsEditing(false)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-medium">Profile Settings</h2>
                <p className="text-muted-foreground">
                  Manage your personal information and account settings
                </p>
              </CardHeader>
              <CardContent>
                <ProfileTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-medium">Interview Schedule</h2>
                <p className="text-muted-foreground">
                  View and manage your interview appointments
                </p>
              </CardHeader>
              <CardContent>
                <InterviewTab />
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