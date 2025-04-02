import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import AuthCard from "@/components/AuthCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16404D] to-[#2C768D] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute w-96 h-96 bg-indigo-100/30 rounded-full -top-48 -right-48" />
      <div className="absolute w-96 h-96 bg-blue-100/30 rounded-full -bottom-48 -left-48" />

      <div className="relative min-h-screen container grid lg:grid-cols-2">
        {/* Left side with logo */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden lg:flex flex-col items-center justify-center"
        >
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-[#FBF5DD] to-[#AAA591] bg-clip-text text-transparent">
              Cona
            </h1>
            <p className="text-xl font-medium text-secondary tracking-wider">
              CV Management System
            </p>
          </div>
        </motion.div>

        {/* Right side with stacked auth cards */}
        <div className="flex items-center justify-center p-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="flex flex-col items-center space-y-8">
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
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 w-full text-center">
        <p className="text-sm text-white">
          Created by Aadhith CJ, Sameer, Nafiya
        </p>
      </div>
    </div>
  );
};

export default Index;