import React, { Dispatch, SetStateAction } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  leftText: string;
  rightText: string;
  setChecked: Dispatch<SetStateAction<boolean>>;
  className?: string;
  color?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  leftText,
  rightText,
  setChecked,
  className = '',
  color = false,
}) => {
  const innerClassName = color
    ? 'rounded-full bg-white'
    : 'rounded bg-[#211f20]';

  const outerClassName = color
    ? `rounded-full ${checked ? 'bg-red-300' : 'bg-blue-300'}`
    : 'rounded bg-gray-300';

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
          <div className={`h-7 w-12 transition ${outerClassName}`} />
          <div
            className={`dot absolute left-1 top-1 h-5 w-5 transition ${innerClassName} ${
              checked && 'translate-x-full transform'
            }`}
          />
        </div>
      </label>
      <span>{rightText}</span>
    </div>
  );
};

export default ToggleSwitch;
