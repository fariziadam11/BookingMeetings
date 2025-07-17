import React from 'react';

interface BookingTextInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const BookingTextInput: React.FC<BookingTextInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  autoFocus,
  inputRef,
  type = 'text',
  disabled,
  readOnly,
}) => (
  <div className="mb-3 sm:mb-4">
    <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
    <input
      id={id}
      ref={inputRef}
      className={`block w-full p-2 border rounded ${error ? 'border-red-500' : ''} ${disabled ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : ''}`}
      type={type}
      placeholder={placeholder || label}
      value={value}
      onChange={onChange}
      required={required}
      autoFocus={autoFocus}
      disabled={disabled}
      readOnly={readOnly}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

export default BookingTextInput; 