import Logo from "@/components/Logo";
import AuthCard from "@/components/AuthCard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 wave-pattern" />
      <div className="z-10 space-y-12">
        <Logo />
        <div className="flex flex-col md:flex-row gap-6">
          <AuthCard
            title="Admin"
            description="Manage CVs and requirements"
            type="admin"
          />
          <AuthCard
            title="Applicant"
            description="Submit your CV"
            type="applicant"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;