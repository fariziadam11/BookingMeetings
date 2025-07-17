import React from 'react';

interface BookingDateTimeInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  min?: string;
}

const BookingDateTimeInput: React.FC<BookingDateTimeInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  min,
}) => (
  <div className="flex-1 min-w-0">
    <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
    <input
      id={id}
      className={`block w-full p-2 border rounded ${error ? 'border-red-500' : ''}`}
      type="datetime-local"
      placeholder={placeholder || label}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

export default BookingDateTimeInput; 