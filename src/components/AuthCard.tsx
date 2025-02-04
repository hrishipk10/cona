import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface AuthCardProps {
  title: string;
  description: string;
  type: "admin" | "applicant";
}

const AuthCard = ({ title, description, type }: AuthCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="w-[300px] bg-white/80 backdrop-blur">
      <CardHeader className="text-center">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full"
          onClick={() => navigate(`/${type}/login`)}
        >
          Continue as {type}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthCard;