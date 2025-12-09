import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import ChatTest from '../components/chat/ChatTest';

const ChatTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Chat Feature Test</h1>
        <ChatProvider>
          <ChatTest />
        </ChatProvider>
      </div>
    </div>
  );
};

export default ChatTestPage;