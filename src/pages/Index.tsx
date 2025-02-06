
import { useNavigate } from "react-router-dom";
import { Waves } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-1/2 bg-primary p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Waves className="w-10 h-10 text-primary-foreground" />
            <h1 className="text-6xl font-light text-primary-foreground">CV Cluster</h1>
          </div>
          <p className="text-primary-foreground/80 text-xl tracking-wide">
            CV MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[800px] h-[800px] border border-primary-foreground/30 rounded-full"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${0.2 + i * 0.2})`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 bg-background p-16 flex flex-col justify-center items-center relative overflow-hidden">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-semibold text-foreground mb-12">
            Who Is This?
          </h2>

          <div className="space-y-4">
            <button
              className="w-full py-4 px-8 bg-card hover:bg-card/80 text-card-foreground rounded-full text-xl transition-colors duration-200 border border-border"
              onClick={() => navigate("/admin/login")}
            >
              Admin
            </button>

            <button
              className="w-full py-4 px-8 bg-card hover:bg-card/80 text-card-foreground rounded-full text-xl transition-colors duration-200 border border-border"
              onClick={() => navigate("/applicant/login")}
            >
              Applicant
            </button>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[800px] h-[800px] border border-foreground/10 rounded-full"
              style={{
                bottom: "-400px",
                right: "-400px",
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
