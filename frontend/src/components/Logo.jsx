import React from 'react';
import { MessageSquare } from "lucide-react";

const Logo = ({ className = "size-8", showText = true, textClass = "" }) => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:scale-[1.02]">
      {/* CLEAN MINIMALIST ICON */}
      <div className={`${className} flex-shrink-0 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-3 transition-transform duration-300`}>
        <MessageSquare className="size-1/2 text-primary-content" strokeWidth={3} />
      </div>

      {showText && (
        <span className={`text-2xl font-black text-base-content tracking-tight ${textClass}`}>
          Talk<span className="text-primary">Now</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
