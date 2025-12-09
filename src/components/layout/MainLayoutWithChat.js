import React from 'react';
import ChatIntegration from '../chat/ChatIntegration';

const MainLayoutWithChat = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your existing layout content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Chat Integration - Fixed position */}
      <div className="fixed bottom-4 right-4 z-50">
        <ChatIntegration />
      </div>
    </div>
  );
};

export default MainLayoutWithChat;