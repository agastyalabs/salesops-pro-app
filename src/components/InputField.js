import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = React.forwardRef(({ 
    icon: Icon, 
    label, 
    id, 
    type = "text", 
    value, 
    onChange, 
    name, 
    placeholder, 
    required = false, 
    children, // For additional elements like suggestions
    step, 
    min,
    inputClassName = "", // Allow passing custom classes to input
    labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
    containerClassName = "mb-4"
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className={containerClassName}>
            {label && (
                <label htmlFor={id} className={labelClassName}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                        <Icon size={18} />
                    </span>
                )}
                <input
                    id={id}
                    ref={ref}
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    value={value}
                    onChange={onChange}
                    name={name}
                    placeholder={placeholder}
                    required={required}
                    step={step}
                    min={min}
                    className={`w-full p-2.5 ${Icon ? 'pl-10' : 'pl-3'} ${isPassword ? 'pr-10' : ''} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${inputClassName}`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {children && <div className="mt-1 text-xs">{children}</div>} 
        </div>
    );
});

export default InputField;
