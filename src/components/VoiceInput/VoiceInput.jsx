import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiMic, FiMicOff, FiAlertCircle } from 'react-icons/fi';

export default function VoiceInput({ 
  onTranscript, 
  onFinalTranscript,
  disabled = false,
  className = ''
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const isListeningRef = useRef(false);

  // Create a new recognition instance with optimized settings
  const createRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening continuously
    recognition.interimResults = true; // Show results as user speaks
    recognition.lang = 'en-US'; // Primary language
    recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
    
    return recognition;
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (disabled || isListeningRef.current) return;

    // Create fresh recognition instance each time
    const recognition = createRecognition();
    if (!recognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        // Get the most confident result
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Combine final and interim for display
      const currentTranscript = (finalTranscript + interimTranscript).trim();
      
      if (currentTranscript) {
        setTranscript(currentTranscript);
        onTranscript?.(currentTranscript);
      }

      if (finalTranscript.trim()) {
        onFinalTranscript?.(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      isListeningRef.current = false;
      setIsListening(false);
      
      // Only show error for actual problems, not aborted
      if (event.error === 'aborted') return;
      
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Enable in browser settings.');
          break;
        case 'no-speech':
          // Don't show error for no speech - just silently stop
          break;
        case 'network':
          setError('Network error. Check your connection.');
          break;
        case 'audio-capture':
          setError('No microphone found. Please connect one.');
          break;
        default:
          // Don't show generic errors
          break;
      }
    };

    recognition.onend = () => {
      // If we're still supposed to be listening, restart (handles browser auto-stop)
      if (isListeningRef.current) {
        try {
          recognition.start();
          return; // Don't set listening to false, we're restarting
        } catch (e) {
          console.log('Could not restart recognition');
        }
      }
      isListeningRef.current = false;
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start error:', err);
      setError('Could not start voice input. Please try again.');
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [disabled, createRecognition, onTranscript, onFinalTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`group relative p-2 rounded-md border transition-all duration-200 focus:outline-none focus:ring-1 ${
          isListening 
            ? 'border-red-500/50 bg-red-500/10 text-red-400 ring-1 ring-red-500/30' 
            : 'border-gray-700/50 bg-transparent text-gray-400 hover:text-teal-400 hover:border-teal-500/40 hover:bg-teal-500/5 focus:ring-teal-500/30'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        title={isListening ? 'Stop recording' : 'Voice input (hold to speak)'}
        aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
        aria-pressed={isListening}
      >
        {/* Pulse Animation when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-md bg-red-500/30 animate-ping" />
            <span className="absolute inset-0 rounded-md bg-red-500/20 animate-pulse" />
          </>
        )}
        
        {/* Icon */}
        <span className="relative z-10">
          {isListening ? (
            <FiMicOff size={14} className="animate-pulse" />
          ) : (
            <FiMic size={14} className="group-hover:scale-110 transition-transform" />
          )}
        </span>
      </button>

      {/* Error Tooltip */}
      {error && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-red-900/90 text-red-200 text-xs rounded-lg whitespace-nowrap shadow-lg animate-fade-in z-50">
          <div className="flex items-center gap-2">
            <FiAlertCircle size={14} />
            <span>{error}</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-900/90" />
        </div>
      )}

      {/* Listening Indicator */}
      {isListening && transcript && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/95 text-gray-200 text-xs rounded-lg max-w-xs truncate shadow-lg animate-fade-in z-50">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <span className="w-1.5 h-3 bg-teal-500 rounded-full animate-sound-wave" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-3 bg-teal-500 rounded-full animate-sound-wave" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-3 bg-teal-500 rounded-full animate-sound-wave" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="truncate">{transcript}</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95" />
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        @keyframes sound-wave {
          0%, 100% { height: 0.5rem; }
          50% { height: 1rem; }
        }
        .animate-sound-wave {
          animation: sound-wave 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
