import React from 'react';

interface ChatContainerProps {
  children: React.ReactNode;
}

const ChatContainer = React.forwardRef<HTMLDivElement, ChatContainerProps>(
  ({ children }, ref) => (
    <div
      ref={ref}
      className="flex max-h-[600px] min-h-[360px] flex-col overflow-auto border border-black bg-[#b2c7d9] p-4"
    >
      {children}
    </div>
  ),
);

ChatContainer.displayName = 'ChatContainer';

export default ChatContainer;
