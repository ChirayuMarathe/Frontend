import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const redirectUser = async (userId) => {
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('id', userId)
          .maybeSingle();

        if (!profile || !profile.name) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('Error fetching profile during OAuth callback:', err);
        navigate('/dashboard', { replace: true });
      }
    };

    const processCallback = async () => {
      // PKCE Flow (supabase-js v2.39+): The redirect URL contains ?code=XXXX
      // We must exchange this code for a session explicitly.
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('PKCE code exchange error:', error);
            navigate('/login?error=auth_callback_failed', { replace: true });
            return;
          }
          if (data?.session?.user) {
            await redirectUser(data.session.user.id);
            return;
          }
        } catch (err) {
          console.error('PKCE exchange error:', err);
          navigate('/login?error=auth_callback_failed', { replace: true });
          return;
        }
      }

      // Implicit flow fallback: check hash fragment (#access_token=...)
      // or session already processed by Supabase client init
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await redirectUser(session.user.id);
          return;
        }
      } catch (err) {
        console.error('getSession error:', err);
      }

      // If neither worked, listen for auth state change (last resort)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            subscription.unsubscribe();
            await redirectUser(session.user.id);
          }
        }
      );

      // Timeout safeguard
      setTimeout(() => {
        subscription.unsubscribe();
        navigate('/login?error=auth_timeout', { replace: true });
      }, 10000);
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
      <p className="text-gray-400">Please wait while we complete your sign-in.</p>
    </div>
  );
}
