import React from "react";

interface InputFieldProps {
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
}
export default function InputField({ type, placeholder, value, onChange, maxLength }: InputFieldProps) {
  const isRequired = placeholder !== "5 dígitos";
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-0 focus:border-black-300 placeholder-black" 
      {...(isRequired ? { required: true } : {})}
    />
  );
}
