
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-1/2 bg-primary p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <Logo />
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[800px] h-[800px] border border-primary-foreground/30 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${0.2 + i * 0.2})`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 bg-background p-16 flex flex-col justify-center items-center relative overflow-hidden">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-semibold text-primary mb-12">Who Is This?</h2>
          
          <div className="space-y-4">
            <Button
              variant="secondary"
              className="w-full py-8 text-xl rounded-full"
              onClick={() => {
                console.log('Navigating to admin login');
                navigate('/admin/login');
              }}
            >
              admin
            </Button>
            
            <Button
              variant="secondary"
              className="w-full py-8 text-xl rounded-full"
              onClick={() => {
                console.log('Navigating to applicant login');
                navigate('/applicant/login');
              }}
            >
              applicant
            </Button>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[800px] h-[800px] border border-primary/10 rounded-full"
              style={{
                bottom: '-400px',
                right: '-400px',
                transform: `scale(${0.5 + i * 0.3})`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
