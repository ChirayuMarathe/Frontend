import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsX,
  BsArrowRight,
  BsArrowLeft,
  BsCheck2,
  BsChat,
  BsGear,
  BsLightning,
  BsStars,
  BsRocket,
  BsFileEarmark,
  BsSearch,
} from "react-icons/bs";

// Desktop Tour step configurations (with spotlight)
const desktopTourSteps = [
  {
    id: "welcome",
    type: "modal",
    route: "/dashboard",
    title: "Welcome to Dabby",
    subtitle: "Your AI Financial Consultant",
    description:
      "Dabby helps you analyze financial data and get actionable insights for your business.",
    icon: BsRocket,
    features: [
      { icon: BsChat, text: "AI-powered chat assistance" },
      { icon: BsFileEarmark, text: "Deep document analysis" },
      { icon: BsLightning, text: "Instant data insights" },
    ],
  },
  {
    id: "sidebar",
    type: "spotlight",
    route: "/dashboard",
    target: '[data-tour="sidebar"]',
    position: "right",
    title: "Navigation Sidebar",
    description:
      "Your command center. Access chat history and all key features from here.",
    icon: BsSearch,
    tip: "Use Ctrl+K to quickly search through your chats",
  },
  {
    id: "chat",
    type: "spotlight",
    route: "/dashboard",
    target: '[data-tour="chat-input"]',
    position: "top",
    title: "Chat with Dabby",
    description:
      "Ask questions about your financial data in natural language. Dabby understands context and provides detailed insights.",
    icon: BsChat,
    tip: 'Try: "Analyze my revenue trends" or "Compare Q1 vs Q2 expenses"',
  },
  {
    id: "settings",
    type: "modal",
    route: "/dashboard",
    title: "Settings & Preferences",
    subtitle: "Customize Your Experience",
    description:
      "Access Settings from your profile to configure API keys, manage your account, view billing, and personalize Dabby to your workflow.",
    icon: BsGear,
    features: [
      { icon: BsGear, text: "API key configuration" },
      { icon: BsStars, text: "AI model preferences" },
      { icon: BsLightning, text: "Account management" },
    ],
  },
  {
    id: "complete",
    type: "modal",
    route: "/dashboard",
    title: "You're Ready!",
    subtitle: "Start Your Journey",
    description:
      "Begin by uploading files to analyze. Dabby is here to help with any financial questions!",
    icon: BsCheck2,
    isComplete: true,
  },
];

// Mobile Tour - Modal only (no spotlight since sidebar isn't visible)
const mobileTourSteps = [
  {
    id: "welcome",
    type: "modal",
    route: "/dashboard",
    title: "Welcome to Dabby",
    subtitle: "Your AI Financial Consultant",
    description:
      "Dabby helps you analyze financial data and get actionable insights for your business.",
    icon: BsRocket,
    features: [
      { icon: BsChat, text: "AI-powered chat" },
      { icon: BsFileEarmark, text: "Deep document analysis" },
      { icon: BsLightning, text: "Instant data insights" },
    ],
  },
  {
    id: "navigation",
    type: "modal",
    route: "/dashboard",
    title: "Navigate with Menu",
    subtitle: "Tap the ☰ icon",
    description:
      "Use the menu button in the top-left corner to access the sidebar. From there you can navigate to Settings.",
    icon: BsSearch,
    features: [
      { icon: BsGear, text: "Configure settings" },
    ],
  },
  {
    id: "chat",
    type: "modal",
    route: "/dashboard",
    title: "Chat with Dabby",
    subtitle: "Ask Anything",
    description:
      "Type your questions in the chat input at the bottom. Dabby understands financial data and provides detailed insights.",
    icon: BsChat,
    features: [
      { icon: BsChat, text: "Natural language queries" },
      { icon: BsFileEarmark, text: "Attach files for analysis" },
      { icon: BsLightning, text: "Get instant insights" },
    ],
  },
  {
    id: "complete",
    type: "modal",
    route: "/dashboard",
    title: "You're Ready!",
    subtitle: "Start Your Journey",
    description:
      "Tap the menu to explore, or start chatting right away. Dabby is here to help!",
    icon: BsCheck2,
    isComplete: true,
  },
];

export default function OnboardingTour({ isOpen, onComplete }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Use appropriate tour steps based on device
  const activeSteps = isMobile ? mobileTourSteps : desktopTourSteps;
  const step = activeSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === activeSteps.length - 1;
  const progress = ((currentStep + 1) / activeSteps.length) * 100;

  // Handle navigation when step changes
  useEffect(() => {
    if (!isOpen || !step?.route) return;

    if (location.pathname !== step.route) {
      setIsNavigating(true);
      navigate(step.route);

      // Wait for navigation and page render
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen, step?.route, navigate, location.pathname]);

  // Find and track target element for spotlight steps
  useEffect(() => {
    if (
      !isOpen ||
      isNavigating ||
      step?.type !== "spotlight" ||
      !step?.target
    ) {
      setTargetRect(null);
      return;
    }

    const updateTargetRect = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom,
        });
      } else {
        setTargetRect(null);
      }
    };

    // Initial find with delay for page render
    const timer = setTimeout(updateTargetRect, 200);

    // Update on resize/scroll
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [step, isOpen, isNavigating]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      navigate("/dashboard");
      onComplete?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, navigate, onComplete]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback(() => {
    navigate("/dashboard");
    onComplete?.();
  }, [navigate, onComplete]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  if (!isOpen) return null;

  const StepIcon = step?.icon || BsStars;

  // Check if step position is "center" - show modal-like centered card
  const isCenterPosition = step?.position === "center";

  // Calculate tooltip position for spotlight steps
  const getTooltipStyle = () => {
    if (!targetRect || step?.type !== "spotlight") return {};

    // Center position shows a centered modal instead of positioned tooltip
    if (isCenterPosition) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
      };
    }

    const tooltipWidth = 360;
    const tooltipHeight = 280;
    const gap = 20;
    const padding = 16;

    let left, top;

    switch (step.position) {
      case "right":
        left = targetRect.right + gap;
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        // Keep in viewport
        if (left + tooltipWidth > window.innerWidth - padding) {
          left = targetRect.left - tooltipWidth - gap;
        }
        break;
      case "left":
        left = targetRect.left - tooltipWidth - gap;
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        if (left < padding) {
          left = targetRect.right + gap;
        }
        break;
      case "top":
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        top = targetRect.top - tooltipHeight - gap;
        if (top < padding) {
          top = targetRect.bottom + gap;
        }
        break;
      case "bottom":
      default:
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        top = targetRect.bottom + gap;
        if (top + tooltipHeight > window.innerHeight - padding) {
          top = targetRect.top - tooltipHeight - gap;
        }
        break;
    }

    // Keep within horizontal bounds
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - tooltipWidth - padding)
    );
    // Keep within vertical bounds
    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - tooltipHeight - padding)
    );

    return { left, top, width: tooltipWidth };
  };

  // Render spotlight overlay with cutout
  const renderSpotlightOverlay = () => {
    if (step?.type !== "spotlight" || !targetRect) {
      return (
        <div
          className="fixed inset-0 bg-black/70"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    // For center position (full page spotlight), show a lighter overlay without cutout
    if (isCenterPosition) {
      return (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    const spotPadding = 8;
    const spotRadius = 12;

    return (
      <svg
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 1, pointerEvents: "none" }}
      >
        <defs>
          <mask id="spotlight-mask">
            {/* White = visible overlay, Black = transparent cutout */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - spotPadding}
              y={targetRect.top - spotPadding}
              width={targetRect.width + spotPadding * 2}
              height={targetRect.height + spotPadding * 2}
              rx={spotRadius}
              ry={spotRadius}
              fill="black"
            />
          </mask>
        </defs>
        {/* Semi-transparent overlay with cutout */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
          style={{ pointerEvents: "auto" }}
          onClick={(e) => e.stopPropagation()}
        />
      </svg>
    );
  };

  // Render spotlight highlight border
  const renderSpotlightHighlight = () => {
    // Don't show highlight border for center position (full page) or missing target
    if (step?.type !== "spotlight" || !targetRect || isCenterPosition)
      return null;

    const spotPadding = 8;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed pointer-events-none"
        style={{
          left: targetRect.left - spotPadding,
          top: targetRect.top - spotPadding,
          width: targetRect.width + spotPadding * 2,
          height: targetRect.height + spotPadding * 2,
          zIndex: 2,
        }}
      >
        <div className="absolute inset-0 rounded-xl border-2 border-teal-400 shadow-md" />
        <div className="absolute inset-0 rounded-xl border-2 border-teal-300/50 animate-pulse" />
      </motion.div>
    );
  };

  // Tour card content (shared between modal and spotlight)
  const renderTourCard = (isSpotlight = false) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${isSpotlight ? "w-[360px]" : "w-full max-w-md"
        }`}
      style={
        isSpotlight
          ? { ...getTooltipStyle(), position: "fixed", zIndex: 10 }
          : {}
      }
      onClick={(e) => e.stopPropagation()}
    >
      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={handleSkip}
        className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all z-10"
        aria-label="Close tour"
      >
        <BsX className="text-lg" />
      </button>

      {/* Content */}
      <div className="p-5">
        {/* Icon & Step counter */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${step?.isComplete
                ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-md"
                : "bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md"
              }`}
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
          >
            <StepIcon className="text-xl text-white" />
          </motion.div>
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full">
            <span className="text-xs font-medium text-teal-400">
              {currentStep + 1}
            </span>
            <span className="text-xs text-gray-600">/</span>
            <span className="text-xs text-gray-500">{activeSteps.length}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-1">{step?.title}</h2>
        {step?.subtitle && (
          <p className="text-sm font-medium text-teal-400 mb-3">
            {step.subtitle}
          </p>
        )}

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          {step?.description}
        </p>

        {/* Features list */}
        {step?.features && (
          <div className="space-y-2 mb-4">
            {step.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="w-7 h-7 rounded-md bg-teal-500/10 flex items-center justify-center">
                  <feature.icon className="text-sm text-teal-400" />
                </div>
                <span className="text-sm text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pro tip */}
        {step?.tip && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <BsLightning className="text-teal-400 flex-shrink-0 mt-0.5 text-sm" />
              <p className="text-xs text-teal-300">{step.tip}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/20 border-t border-white/10">
        <button
          onClick={handleSkip}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Skip tour
        </button>

        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <BsArrowLeft className="text-xs" />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all shadow-md ${step?.isComplete
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500"
                : "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500"
              }`}
          >
            {isLastStep ? "Get Started" : "Continue"}
            {isLastStep ? (
              <BsCheck2 className="text-sm" />
            ) : (
              <BsArrowRight className="text-xs" />
            )}
          </button>
        </div>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 py-3 bg-black/20">
        {activeSteps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep
                ? "bg-teal-500 w-5"
                : idx < currentStep
                  ? "bg-teal-500/50 w-1.5"
                  : "bg-gray-700 w-1.5 hover:bg-gray-600"
              }`}
            aria-label={`Go to step ${idx + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );

  return createPortal(
    <AnimatePresence mode="wait">
      <div key={step?.id} className="fixed inset-0" style={{ zIndex: 99999 }}>
        {step?.type === "spotlight" ? (
          <>
            {/* Spotlight overlay with cutout */}
            {renderSpotlightOverlay()}

            {/* Highlight border */}
            {renderSpotlightHighlight()}

            {/* Tooltip card */}
            {targetRect && renderTourCard(true)}

            {/* Fallback if target not found */}
            {!targetRect && !isNavigating && (
              <div
                className="fixed inset-0 flex items-center justify-center p-4"
                style={{ zIndex: 10 }}
              >
                <div
                  className="fixed inset-0 bg-black/70"
                  onClick={(e) => e.stopPropagation()}
                />
                {renderTourCard(false)}
              </div>
            )}
          </>
        ) : (
          /* Modal type - centered card */
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <div style={{ position: "relative", zIndex: 10 }}>
              {renderTourCard(false)}
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>,
    document.body
  );
}
