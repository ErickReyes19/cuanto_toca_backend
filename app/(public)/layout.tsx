import React from "react";
import "../globals-landing.css";

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="public-light min-h-screen bg-white text-foreground">
      {children}
    </div>
  );
};

export default PublicLayout;
