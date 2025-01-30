import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CVForm from "@/components/CVForm";

const ClientDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-semibold text-primary">Submit Your CV</h1>
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-medium">CV Information</h2>
            <p className="text-muted-foreground">
              Please fill in your details and upload your CV document
            </p>
          </CardHeader>
          <CardContent>
            <CVForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;