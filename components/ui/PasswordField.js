"use client";
import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import Label from "./Label";
import Input from "./Input";

const PasswordField = forwardRef(
  (
  {
    id,
    label,
    placeholder = "Enter your password",
    value,
    onChange,
    error,
    required = false,
    showHint = false,
    className = "",
    ...props
  },
  ref) =>
  {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={className}>
        {label &&
        <Label htmlFor={id} required={required}>
            {label}
          </Label>
        }
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            error={error}
            className="pr-12"
            {...props} />
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="z-10 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ?
            <EyeOff className="w-5 h-5" /> :

            <Eye className="w-5 h-5" />
            }
          </button>
        </div>
        {showHint && !error &&
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use at least 8 characters with a mix of letters, numbers, and
            symbols.
          </p>
        }
      </div>);

  }
);

PasswordField.displayName = "PasswordField";

export default PasswordField;