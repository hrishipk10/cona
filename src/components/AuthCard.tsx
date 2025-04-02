import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface AuthCardProps {
  title: string;
  description: string;
  type: "admin" | "applicant";
}

const AuthCard = ({ title, description, type }: AuthCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Card className="relative bg-white/95 backdrop-blur-lg border-0 shadow-lg rounded-xl overflow-hidden w-full max-w-xs mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A6CDC6] to-[#93BAB3] opacity-90" />
        
        <div className="relative z-10 p-4">
          <CardHeader className="p-4 pb-2">
            <div className="text-center space-y-1">
              <CardTitle className="text-xl font-bold text-gray-900">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-700">
                {description}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 pt-2">
            <Button 
              className="w-full h-10 rounded-lg bg-gradient-to-r from-[#16404D] to-[#2C768D] text-md font-semibold text-white shadow-sm hover:shadow-md transition-all"
              onClick={() => navigate(`/${type}/login`)}
            >
              Continue as {type}
            </Button>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default AuthCard;