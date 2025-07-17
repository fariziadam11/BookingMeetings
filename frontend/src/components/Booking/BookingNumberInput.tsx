import React from 'react';

interface BookingNumberInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  min?: number;
  extraNote?: string;
}

const BookingNumberInput: React.FC<BookingNumberInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  min,
  extraNote,
}) => (
  <div className="mb-3 sm:mb-4">
    <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
    <input
      id={id}
      className={`block w-full p-2 border rounded ${error ? 'border-red-500' : ''}`}
      type="number"
      placeholder={placeholder || label}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
    />
    {extraNote && <span className="text-xs text-gray-400">{extraNote}</span>}
    {error && <span className="block text-xs text-red-500">{error}</span>}
  </div>
);

export default BookingNumberInput; 