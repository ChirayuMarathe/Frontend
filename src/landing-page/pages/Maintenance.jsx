import React from 'react';
import { Settings, Clock, ShieldAlert } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-dm-sans">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Icon Container */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full" />
          <div className="relative bg-black border border-white/10 p-6 rounded-2xl">
            <Settings className="w-16 h-16 text-teal-400 animate-spin-slow" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Under Maintenance
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            We're currently updating our systems to bring you a better experience. 
            All services are temporarily offline for scheduled maintenance.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-center gap-3 text-teal-400">
            <Clock className="w-5 h-5" />
            <span className="font-semibold uppercase tracking-wider text-sm">Estimated Return</span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            02 - 02 - 2026
          </div>
          <p className="text-xs text-gray-500">
            Thank you for your patience while we improve Datalis.
          </p>
        </div>

        {/* Footer Link */}
        <div className="pt-8">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>Secure System Update in Progress</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Maintenance;

