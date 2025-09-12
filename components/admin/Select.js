export default function Select({
  id,
  value,
  onChange,
  children,
  placeholder,
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "w-full px-3 py-2 rounded-lg border border-[#D0D8C3]/40 bg-white dark:bg-zinc-800 dark:border-zinc-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${baseStyles} ${className}`}
      {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}
