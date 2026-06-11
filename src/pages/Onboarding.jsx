import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { User, Phone, Calendar, CheckCircle, ArrowRight, Loader, Users } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import { consumeRedirectIntent } from '../utils/redirectUtility';

export default function Onboarding() {
  const { user, profile, setProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: 'other',
  });

  useEffect(() => {
    if (profile && profile.status === 'active') {
      navigate('/dashboard');
    }
    if (user && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        phone: user.user_metadata?.phone || '',
      }));
    }
  }, [profile, user, navigate, formData.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      // Upsert to public.users
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: formData.name,
          phone: formData.phone,
          dob: formData.dob || null,
          gender: formData.gender,
          email: user.email,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('[DEBUG] Onboarding: Error:', error);
        throw error;
      }

      if (data) {
        setProfile({ ...data, status: 'active' });
        setStep(2); // Success step

        const intendedPath = consumeRedirectIntent();
        setTimeout(() => {
          navigate(intendedPath || '/dashboard', { state: { fromOnboarding: true } });
        }, 1500);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      alert(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
              <p className="text-gray-400">Just a few more details to get started</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-teal-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-teal-500" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-teal-500" />
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-12 h-12 text-teal-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">All Set!</h2>
            <p className="text-gray-400 mb-6">Taking you to your dashboard...</p>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 animate-loading" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex justify-center mb-10">
            <BrandLogo />
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            {step === 1 && (
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.phone}
                className="w-full mt-10 py-4 bg-[#81E6D9] hover:bg-[#4FD1C5] disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-teal-500/10"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes loading {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-loading {
          animation: loading 1.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
