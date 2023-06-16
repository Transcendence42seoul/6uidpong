import React, { Dispatch, SetStateAction } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  leftText: string;
  rightText: string;
  setChecked: Dispatch<SetStateAction<boolean>>;
  className?: string;
  children?: React.ReactNode;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  leftText,
  rightText,
  setChecked,
  className = '',
  children = null,
}) => {
  const handleToggleChange = () => {
    setChecked((prevState: boolean) => !prevState);
  };

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <span>{leftText}</span>
      <label htmlFor="toggle" className="flex cursor-pointer items-center">
        <div className="relative">
          <input
            type="checkbox"
            id="toggle"
            className="sr-only"
            checked={checked}
            onChange={handleToggleChange}
          />
          {children ?? (
            <div>
              <div
                className={`h-7 w-12 rounded-full transition ${
                  checked ? 'bg-red-300' : 'bg-blue-300'
                }`}
              />
              <div
                className={`dot absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition ${
                  checked && 'translate-x-full transform'
                }`}
              />
            </div>
          )}
        </div>
      </label>
      <span>{rightText}</span>
    </div>
  );
};

export default ToggleSwitch;
