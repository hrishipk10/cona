
import React from "react";
import { Waves } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-3 mb-4">
        <Waves className="w-10 h-10 text-primary-foreground" />
        <h1 className="text-6xl font-light text-primary-foreground">Cona</h1>
      </div>
      <p className="text-primary-foreground/80 text-xl tracking-wide">
        CV MANAGEMENT SYSTEM
      </p>
    </div>
  );
};

export default Logo;
