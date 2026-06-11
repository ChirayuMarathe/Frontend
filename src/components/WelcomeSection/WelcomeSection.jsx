import React, { useState, useEffect } from 'react';
import { BsBarChart, BsStars } from 'react-icons/bs';
import { useAuth } from "../../hooks/useAuth";
import BrandLogo from "../common/BrandLogo";

const TypingGreeting = ({ userName }) => {
  const [text, setText] = useState("");
  // Prefer full name, then username, then email part
  const fullText = `Welcome back, ${userName}`;
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.substring(0, index));
      index++;
      if (index > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [fullText]);

  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span>
      {text}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} ml-1 text-teal-400`}>|</span>
    </span>
  );
};

export default function WelcomeSection() {
  const { user } = useAuth();
  return (
    <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4 text-center relative font-dm-sans">
      <div className="max-w-2xl mx-auto relative">
        <div className="mb-6 flex justify-center">
          <BrandLogo
            label="Dabby"
            iconSize={56}
            iconClassName="text-teal-300 drop-shadow-[0_0_20px_rgba(0,255,209,0.35)]"
            textClassName="text-white text-3xl drop-shadow-[0_0_15px_rgba(0,255,209,0.3)]"
          />
        </div>

        {/* Welcome Heading */}
        <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2 tracking-tight min-h-[40px]">
          <TypingGreeting userName={user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'} />
        </h1>

        {/* Subheadline */}
        <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-2">
          Your AI-powered business intelligence assistant
        </p>
      </div>
    </div>
  );
}
