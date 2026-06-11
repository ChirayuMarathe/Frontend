import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { BsCheckCircleFill, BsExclamationTriangleFill, BsBuilding } from "react-icons/bs";
import Button from "../components/shared/Button";
import Card from "../components/shared/Card";

export default function AcceptInvite() {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            // Redirect to login if not authenticated, storing return URL
            // Assuming /login handles returnUrl or user manually navigates back
            // For now, simpler to show a "Login" button
            return;
        }

        // Auto-accept if user is logged in? 
        // Maybe better to show a confirmation button first.
    }, [user, authLoading]);

    const handleAccept = async () => {
        if (!user) {
            navigate("/login", { state: { returnUrl: `/invite/${token}` } });
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // 1. Find the invite
            const { data: invite, error: inviteError } = await supabase
                .from('workbench_invites')
                .select('*')
                .eq('token', token)
                .eq('status', 'pending')
                .single();

            if (inviteError || !invite) {
                throw new Error("Invalid or expired invitation");
            }

            // 2. Add user as member
            const { error: memberError } = await supabase
                .from('workbench_members')
                .insert({
                    workbench_id: invite.workbench_id,
                    user_id: user.id,
                    role: invite.role || 'viewer'
                });

            if (memberError) {
                throw new Error(memberError.message || "Failed to join team");
            }

            // 3. Mark invite as accepted
            await supabase
                .from('workbench_invites')
                .update({ status: 'accepted' })
                .eq('id', invite.id);

            setSuccess(true);
            
            // Wait a moment then redirect
            setTimeout(() => {
                navigate(`/dashboard/workbench/${invite.workbench_id}`);
            }, 2000);

        } catch (err) {

            console.error("Invite Error:", err);
            setError(err.message || "Failed to accept invite");
        } finally {
            setProcessing(false);
        }
    };

    if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 text-primary mb-4">
                        <BsBuilding className="text-3xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Team Invitation</h1>
                    <p className="text-gray-400 mt-2">You've been invited to join a workspace on Datalis.</p>
                </div>

                <Card className="p-8 border border-white/10 bg-[#0E1117]">
                    {user ? (
                        <div className="space-y-6 text-center">
                            <div className="flex items-center justify-center gap-3 bg-white/5 p-3 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <div className="text-sm text-gray-400">Logged in as</div>
                                    <div className="text-white font-medium text-sm">{user.email}</div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-3 text-left">
                                    <BsExclamationTriangleFill className="text-xl shrink-0" />
                                    <div className="text-sm">{error}</div>
                                </div>
                            )}

                            {success ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-6 rounded-lg">
                                    <BsCheckCircleFill className="text-4xl mx-auto mb-3" />
                                    <div className="font-bold">Welcome to the team!</div>
                                    <div className="text-sm opacity-80 mt-1">Redirecting you to the workbench...</div>
                                </div>
                            ) : (
                                <Button
                                    variant="primary"
                                    className="w-full py-3 justify-center text-base"
                                    onClick={handleAccept}
                                    disabled={processing}
                                >
                                    {processing ? "Joining Team..." : "Accept & Join Workspace"}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center space-y-6">
                            <p className="text-gray-300">
                                Please log in to your account to accept this invitation.
                            </p>
                            <Button
                                variant="primary"
                                className="w-full py-3 justify-center"
                                onClick={() => navigate("/login", { state: { returnUrl: `/invite/${token}` } })}
                            >
                                Log In / Sign Up
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
