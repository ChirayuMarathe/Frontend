import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BsX, BsPersonPlus, BsTrash, BsPeople, BsEnvelope, BsLink45Deg, BsCheck, BsBuilding } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export default function CompanyModal({ isOpen, onClose, workbenchId }) {
    const [activeTab, setActiveTab] = useState("members"); // members, invites
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [invites, setInvites] = useState([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("analyst");
    const [generatingInvite, setGeneratingInvite] = useState(false);
    const [copiedToken, setCopiedToken] = useState(null);

    useEffect(() => {
        if (isOpen && workbenchId) {
            fetchMembers();
            fetchInvites();
        }
    }, [isOpen, workbenchId]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            // 1. Get Workbench Members
            const { data: memberData, error: memberError } = await supabase
                .from('workbench_members')
                .select('*')
                .eq('workbench_id', workbenchId);

            if (memberError) throw memberError;

            if (memberData && memberData.length > 0) {
                // 2. Get User Profiles
                const userIds = memberData.map(m => m.user_id);
                const { data: profileData, error: profileError } = await supabase
                    .from('users')
                    .select('id, name')
                    .in('id', userIds);

                if (profileError) console.warn("Error fetching profiles:", profileError);

                // 3. Merge
                const merged = memberData.map(member => {
                    const profile = profileData?.find(p => p.id === member.user_id);
                    return {
                        ...member,
                        name: profile?.name || 'Unknown User',
                        job_title: '-',
                        status: 'active'
                    };
                });
                setMembers(merged);
            } else {
                setMembers([]);
            }
        } catch (err) {
            console.error("Error fetching members:", err);
            toast.error("Failed to load team members");
        } finally {
            setLoading(false);
        }
    };

    const fetchInvites = async () => {
        try {
            const { data, error } = await supabase
                .from('workbench_invites')
                .select('*')
                .eq('workbench_id', workbenchId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInvites(data || []);
        } catch (err) {
            console.error("Error fetching invites:", err);
        }
    };

    const handleCreateInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail) return;

        try {
            setGeneratingInvite(true);
            const token = crypto.randomUUID();
            // Calculate expiration (7 days)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const { error } = await supabase
                .from('workbench_invites')
                .insert({
                    workbench_id: workbenchId,
                    email: inviteEmail,
                    role: inviteRole,
                    token: token,
                    expires_at: expiresAt.toISOString(),
                    invited_by: (await supabase.auth.getUser()).data.user.id
                });

            if (error) throw error;

            toast.success("Invite created!");
            setInviteEmail("");
            fetchInvites();
            setActiveTab("invites"); // Switch to view the new invite
        } catch (err) {
            console.error("Error creating invite:", err);
            toast.error(err.message || "Failed to create invite");
        } finally {
            setGeneratingInvite(false);
        }
    };

    const copyInviteLink = (token) => {
        const link = `${window.location.origin}/invite/${token}`;
        navigator.clipboard.writeText(link);
        setCopiedToken(token);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const deleteInvite = async (id) => {
        if (!window.confirm("Revoke this invite?")) return;
        try {
            const { error } = await supabase.from('workbench_invites').delete().eq('id', id);
            if (error) throw error;
            toast.success("Invite revoked");
            fetchInvites();
        } catch (err) {
            toast.error("Failed to revoke invite");
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-[#0E1117] rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0E1117]">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BsBuilding className="text-primary" />
                            Organization Management
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Manage team access and roles</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                        <BsX className="text-xl" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-[#0E1117]">
                    <button
                        onClick={() => setActiveTab("members")}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "members"
                            ? "border-primary text-white"
                            : "border-transparent text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <BsPeople /> Team Members ({members.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("invites")}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "invites"
                            ? "border-primary text-white"
                            : "border-transparent text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <BsEnvelope /> Pending Invites ({invites.length})
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">

                    {activeTab === "members" && (
                        <div className="space-y-6">
                            {/* Add Member Form (Quick) */}
                            <div className="bg-[#0E1117] p-5 rounded-xl border border-dashed border-white/10">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <BsPersonPlus className="text-primary" /> Invite New Member
                                </h3>
                                <form onSubmit={handleCreateInvite} className="flex gap-3">
                                    <input
                                        type="email"
                                        placeholder="colleague@company.com"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        required
                                    />
                                    <select
                                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                        value={inviteRole}
                                        onChange={e => setInviteRole(e.target.value)}
                                    >
                                        <option value="analyst">Analyst</option>
                                        <option value="ca">CA / Accountant</option>
                                        <option value="investor">Investor</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={generatingInvite || !inviteEmail}
                                        className="bg-primary hover:bg-primary-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                                    >
                                        {generatingInvite ? "Sending..." : "Invite"}
                                    </button>
                                </form>
                            </div>

                            {/* Member List */}
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">Loading team...</div>
                                ) : members.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">No members found</div>
                                ) : (
                                    members.map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-4 bg-[#0E1117] border border-white/5 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{member.name}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{member.role} • {member.job_title}</div>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${member.role === 'founder' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                                } uppercase`}>
                                                {member.role}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "invites" && (
                        <div className="space-y-4">
                            {invites.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No pending invites.
                                </div>
                            ) : (
                                invites.map(invite => (
                                    <div key={invite.id} className="p-4 bg-[#0E1117] border border-white/5 rounded-xl flex items-center justify-between group">
                                        <div>
                                            <div className="text-white font-medium">{invite.email}</div>
                                            <div className="text-xs text-gray-500">
                                                Role: <span className="capitalize text-primary-300">{invite.role}</span> • Expires: {new Date(invite.expires_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => copyInviteLink(invite.token)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-all border border-white/5"
                                                title="Copy Invite Link"
                                            >
                                                {copiedToken === invite.token ? <BsCheck className="text-lg text-emerald-400" /> : <BsLink45Deg className="text-lg" />}
                                                {copiedToken === invite.token ? "Copied" : "Copy Link"}
                                            </button>
                                            <button
                                                onClick={() => deleteInvite(invite.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                                title="Revoke Invite"
                                            >
                                                <BsTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>,
        document.body
    );
}
