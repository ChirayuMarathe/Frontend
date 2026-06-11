import { useState, useRef, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import WelcomeSection from "./WelcomeSection/WelcomeSection";
import ActionCards from "./ActionCards/ActionCards";
import ChatInput from "./ChatInput/ChatInput";
import ChatArea from "./ChatArea/ChatArea";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import Settings from "./Settings/Settings";
import Workbenches from "../pages/Workbenches";
import WorkbenchDetail from "../pages/WorkbenchDetail";
import OnboardingTour from "./Onboarding/OnboardingTour";
import FeedbackModal from "./ChatArea/FeedbackModal";
import { backendService } from "../services/backendService";
import { contextService } from "../services/contextService";
import { supabase } from "../lib/supabase";
import { BsRocketTakeoff, BsChevronRight } from "react-icons/bs";

export default function MainApp() {
  useTheme(); // Theme context is used for side effects
  const location = useLocation();
  const { user, profile, loading: authLoading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentContext, setCurrentContext] = useState("");
  const [activeWorkbench, setActiveWorkbench] = useState(null);
  const [availableWorkbenches, setAvailableWorkbenches] = useState([]);
  const [isInConversation, setIsInConversation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const chatInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-show onboarding tour for new users who just completed the onboarding form
  useEffect(() => {
    if (authLoading) return;

    const hasCompletedOnboarding = localStorage.getItem("dabby_onboarding_completed");
    const justOnboarded = location.state?.fromOnboarding;

    // Only show the tour if they just finished the onboarding form 
    // OR if it's a first-time user on this device who hasn't seen it yet
    // BUT we check if they are actually a new user by looking at profile.status
    // Actually, if they just onboarded, they definitely should see it.
    if (justOnboarded || (!hasCompletedOnboarding && user?.id && profile?.status === 'partial')) {
      const timer = setTimeout(() => {
        setShowTour(true);
        // Clear the state so it doesn't trigger again on refresh
        if (justOnboarded) {
          window.history.replaceState({}, document.title);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user?.id, location.state, profile?.status, authLoading]);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem("dabby_onboarding_completed", "true");
  };

  // Auto-persist context to localStorage
  useEffect(() => {
    if (currentSessionId && currentContext) {
      localStorage.setItem(`dabby_context_${currentSessionId}`, currentContext);
    }
  }, [currentContext, currentSessionId]);

  // Listen for clearChat event from sidebar
  useEffect(() => {
    const handleClearChat = () => {
      // Show feedback modal before clearing if there was a conversation
      if (messages.length > 0) {
        setIsFeedbackModalOpen(true);
      }
      setMessages([]);
      setUploadedFiles([]);
      setIsInConversation(false);
      setWebSearchEnabled(false);
      setCurrentContext("");
      setCurrentSessionId(null);
    };

    const handleLoadChatSession = (event) => {
      const { sessionId, messages: sessionMessages } = event.detail;
      setCurrentSessionId(sessionId);
      setMessages(sessionMessages);
      setIsInConversation(true);

      // Load persisted context for this session
      const savedContext = localStorage.getItem(`dabby_context_${sessionId}`);

      // Extract uploaded files from session messages to restore uploadedFiles state
      const allUploadedFiles = sessionMessages
        .filter(m => m.options?.uploadedFiles?.length > 0)
        .flatMap(m => m.options.uploadedFiles);
      setUploadedFiles(allUploadedFiles);

      if (savedContext) {
        setCurrentContext(savedContext);
      } else {
        // If no saved context, try to rebuild it from messages that had files
        const fileMessages = sessionMessages.filter(m => m.options?.uploadedFiles?.length > 0);
        if (fileMessages.length > 0) {
          console.log("Found messages with files, context might need rebuilding.");
        }
        setCurrentContext("");
      }
    };

    const handleStartAIChat = (event) => {
      const { query, workbenchId } = event.detail;
      
      // Small delay to ensure any other UI actions complete
      setTimeout(() => {
        handleSendMessage(query, {
          workbenchId: workbenchId,
          web: false,
          uploadedFiles: [],
          hasContext: true
        });
      }, 100);
    };

    window.addEventListener("clearChat", handleClearChat);
    window.addEventListener("loadChatSession", handleLoadChatSession);
    window.addEventListener("start-ai-chat", handleStartAIChat);

    return () => {
      window.removeEventListener("clearChat", handleClearChat);
      window.removeEventListener("loadChatSession", handleLoadChatSession);
      window.removeEventListener("start-ai-chat", handleStartAIChat);
    };
  }, [messages.length]);

  // Auto-save chat session and generate summary
  const saveChatSession = async (sessionMessages) => {
    // Don't store chat sessions if user isn't authenticated or there's only 1 message
    if (!user?.id || sessionMessages.length < 2) {
      console.log("[DEBUG] Chat persistence skipped: Not authenticated or insufficient messages.");
      return;
    }

    try {
      // Find the last User message and the last Assistant message in the current thread
      const lastUserMessage = [...sessionMessages].reverse().find(m => m.role === 'user');
      const lastAssistantMessage = [...sessionMessages].reverse().find(m => m.role === 'assistant');

      if (!lastUserMessage || !lastAssistantMessage) {
        console.warn("[DEBUG] Chat persistence skipped: Missing user or assistant message in thread.");
        return;
      }

      // Generate title from first user message if it doesn't exist
      const firstUserMsg = sessionMessages.find((m) => m.role === "user");
      const title = firstUserMsg
        ? firstUserMsg.content.substring(0, 50) +
        (firstUserMsg.content.length > 50 ? "..." : "")
        : "Untitled Chat";

      // Check for Workbench context
      const currentPath = window.location.pathname;
      const workbenchMatch = currentPath.match(/\/workbenches\/([^/]+)/);
      const workbenchId = activeWorkbench?.active ? activeWorkbench.id : (workbenchMatch ? workbenchMatch[1] : null);

      let sessionIdToUse = currentSessionId;
      let isNewSession = false;

      // 1. Create session if it doesn't exist
      if (!sessionIdToUse) {
        console.log("[DEBUG] Persistence: Creating new chat session...");
        const session = await backendService.createChatSession(title, workbenchId);
        if (session && session.id) {
          sessionIdToUse = session.id;
          setCurrentSessionId(sessionIdToUse);
          isNewSession = true;
          console.log("[DEBUG] New session ID created:", sessionIdToUse);
        } else {
          throw new Error("Failed to create chat session - no ID returned.");
        }
      }

      // 2. Save User Message
      const userMetadata = {
        timestamp: lastUserMessage.timestamp || new Date().toISOString(),
        sender: "You",
        files: lastUserMessage.options?.uploadedFiles?.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        })) || [],
      };
      
      console.log("[DEBUG] Persistence: Saving User message...");
      await backendService.saveChatMessage(
        sessionIdToUse,
        "user",
        lastUserMessage.content,
        userMetadata,
        workbenchId
      );

      // 3. Save Assistant Message
      const aiMetadata = {
        timestamp: lastAssistantMessage.timestamp || new Date().toISOString(),
        sender: "Dabby Consultant",
        files: [],
      };

      console.log("[DEBUG] Persistence: Saving Assistant response...");
      await backendService.saveChatMessage(
        sessionIdToUse,
        "assistant",
        lastAssistantMessage.content,
        aiMetadata,
        workbenchId
      );

      console.log("[DEBUG] Full exchange persisted successfully to session:", sessionIdToUse);

      // Trigger sidebar refresh
      window.dispatchEvent(new Event("chatHistoryUpdated"));
    } catch (error) {
      console.error("[ERROR] Chat persistence failed:", error);
      if (error.code === '42501') {
        toast.error("Database permission denied (RLS). Please check Supabase policies.");
      } else if (error.code === '42P01') {
        toast.error("Database table missing. Please run setup script.");
      }
    }
  };

  // Fetch all available workbenches for context selection
  useEffect(() => {
    const fetchAllWorkbenches = async () => {
      if (authLoading || !user?.id) return;

      console.log("[DEBUG] MainApp: Fetching workbenches for user", user.id);
      try {
        // 1. Fetch the user's workbench memberships first
        const { data: memberships, error: memError } = await supabase
          .from("workbench_members")
          .select("workbench_id")
          .eq("user_id", user.id);

        if (memError) throw memError;
        
        if (!memberships || memberships.length === 0) {
          setAvailableWorkbenches([]);
          return;
        }

        const workbenchIds = memberships.map(m => m.workbench_id);

        // 2. Fetch the actual workbench details
        const { data, error } = await supabase
          .from("workbenches")
          .select("id, name")
          .in("id", workbenchIds)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[DEBUG] MainApp: Error fetching workbenches:", error);
        } else {
          console.log("[DEBUG] MainApp: Workbenches response:", data);
          setAvailableWorkbenches(data || []);
        }
      } catch (err) {
        console.error("[DEBUG] MainApp: Unexpected error fetching workbenches:", err);
      }
    };
    fetchAllWorkbenches();
  }, [user?.id, authLoading]);

  // Handle workbench context toggle from ChatInput
  const handleToggleWorkbenchContext = (workbench = null) => {
    if (workbench) {
      // If a specific workbench is provided, set it as active
      setActiveWorkbench({ ...workbench, active: true });
    } else if (activeWorkbench) {
      // Otherwise toggle the current active workbench
      setActiveWorkbench(prev => ({ ...prev, active: !prev.active }));
    }
  };

  // Sync activeWorkbench when navigating to/from workbench detail
  useEffect(() => {
    const workbenchMatch = location.pathname.match(/\/workbenches\/([^/]+)/);
    if (workbenchMatch) {
      const id = workbenchMatch[1];
      // Fetch workbench details if we don't have them or it's a different workbench
      if (!activeWorkbench || activeWorkbench.id !== id) {
        const fetchWorkbench = async () => {
          try {
            const { data, error } = await supabase
              .from("workbenches")
              .select("id, name")
              .eq("id", id)
              .single();
            if (!error && data) {
              setActiveWorkbench({ ...data, active: true });
              // Initialize Self party via Supabase directly
              const { data: { user: currentUser } } = await supabase.auth.getUser();
              if (currentUser) {
                supabase.from('parties').upsert({
                  workbench_id: id,
                  name: 'Self',
                  category: 'self',
                  user_id: currentUser.id
                }, { onConflict: 'workbench_id,user_id' }).then(() => {
                  console.log('[DEBUG] Self party initialized for workbench:', id);
                }).catch(err => console.error("Error initializing self party:", err));
              }
            }
          } catch (err) {
            console.error("Error fetching workbench for chat context:", err);
          }
        };
        fetchWorkbench();
      }
    } else {
      // If we leave the workbench detail page, we might want to keep the context active 
      // but allow the user to toggle it off. For now, let's keep it if it was active.
      // Or we can clear it if you want context to be page-specific.
      // setActiveWorkbench(null); 
    }
  }, [location.pathname, activeWorkbench]);

  const handleSendMessage = async (
    message,
    options = {},
    isAIResponse = false
  ) => {
    // If this is an AI response, add it to the conversation
    if (isAIResponse && options.response) {
      const aiResponse = {
        id: Date.now() + 1,
        content: options.response,
        role: "assistant",
        sender: "Dabby Consultant",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      return;
    }

    // Handle empty message with files
    let displayMessage = message;
    let llmQuery = message;
    const hasFiles = options.uploadedFiles && options.uploadedFiles.length > 0;

    if (!message.trim() && hasFiles) {
      const fileCount = options.uploadedFiles.length;
      const fileNames = options.uploadedFiles.map(f => f.name).join(", ");
      displayMessage = `Attached ${fileCount} file${fileCount > 1 ? 's' : ''}: ${fileNames}`;
      llmQuery = `I have uploaded these files: ${fileNames}. Please acknowledge receipt and ask how you can help. Do not analyze them yet.`;
    } else if (!message.trim() && !hasFiles) {
      // Should not happen due to disabled button, but safe guard
      return;
    }

    // This is a user message, add it to conversation
    const newMessage = {
      id: Date.now(),
      content: displayMessage,
      role: "user",
      options,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsInConversation(true); // Switch to conversation mode

    // If there are uploaded files, show loading message
    let loadingId = null;

    if (hasFiles) {
      // We set this for display in ChatArea, but we don't want it re-syncing to ChatInput as "pending"
      setUploadedFiles(prev => [...prev, ...options.uploadedFiles]);
      const fileNames = options.uploadedFiles.map((f) => f.name).join(", ");
      const loadingMsg = message.trim()
        ? `Analyzing files: ${fileNames}...`
        : `Uploading files: ${fileNames}...`;

      const loading = {
        id: Date.now() + 2,
        content: loadingMsg,
        role: "assistant",
        sender: "Dabby Consultant",
        timestamp: new Date().toISOString(),
        isLoading: true,
      };
      setMessages((prev) => [...prev, loading]);
      setIsLoading(true);
      loadingId = loading.id;
    }

    // Always call AI function (ChatInput handles this now)
    try {
      const { callLLMWithFallback } = await import("../services/llmService.js");

      // Build real-time business context for workbench if active
      let workbenchContextStr = "";
      if (options.workbenchId) {
        try {
          console.log(`[DEBUG] Building real-time intelligence for workbench: ${options.workbenchId}`);
          const intel = await contextService.getWorkbenchIntelligence(options.workbenchId);
          workbenchContextStr = contextService.formatForLLM(intel);
          console.log("[DEBUG] Real-time context built successfully.");
        } catch (ctxError) {
          console.error("[DEBUG] Error building workbench intelligence:", ctxError);
          workbenchContextStr = "Error: Failed to fetch real-time workbench data.";
        }
      }

      const llmResponse = await callLLMWithFallback({
        query: llmQuery, 
        context: workbenchContextStr + (currentContext ? `\n\n=== ADDITIONAL HISTORY CONTEXT ===\n${currentContext}` : ""),
        web_search: options.web || false,
        uploaded_files: options.uploadedFiles || [], 
        history: messages,
        workbench_id: options.workbenchId
      });

      if (llmResponse.error) {
        throw new Error(llmResponse.error);
      }

      // Update current context if returned (always keep the latest context)
      if (llmResponse.context) {
        setCurrentContext(llmResponse.context);
      }

      // Remove loading message and add AI response
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== loadingId)
          .concat({
            id: Date.now() + 1,
            content: llmResponse.response,
            role: "assistant",
            sender: "Dabby Consultant",
            timestamp: new Date().toISOString(),
          })
      );
      setIsLoading(false);

      // Auto-save chat session after AI responds
      const updatedMessages = messages.concat(newMessage, {
        id: Date.now() + 1,
        content: llmResponse.response,
        role: "assistant",
        sender: "Dabby Consultant",
        timestamp: new Date().toISOString(),
      });
      await saveChatSession(updatedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove loading and add error response
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== loadingId)
          .concat({
            id: Date.now() + 1,
            content: "Sorry, I encountered an error. Please try again.",
            role: "assistant",
            sender: "Dabby Consultant",
            timestamp: new Date().toISOString(),
          })
      );
      setIsLoading(false);
    }
  };

  const handleQuestionCardClick = (question) => {
    if (chatInputRef.current) {
      chatInputRef.current.setMessage(question);
      // Always auto-send the message when clicking a suggestion card
      setTimeout(() => {
        chatInputRef.current.sendMessage(question);
      }, 100);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0a] text-white font-dm-sans relative">
      {/* Database Setup Banner - Removed as it's part of cleaned features */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        sessionId={currentSessionId}
      />

      {/* Mobile/Tablet Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer - Slides in from left */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-[280px] max-w-[85vw] z-50 bg-[#0E1117] border-r border-[#1F242C] transform transition-transform duration-300 ease-out overflow-y-auto
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Mobile Sidebar Header with Close */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-white/10 bg-[#0E1117]/95 backdrop-blur-sm z-10">
          <div className="flex items-center space-x-2">
            <img src="/dabby-logo.svg" alt="Dabby" className="h-7 w-7" />
            <span className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">Dabby</span>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <Sidebar
          onNavigate={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Desktop Sidebar - Hidden on mobile/tablet */}
      <div
        className={`hidden lg:block bg-[#0A0A0A] transition-all duration-500 ease-in-out flex-shrink-0 relative group/sidebar ${
          isSidebarCollapsed ? "w-16" : "w-[280px]"
        }`}
      >
        <Sidebar isCollapsed={isSidebarCollapsed} />
        
        {/* Desktop Sidebar Toggle Button - Now integrated into the edge */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute top-1/2 -translate-y-1/2 -right-3 z-50 w-6 h-12 bg-[#0A0A0A] border border-white/10 hover:border-teal-500/50 text-gray-500 hover:text-teal-400 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl group-hover/sidebar:opacity-100 ${isSidebarCollapsed ? "opacity-100" : "opacity-0"}`}
        >
          <BsChevronRight className={`text-[10px] transition-transform duration-500 ${isSidebarCollapsed ? "" : "rotate-180"}`} />
        </button>
      </div>


      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <Header
          onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        {/* Main Dashboard Content */}
        <div className="flex-1 min-h-0 overflow-auto pb-[120px] sm:pb-[100px] lg:pb-0 relative">
          <Routes>
            <Route
              index
              element={
                isInConversation ? (
                  <ChatArea
                    messages={messages}
                    isLoading={isLoading}
                    chatContainerRef={chatContainerRef}
                    onSendMessage={handleSendMessage}
                    uploadedFiles={uploadedFiles}
                    workbenchContext={activeWorkbench}
                    availableWorkbenches={availableWorkbenches}
                    onToggleWorkbenchContext={handleToggleWorkbenchContext}
                  />
                ) : (
                  <>
                    <WelcomeSection />
                    <ActionCards
                      onQuestionCardClick={handleQuestionCardClick}
                      activeWorkbench={activeWorkbench}
                    />
                  </>
                )
              }
            />
            <Route
              path="home"
              element={
                <>
                  <WelcomeSection />
                  <ActionCards
                    onQuestionCardClick={handleQuestionCardClick}
                    activeWorkbench={activeWorkbench}
                  />
                </>
              }
            />
            <Route path="settings" element={<Settings />} />
            <Route path="workbenches" element={<Workbenches />} />
            <Route path="workbenches/:id" element={<WorkbenchDetail />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>

        {!isInConversation &&
          !location.pathname.includes("/settings") &&
          !location.pathname.includes("/workbenches") && (
            <ChatInput
              ref={chatInputRef}
              onSendMessage={handleSendMessage}
              webSearchEnabled={webSearchEnabled}
              uploadedFiles={uploadedFiles}
              workbenchContext={activeWorkbench}
              availableWorkbenches={availableWorkbenches}
              onToggleWorkbenchContext={handleToggleWorkbenchContext}
            />
          )}

        {/* Floating Help Button - Removed, now in Settings */}
      </div>

      {/* Onboarding Tour - Auto-shows for new users on any device */}
      <OnboardingTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onComplete={handleTourComplete}
      />
    </div>
  );
}
