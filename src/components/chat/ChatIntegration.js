import React from 'react';
import { ChatProvider } from '../../contexts/ChatContext';
import ChatButton from './ChatButton';

const ChatIntegration = () => {
  return (
    <ChatProvider>
      <ChatButton />
    </ChatProvider>
  );
};

export default ChatIntegration;