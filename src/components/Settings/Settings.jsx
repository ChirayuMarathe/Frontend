import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import {
  User,
  X,
  Sparkles,
  Command,
  HelpCircle,
  Save,
  ChevronDown,
  Briefcase,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import KeyboardShortcutsModal from "../KeyboardShortcuts/KeyboardShortcutsModal";
import OnboardingTour from "../Onboarding/OnboardingTour";

export default function Settings() {
  const { user, profile, setProfile } = useAuth();
  const [activeSection, setActiveSection] = useState("account");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("founder");
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Billing states
  const [subscription, setSubscription] = useState(null);
  const [plansList, setPlansList] = useState([]);
  const [loadingBilling, setLoadingBilling] = useState(false);

  useEffect(() => {
    if (activeSection === "billing" && user?.id) {
      fetchBillingData();
    }
  }, [activeSection, user]);

  const fetchBillingData = async () => {
    setLoadingBilling(true);
    try {
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select(`*, plans(*)`)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subData) {
        setSubscription(subData);
      }

      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .order('id');
      if (plansData) {
        setPlansList(plansData);
      }
    } catch (err) {
      console.error("Error fetching billing:", err);
    } finally {
      setLoadingBilling(false);
    }
  };

  // Initialize from profile/user
  useEffect(() => {
    if (profile) {
      setUsername(profile.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "");
      setRole(profile.role || "founder");
    } else if (user) {
      setUsername(user?.user_metadata?.full_name || user?.email?.split("@")[0] || "");
    }
  }, [profile, user]);

  // Help modals state
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Mobile accordion state
  const [expandedSections, setExpandedSections] = useState(["account"]);

  const sections = [
    {
      id: "account",
      label: "Account",
      description: "Update your account settings and preferences",
      icon: User,
      subtitle: "Personal info and preferences",
    },
    {
      id: "help",
      label: "Help & Tour",
      description: "Get help, view shortcuts, and take the product tour",
      icon: HelpCircle,
      subtitle: "Guides and shortcuts",
    },
    {
      id: "billing",
      label: "Plans and Billing",
      description: "Manage your subscription plan and billing",
      icon: CreditCard,
      subtitle: "Plans, billing, and usage",
    },
  ];

  const handleUpdateAccount = async () => {
    if (!user?.id) return;

    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: username
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error("[DEBUG] Settings: Error updating profile:", error);
        throw error;
      }

      console.log("[DEBUG] Settings: Profile update response:", data);
      if (data) {
        setProfile(data);
        setMessage("Profile updated successfully!");
        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="max-w-3xl mx-auto space-y-3 lg:space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl lg:rounded-2xl shadow-xl overflow-hidden">
              <div className="p-3 lg:p-6">
                <h3 className="text-sm lg:text-xl font-semibold text-white flex items-center gap-2">
                  <div className="p-1.5 lg:p-2 bg-[#00C6C2]/10 rounded-lg">
                    <User className="w-4 h-4 lg:w-5 lg:h-5 text-[#00C6C2]" />
                  </div>
                  Profile Information
                </h3>
                <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-[#9BA3AF]">
                  Update your personal details and preferences
                </p>
                <div className="mt-3 lg:mt-6 space-y-3 lg:space-y-6">
                  <div className="grid grid-cols-1 gap-3 lg:gap-6">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-[#E5E7EB] mb-1.5 lg:mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-black/40 border border-white/10 rounded-lg lg:rounded-xl text-sm lg:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FFD1] focus:border-transparent transition-all duration-200 hover:border-white/20"
                        placeholder="Enter your display name"
                      />
                      <p className="mt-1 lg:mt-2 text-[10px] lg:text-xs text-[#6B7280] flex items-center gap-1">
                        <span className="text-[#00C6C2]">ℹ️</span>
                        Name displayed to other users
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-[#E5E7EB] mb-1.5 lg:mb-2">
                        Role
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 lg:py-3 bg-black/40 border border-white/10 rounded-lg lg:rounded-xl text-sm lg:text-base text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#00FFD1] focus:border-transparent transition-all duration-200 hover:border-white/20"
                        >
                          <option value="founder">Founder / CEO</option>
                          <option value="finance">Finance Professional</option>
                          <option value="analyst">Data Analyst</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-[#E5E7EB] mb-1.5 lg:mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-white/5 border border-white/10 rounded-lg lg:rounded-xl text-sm lg:text-base text-gray-400 cursor-not-allowed"
                      />
                      <p className="mt-1 lg:mt-2 text-[10px] lg:text-xs text-[#6B7280]">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>
                  {message && (
                    <div className={`p-3 rounded-lg text-xs lg:text-sm ${message.startsWith('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'}`}>
                      {message}
                    </div>
                  )}
                  <div className="flex justify-end pt-3 lg:pt-4 border-t border-white/10">
                    <button
                      onClick={handleUpdateAccount}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 lg:gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-white/5 border border-white/10 text-white text-xs lg:text-sm font-semibold rounded-lg lg:rounded-xl hover:bg-[#00FFD1]/10 hover:border-[#00FFD1]/50 hover:text-[#00FFD1] focus:outline-none focus:ring-2 focus:ring-[#00FFD1]/40 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 group"
                    >
                      <Save className={`w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#00FFD1] ${loading ? 'animate-pulse' : ''}`} />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "help":
        return (
          <div className="max-w-3xl mx-auto space-y-4 lg:space-y-6">
            {/* Product Tour */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-6">
              <div className="flex items-start gap-3 lg:gap-4">
                <div className="p-2.5 lg:p-3 bg-teal-500/10 rounded-xl">
                  <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-teal-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base lg:text-lg font-semibold text-white">Product Tour</h3>
                  <p className="text-xs lg:text-sm text-[#9BA3AF] mb-3 lg:mb-4">
                    Take a guided tour to learn about all features.
                  </p>
                  <button
                    onClick={() => setShowTour(true)}
                    className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-all text-xs lg:text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Tour
                  </button>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts - Desktop only */}
            <div className="hidden lg:block bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Command className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
                  <p className="text-sm text-[#9BA3AF] mb-4">
                    Press <kbd className="px-1.5 py-0.5 bg-black/40 border border-white/10 rounded text-xs font-mono">?</kbd> to view shortcuts.
                  </p>
                  <button
                    onClick={() => setShowShortcuts(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all text-sm"
                  >
                    <Command className="w-4 h-4" />
                    View Shortcuts
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 lg:w-5 lg:h-5 text-teal-400" />
                Quick Tips
              </h3>
              <div className="space-y-3">
                {[
                  ["1", "Upload your data", "Go to companies and upload CSV files."],
                  ["2", "Ask Dabby anything", "Chat to analyze data and generate insights."],
                ].map(([num, title, desc]) => (
                  <div key={num} className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-teal-400 font-bold text-xs lg:text-sm">{num}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-xs lg:text-sm">{title}</h4>
                      <p className="text-[10px] lg:text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="p-4 bg-gradient-to-br from-teal-500/5 to-transparent border border-teal-500/10 rounded-2xl text-center">
              <h3 className="text-white font-semibold text-sm lg:text-base mb-1 lg:mb-2">Need more help?</h3>
              <p className="text-xs lg:text-sm text-gray-400 mb-3 lg:mb-4">Our support team is here to help.</p>
              <a
                href="mailto:opportunities@datalis.in"
                className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 text-xs lg:text-sm font-medium"
              >
                Contact Support →
              </a>
            </div>
          </div>
        );

      case "billing": {
        const isSuperAdmin = profile?.role === 'superadmin' || user?.email === 'imperialion45@gmail.com';

        return (
          <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6 animate-fade-in">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm lg:text-xl font-semibold text-white flex items-center gap-2">
                    <div className="p-1.5 lg:p-2 bg-[#00C6C2]/10 rounded-lg">
                      <CreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-[#00C6C2]" />
                    </div>
                    Plans and Billing
                  </h3>
                  <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-[#9BA3AF]">
                    Manage your subscription, billing details and plan.
                  </p>
                </div>
                {isSuperAdmin && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                    Superadmin
                  </span>
                )}
              </div>

              {loadingBilling ? (
                <div className="flex items-center justify-center h-32 text-gray-400">Loading plan details...</div>
              ) : (
                <div className="space-y-6">
                  {/* Current Plan Info */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 lg:p-6">
                    <h4 className="text-white font-medium mb-1">Current Plan</h4>
                    <p className="text-2xl font-bold text-[#00C6C2] capitalize mb-2">
                      {subscription?.plans?.name || subscription?.plan_id || "Free"} Plan
                    </p>
                    <p className="text-sm text-gray-400">
                      Status: <span className="text-white capitalize">{subscription?.status || "Active"}</span>
                    </p>
                  </div>

                  {/* Available Plans */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Available Plans</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {plansList.length > 0 ? plansList.map((plan) => (
                        <div key={plan.id} className={`p-5 rounded-xl border ${subscription?.plan_id === plan.id ? 'bg-[#00C6C2]/10 border-[#00C6C2] shadow-[0_0_15px_rgba(0,198,194,0.1)]' : 'bg-white/5 border-white/10'} flex flex-col justify-between`}>
                          <div>
                            <h5 className="text-white font-bold text-lg capitalize">{plan.name}</h5>
                            <div className="my-3">
                              <span className="text-2xl font-bold text-white">₹{plan.price_inr != null ? plan.price_inr : (plan.price || plan.price_monthly || plan.amount || 0)}</span>
                              <span className="text-gray-400 text-sm">/mo</span>
                            </div>
                            {plan.description && <p className="text-sm text-gray-400 mb-4">{plan.description}</p>}
                          </div>
                          <button
                            onClick={() => {
                              if (plan.id === 'go') window.open('https://rzp.io/rzp/fki0zDFJ', '_blank');
                              if (plan.id === 'pro') window.open('https://rzp.io/rzp/geIFJn7n', '_blank');
                            }}
                            disabled={subscription?.plan_id === plan.id}
                            className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${subscription?.plan_id === plan.id ? 'bg-white/10 text-gray-400 cursor-not-allowed' : 'bg-[#00C6C2] text-black hover:bg-[#00FFD1]'}`}
                          >
                            {subscription?.plan_id === plan.id ? 'Current Plan' : 'Upgrade Plan'}
                          </button>
                        </div>
                      )) : (
                        // Fallback static plans
                        <>
                          <div className="p-5 rounded-xl border bg-white/5 border-white/10 flex flex-col justify-between">
                            <div>
                              <h5 className="text-white font-bold text-lg">Free</h5>
                              <div className="my-3"><span className="text-2xl font-bold text-white">₹0</span><span className="text-gray-400 text-sm">/mo</span></div>
                              <ul className="text-sm text-gray-400 space-y-2 mb-4">
                                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-[#00C6C2]" /> Limited access to AI</li>
                                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-gray-600" /> No workbench access</li>
                              </ul>
                            </div>
                            <button className="w-full py-2 rounded-lg font-semibold text-sm bg-white/10 text-gray-400 cursor-not-allowed">Current Plan</button>
                          </div>
                          <div className="p-5 rounded-xl border bg-[#00C6C2]/10 border-[#00C6C2] flex flex-col justify-between">
                            <div>
                              <h5 className="text-[#00C6C2] font-bold text-lg flex items-center gap-2">Go <Sparkles className="w-4 h-4" /></h5>
                              <div className="my-3"><span className="text-2xl font-bold text-white">₹5000</span><span className="text-gray-400 text-sm">/mo</span></div>
                              <ul className="text-sm text-gray-400 space-y-2 mb-4">
                                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-[#00C6C2]" /> Good access to AI</li>
                                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-[#00C6C2]" /> Limited workbench features</li>
                              </ul>
                            </div>
                            <button
                              onClick={() => window.open('https://rzp.io/rzp/fki0zDFJ', '_blank')}
                              className="w-full py-2 rounded-lg font-semibold text-sm bg-[#00C6C2] text-black hover:bg-[#00FFD1] transition-all"
                            >
                              Upgrade to Go
                            </button>
                          </div>
                          <div className="p-5 rounded-xl border bg-white/5 border-white/10 flex flex-col justify-between">
                            <div>
                              <h5 className="text-white font-bold text-lg">Pro</h5>
                              <div className="my-3"><span className="text-2xl font-bold text-white">₹10000</span><span className="text-gray-400 text-sm">/mo</span></div>
                              <ul className="text-sm text-gray-400 space-y-2 mb-4">
                                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-[#00C6C2]" /> Better access to AI</li>
                                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-[#00C6C2]" /> Good access of workbench</li>
                              </ul>
                            </div>
                            <button
                              onClick={() => window.open('https://rzp.io/rzp/geIFJn7n', '_blank')}
                              className="w-full py-2 rounded-lg font-semibold text-sm bg-white/10 hover:bg-white/20 text-white transition-all"
                            >
                              Upgrade to Pro
                            </button>
                          </div>
                          <div className="p-5 rounded-xl border bg-white/5 border-white/10 flex flex-col justify-between">
                            <div>
                              <h5 className="text-purple-400 font-bold text-lg">Enterprise</h5>
                              <div className="my-3"><span className="text-2xl font-bold text-white">₹20000</span><span className="text-gray-400 text-sm">/member/mo</span></div>
                              <ul className="text-sm text-gray-400 space-y-2 mb-4">
                                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Best AI features</li>
                                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Custom branding</li>
                                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Dedicated account manager</li>
                              </ul>
                            </div>
                            <button
                              onClick={() => window.open('mailto:opportunities@datalis.in', '_blank')}
                              className="w-full py-2 rounded-lg font-semibold text-sm bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-all"
                            >
                              Contact Sales
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div >
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0a0a0a] font-dm-sans">
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-[#0a0a0a]">
        {/* Header */}
        <div className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-10">
          <div className="px-4 lg:px-6 py-3 lg:py-6">
            {/* Mobile Header */}
            <div className="lg:hidden">
              <h2 className="text-lg font-bold text-white">Settings</h2>
            </div>

            {/* Desktop header */}
            <h2 className="hidden lg:block text-2xl lg:text-3xl font-bold text-white">
              {sections.find((s) => s.id === activeSection)?.label}
            </h2>
            <p className="hidden lg:block mt-2 text-sm text-[#9BA3AF]">
              {sections.find((s) => s.id === activeSection)?.description}
            </p>
          </div>

          {/* Desktop tabs */}
          <div className="hidden lg:flex px-6 -mb-px space-x-8 overflow-x-auto scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`group inline-flex items-center pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all
                  ${activeSection === section.id
                    ? "border-[#00C6C2] text-[#00C6C2]"
                    : "border-transparent text-[#9BA3AF] hover:text-white hover:border-[#3A3F46]"
                  }`}
              >
                <section.icon
                  className={`-ml-0.5 mr-2 h-5 w-5 transition-colors ${activeSection === section.id
                    ? "text-[#00C6C2]"
                    : "text-[#6B7280] group-hover:text-[#9BA3AF]"
                    }`}
                />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: Section buttons with expandable content */}
        <div className="lg:hidden p-3 space-y-2">
          {message && (
            <div className={`mb-3 rounded-lg p-3 border ${message.includes("error") ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-[#00C6C2]/10 text-[#00C6C2] border-[#00C6C2]/30"}`}>
              <p className="text-xs font-medium">{message}</p>
            </div>
          )}

          {sections.map((section) => (
            <div key={section.id} className="rounded-lg border border-white/10 overflow-hidden bg-white/5">
              <button
                onClick={() => {
                  if (activeSection === section.id) {
                    // Toggle collapse if already active
                    setExpandedSections(prev =>
                      prev.includes(section.id) ? prev.filter(id => id !== section.id) : [...prev, section.id]
                    );
                  } else {
                    // Set active and expand
                    setActiveSection(section.id);
                    setExpandedSections(prev => [...prev.filter(id => id !== section.id), section.id]);
                  }
                }}
                className="w-full flex items-center justify-between gap-3 p-3 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeSection === section.id && expandedSections.includes(section.id) ? 'bg-teal-500/20 text-teal-400' : 'bg-white/10 text-gray-400'}`}>
                    <section.icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-medium ${activeSection === section.id && expandedSections.includes(section.id) ? 'text-teal-400' : 'text-gray-200'}`}>
                      {section.label}
                    </div>
                    <div className="text-[10px] text-gray-500">{section.subtitle}</div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${activeSection === section.id && expandedSections.includes(section.id) ? 'rotate-180' : ''}`}
                />
              </button>

              {activeSection === section.id && expandedSections.includes(section.id) && (
                <div className="border-t border-white/5 p-3 bg-black/20">
                  {renderContent()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop: Tab content */}
        <div className="hidden lg:block px-6 py-6">
          {message && (
            <div className={`mb-6 rounded-xl p-4 border ${message.includes("error") ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-[#00C6C2]/10 text-[#00C6C2] border-[#00C6C2]/30"}`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
          {renderContent()}
        </div>
      </main>

      {/* Profile Update Confirmation Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-[#1F242C] to-[#161B22] border border-[#2A2F36] rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <div className="p-2 bg-[#00C6C2]/10 rounded-lg">
                    <User className="w-5 h-5 text-[#00C6C2]" />
                  </div>
                  Confirm Changes
                </h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-[#2A2F36] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#9BA3AF] hover:text-white" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-[#9BA3AF] mb-4">
                  Are you sure you want to update your profile information?
                </p>
                <div className="bg-[#0E1117] border border-[#2A2F36] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Display Name:</span>
                    <span className="text-white font-medium">{username}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Email:</span>
                    <span className="text-[#9BA3AF]">{user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-3 bg-[#2A2F36] hover:bg-[#3A3F46] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdateAccount();
                    setShowProfileModal(false);
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-br from-[#00C6C2] to-[#00A8A4] text-[#0E1117] font-semibold rounded-xl hover:from-[#00D4D0] hover:to-[#00B5B1] hover:scale-105 hover:shadow-lg hover:shadow-[#00C6C2]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onComplete={() => setShowTour(false)}
      />
    </div>
  );
}
