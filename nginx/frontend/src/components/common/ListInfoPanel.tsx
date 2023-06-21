import React from 'react';

interface ListInfoPanelProps {
  children: React.ReactNode;
  notification?: number;
}

const ListInfoPanel: React.FC<ListInfoPanelProps> = ({
  children,
  notification = 0,
}) => {
  return (
    <div className="flex items-center">
      {notification > 0 && (
        <div className="mr-3 rounded-full bg-red-500 px-1 py-0.5 text-xs text-white">
          {notification}
        </div>
      )}
      {children}
    </div>
  );
};

export default ListInfoPanel;
