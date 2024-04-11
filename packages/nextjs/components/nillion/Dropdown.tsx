import React, { useState } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  onDropdownUpdate: (value: string) => void;
  disabled?: boolean;
  itemName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onDropdownUpdate, itemName, disabled = false }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);
    onDropdownUpdate(selectedValue);
  };

  return (
    <select value={selectedOption || ""} onChange={e => handleSelect(e)} disabled={disabled}>
      <option value="">Select {itemName} name</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
