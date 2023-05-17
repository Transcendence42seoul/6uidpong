import React, { FormEvent } from 'react';

interface MessageFormProps {
  children: React.ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ children, onSubmit }) => (
  <form className="flex border-4 border-t-0 border-white" onSubmit={onSubmit}>
    {React.Children.map(children, (child) =>
      React.isValidElement(child) && child.type === 'input' ? (
        <input {...child.props} className="flex-grow" />
      ) : (
        child
      ),
    )}
  </form>
);

export default MessageForm;
