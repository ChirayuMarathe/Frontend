import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-[#111] border border-red-900/30 rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-8">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-[#81E6D9] text-black font-bold rounded-2xl hover:bg-[#70d4c7] transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh Page
              </button>

              <a
                href="/"
                className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-white/5 text-white font-medium rounded-2xl hover:bg-white/10 transition-all"
              >
                <Home className="w-4 h-4" />
                Return Home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-black rounded-xl text-left overflow-auto max-h-40">
                <code className="text-red-400 text-xs font-mono">
                  {this.state.error && this.state.error.toString()}
                </code>
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
