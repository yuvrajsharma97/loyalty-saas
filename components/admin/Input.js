import { forwardRef } from "react";

const Input = forwardRef(
  (
  {
    id,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    disabled = false,
    className = "",
    ...props
  },
  ref) =>
  {
    const baseStyles =
    "w-full h-10 px-3 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] disabled:opacity-50 disabled:cursor-not-allowed";

    const stateStyles = error ?
    "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-500/50" :
    "border-[#D0D8C3]/40 bg-white dark:bg-zinc-800 dark:border-zinc-600 hover:border-[#D0D8C3] dark:hover:border-[#D0D8C3]/60";

    const dateStyles =
    type === "date" ?
    "input input-bordered h-10 px-3 text-sm border-[#D0D8C3] bg-white text-[#014421] focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20" :
    "";

    return (
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${baseStyles} ${stateStyles} ${dateStyles} ${className}`}
        {...props} />);


  }
);

Input.displayName = "Input";

export default Input;