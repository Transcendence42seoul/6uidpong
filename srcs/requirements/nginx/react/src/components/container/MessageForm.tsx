import React, { FormEvent } from 'react';

interface MessageFormProps {
  children: React.ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ children, onSubmit }) => (
  <form className="mt-6 flex" onSubmit={onSubmit}>
    {React.Children.map(children, (child) =>
      React.isValidElement(child) && child.type === 'input' ? (
        <input {...child.props} className="mr-4 flex-grow" />
      ) : (
        child
      ),
    )}
  </form>
);

export default MessageForm;
