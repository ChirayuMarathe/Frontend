import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BsPerson,
  BsGear,
  BsChat,
  BsStars,
  BsChevronDown,
  BsChevronRight,
  BsBuilding,
  BsClockHistory,
  BsPlusLg
} from "react-icons/bs";
import { useAuth } from "../../hooks/useAuth";
import ChatSearch from "../ChatSearch";
import { supabase } from "../../lib/supabase";

const SidebarButton = ({
  icon: IconComponent,
  children,
  subtitle = null,
  isActive = false,
  badge = null,
  onClick,
  isPrimary = false,
  href = null,
  onNavigate,
  isCollapsed = false,
}) => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    if (href) {
      e.preventDefault();
      navigate(href);
      onNavigate?.();
    }
    if (onClick) {
      onClick(e);
      onNavigate?.();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`relative w-full flex items-center transition-all duration-300 min-h-[48px] group rounded-xl ${
        isPrimary
          ? "bg-primary text-black shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
          : isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
      } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
      title={isCollapsed ? (typeof children === 'string' ? children : '') : ''}
    >
      <IconComponent
        className={`text-xl flex-shrink-0 transition-all duration-300 ${isPrimary ? "text-black/80" : ""} ${isCollapsed ? "mr-0" : "mr-4"}`}
      />
      
      {!isCollapsed && (
        <div className="flex-1 flex flex-col justify-center overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
          <span className="leading-tight font-bold text-sm truncate">{children}</span>
          {subtitle && (
            <span className="text-[10px] font-medium mt-0.5 leading-tight text-gray-500 truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}

      {!isCollapsed && badge && (
        <span className="bg-white/10 text-gray-400 text-[10px] px-2 py-0.5 rounded-full ml-2 font-bold">
          {badge}
        </span>
      )}

      {/* Tooltip for collapsed mode */}
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-[#0A0A0A] border border-white/10 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-2xl">
          {children}
        </div>
      )}
    </button>
  );
};

const ExpandableSection = ({
  title,
  icon: IconComponent,
  isExpanded,
  onToggle,
  children,
  badge = null,
  isCollapsed = false,
}) => (
  <div className="mb-2">
    <button
      onClick={onToggle}
      className={`relative w-full flex items-center transition-all duration-300 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl group ${isCollapsed ? "justify-center px-0 h-12" : "justify-between px-4 py-3"}`}
      title={isCollapsed ? title : ''}
    >
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-4"}`}>
        <IconComponent className={`text-xl transition-all duration-300 ${isCollapsed ? "mr-0" : ""}`} />
        {!isCollapsed && <span className="font-bold text-sm tracking-tight">{title}</span>}
      </div>
      
      {!isCollapsed && (
        <div className="flex items-center gap-2">
          {badge > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-white/5 text-gray-500 text-[10px] font-bold rounded-full border border-white/5">
              {badge}
            </span>
          )}
          {isExpanded ? (
            <BsChevronDown className="text-[10px] opacity-40" />
          ) : (
            <BsChevronRight className="text-[10px] opacity-40" />
          )}
        </div>
      )}

      {/* Tooltip for collapsed mode */}
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-[#0A0A0A] border border-white/10 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-2xl">
          {title} {badge > 0 ? `(${badge})` : ''}
        </div>
      )}
    </button>
    
    {!isCollapsed && isExpanded && (
      <div className="ml-4 mt-1 space-y-1 pl-4 border-l border-white/5 animate-in slide-in-from-top-2 duration-300">
        {children}
      </div>
    )}
  </div>
);

export default function Sidebar({
  isCollapsed = false,
  onNavigate,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [expandedSections, setExpandedSections] = useState({
    history: false,
    workbenches: true,
  });

  const toggleSection = (section) => {
    if (isCollapsed) return; // Don't toggle in collapsed mode, or maybe expand it?
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [workbenches, setWorkbenches] = useState([]);

  const fetchWorkbenches = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch memberships first to avoid schema cache join errors
      const { data: memberships, error: memError } = await supabase
        .from("workbench_members")
        .select("workbench_id")
        .eq("user_id", user.id);

      if (memError) throw memError;

      if (!memberships || memberships.length === 0) {
        setWorkbenches([]);
        return;
      }

      const workbenchIds = memberships.map(m => m.workbench_id);

      const { data, error } = await supabase
        .from("workbenches")
        .select("*")
        .in("id", workbenchIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkbenches(data || []);
    } catch (err) {
      console.error("Error fetching workbenches:", err);
    }
  }, [user]);

  const fetchChatHistory = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        setChatHistory([]);
        return;
      }
      setChatHistory(data || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setChatHistory([]);
    }
  }, [user]);

  useEffect(() => {
    fetchChatHistory();
    fetchWorkbenches();

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const handleChatHistoryUpdate = () => fetchChatHistory();
    window.addEventListener("chatHistoryUpdated", handleChatHistoryUpdate);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("chatHistoryUpdated", handleChatHistoryUpdate);
    };
  }, [user, fetchChatHistory, fetchWorkbenches]);

  const loadChatSession = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      window.dispatchEvent(
        new CustomEvent("loadChatSession", {
          detail: {
            sessionId,
            messages: data.map((msg) => ({
              id: msg.id,
              content: msg.content,
              role: msg.role,
              sender: msg.role === "user" ? "You" : msg.metadata?.sender || "Dabby Consultant",
              timestamp: msg.created_at,
              metadata: msg.metadata,
            })),
          },
        })
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Error loading chat session:", error);
    }
  };

  return (
    <div
      className={`h-full bg-[#0A0A0A] border-r border-white/5 text-white flex flex-col transition-all duration-500 ease-in-out ${isCollapsed ? "w-16" : "w-full"}`}
      data-tour="sidebar"
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar px-3 py-6 space-y-8">
        {/* Main Action */}
        <div className="space-y-2">
          <SidebarButton
            icon={BsStars}
            isPrimary={true}
            subtitle={!isCollapsed ? "Ctrl + K" : null}
            isCollapsed={isCollapsed}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("clearChat"));
              if (location.pathname !== "/dashboard") navigate("/dashboard");
            }}
          >
            New Chat
          </SidebarButton>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 space-y-2">
          <ExpandableSection
            title="Workbenches"
            icon={BsBuilding}
            isExpanded={expandedSections.workbenches}
            onToggle={() => toggleSection("workbenches")}
            badge={workbenches.length}
            isCollapsed={isCollapsed}
          >
            {workbenches.map((wb) => (
              <div
                key={wb.id}
                onClick={() => navigate(`/dashboard/workbenches/${wb.id}`)}
                className="group flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <span className="truncate flex-1">{wb.name}</span>
                <BsChevronRight className="text-[8px] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
              </div>
            ))}
            <button
              onClick={() => navigate("/dashboard/workbenches")}
              className="w-full flex items-center space-x-2 px-3 py-2 text-[10px] font-black text-teal-400 uppercase tracking-widest hover:text-teal-300 transition-colors"
            >
              <BsPlusLg className="text-[10px]" />
              <span>View all</span>
            </button>
          </ExpandableSection>

          <ExpandableSection
            title="History"
            icon={BsClockHistory}
            isExpanded={expandedSections.history}
            onToggle={() => toggleSection("history")}
            badge={chatHistory.length}
            isCollapsed={isCollapsed}
          >
            {chatHistory.map((session) => (
              <div
                key={session.id}
                onClick={() => loadChatSession(session.id)}
                className="group flex flex-col px-3 py-2 text-xs font-bold text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <span className="truncate">{session.title || "Untitled Chat"}</span>
                <span className="text-[9px] text-gray-600 mt-0.5">{new Date(session.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </ExpandableSection>
        </div>

        {/* User & Settings */}
        <div className="pt-6 border-t border-white/5 space-y-2">
          <SidebarButton
            icon={BsPerson}
            isCollapsed={isCollapsed}
            isActive={location.pathname === "/dashboard/settings"}
            onClick={() => navigate("/dashboard/settings")}
            subtitle={!isCollapsed ? user?.email : null}
          >
            {user?.user_metadata?.full_name || "Account"}
          </SidebarButton>
          
          <SidebarButton
            icon={BsGear}
            isCollapsed={isCollapsed}
            isActive={false}
            onClick={() => navigate("/dashboard/settings")}
          >
            Settings
          </SidebarButton>
        </div>
      </div>

      {/* Search Modal */}
      <ChatSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        chatHistory={chatHistory}
        onSelectChat={(chat) => {
          loadChatSession(chat.id);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
}
