import React from 'react';

interface VintageInputProps {
  id: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number';
  label: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  className?: string;
  icon?: string;
}

export const VintageInput: React.FC<VintageInputProps> = React.memo(({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  required = false,
  autoComplete,
  defaultValue,
  className = '',
  icon
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id} 
        className="block font-pokemon text-xs text-pokemon-blue-dark mb-2 uppercase tracking-wide"
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {required && <span className="text-pokemon-red ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="
            w-full px-4 py-3 
            font-pokemon text-xs 
            bg-pokemon-cream 
            border-2 border-pokemon-blue-dark 
            rounded 
            focus:outline-none 
            focus:border-pokemon-yellow 
            focus:bg-white
            transition-all duration-200
            placeholder-pokemon-blue
            uppercase
          "
          style={{
            boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)',
          }}
        />
        {/* Effet Game Boy - bordure interne */}
        <div className="absolute inset-0 pointer-events-none rounded border border-pokemon-blue opacity-30" />
      </div>
    </div>
  );
});

VintageInput.displayName = 'VintageInput';

