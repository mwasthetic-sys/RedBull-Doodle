
import React from 'react';

const Header: React.FC = () => {
  const LOGO_URL = "https://i.imgur.com/YU8r7sv.png";

  return (
    <header className="relative pt-12 pb-12 px-4 overflow-hidden">
      {/* Decorative Speed Lines */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="speed-line top-1/4" style={{ animationDelay: '0s' }}></div>
        <div className="speed-line top-2/4" style={{ animationDelay: '1s' }}></div>
        <div className="speed-line top-3/4" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        {/* Removed "Official Stylization Engine" and lines */}

        <div className="relative group cursor-none mb-6">
          <div className="absolute inset-0 bg-[#FFCC00] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <img 
            src={LOGO_URL} 
            alt="Red Bull Basement" 
            className="h-24 md:h-32 w-auto relative z-10 drop-shadow-[0_0_15px_rgba(255,204,0,0.5)] transition-transform group-hover:scale-105"
          />
        </div>

        <h2 className="font-oswald italic font-black text-4xl md:text-5xl uppercase tracking-tighter text-white mb-4 text-center">
          DOODLE <span className="text-[#E1002F]">GENERATOR</span>
        </h2>

        {/* Removed "Powered by Gemini 2.5..." footer text */}
      </div>
    </header>
  );
};

export default Header;
