import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";
import { AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../lib/supabase';
import BrandLogo from '../components/common/BrandLogo';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      if (profile?.status === 'partial') {
        navigate('/onboarding');
      } else {
        const returnUrl = location.state?.from?.pathname || '/dashboard';
        navigate(returnUrl);
      }
    }
  }, [user, profile, authLoading, navigate, location]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        // Handle specific Supabase error cases
        const errorMessage = error.message.toLowerCase();
        console.error('Supabase Auth Error:', error);

        if (errorMessage.includes("email not confirmed")) {
          setError("Please confirm your email address. Check your inbox for the verification link.");
        } else if (errorMessage.includes("invalid login credentials")) {
          setError("Invalid email or password. If you signed up with Google, please use the 'Continue with Google' button below.");
        } else if (error.status === 400) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(error.message);
        }
        return; // Don't throw, just return so finally block runs
      }

      if (data?.user) {
        const returnUrl = location.state?.returnUrl || '/dashboard';
        navigate(returnUrl);
      }
    } catch (err) {
      console.error('Login implementation error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth/callback`
        }
      });

      if (error) {
        setError('Failed to sign in with Google. Please try again.');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      alert("Password reset link sent to your email!");
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => navigate('/')} /> {/* Click outside to close */}
      <div className="w-full max-w-md space-y-8 bg-[#0a0a0a]/95 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/10 relative z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <Link to="/" className="inline-block">
              <BrandLogo
                label="Dabby"
                iconSize={48}
                textClassName="text-3xl font-semibold tracking-tight text-white"
                iconClassName="text-[#00FFD1]"
              />
            </Link>
          </div>

          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
            Sign in to Dabby
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Welcome back! Please sign in with your Google account.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00FFD1]/50 focus:border-[#00FFD1] transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-400" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-[#00FFD1] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00FFD1]/50 focus:border-[#00FFD1] transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00FFD1] text-black py-2.5 rounded-md hover:bg-[#00FFD1]/90 transition-all disabled:opacity-70 font-bold mt-2"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0a0a] px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 px-4 rounded-md hover:bg-gray-100 transition-all disabled:opacity-70 font-semibold shadow-lg"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <FcGoogle className="w-6 h-6" />
            )}
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-[#00FFD1] hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-[#00FFD1] hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <div className="text-center border-t border-white/10 pt-6">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-[#00FFD1] hover:text-[#00FFD1]/80">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}







