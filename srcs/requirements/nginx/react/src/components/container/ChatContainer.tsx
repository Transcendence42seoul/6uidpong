import React from 'react';

interface ChatContainerProps {
  children: React.ReactNode;
}

const ChatContainer = React.forwardRef<HTMLDivElement, ChatContainerProps>(
  ({ children }, ref) => (
    <div
      ref={ref}
      className="flex max-h-[80vh] min-h-[60vh] flex-col overflow-auto border-4 border-white bg-black p-4"
    >
      {children}
    </div>
  ),
);

ChatContainer.displayName = 'ChatContainer';

export default ChatContainer;
