import React, { useMemo } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "../ChatInput/ChatInput";

const ChatArea = ({
  messages: propMessages,
  onSendMessage,
  uploadedFiles,
  workbenchContext,
  availableWorkbenches,
  onToggleWorkbenchContext,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  // Map MainApp messages to ChatArea format (preserve role property)
  const chatMessages = useMemo(() => {
    return propMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      sender: msg.role === "user" ? "You" : msg.sender || "Dabby Consultant",
      avatar: msg.role === "user" ? "U" : "DC",
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
      isUser: msg.role === "user",
    }));
  }, [propMessages]);

  const messagesWithContext = chatMessages;

  return (
    <div className="flex flex-col h-full min-h-0 bg-transparent">
      <ChatHeader 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList 
          messages={messagesWithContext} 
          searchTerm={searchTerm}
        />
      </div>

      <ChatInput
        onSendMessage={onSendMessage}
        uploadedFiles={uploadedFiles}
        placeholder="Ask Dabby Consultant anything..."
        workbenchContext={workbenchContext}
        availableWorkbenches={availableWorkbenches}
        onToggleWorkbenchContext={onToggleWorkbenchContext}
      />
    </div>
  );
};

export default ChatArea;
