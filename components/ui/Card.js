export default function Card({
  children,
  variant = "default",
  size = "md",
  bordered = true,
  compact = false,
  glass = true,
  hover = true,
  className = "",
  title,
  actions,
  ...props
}) {
  // Base DaisyUI card classes with glassmorphism
  const baseClasses = glass 
    ? "card glass backdrop-blur-md" 
    : "card bg-base-100";

  // Size mapping
  const sizeClasses = {
    xs: "card-compact",
    sm: "card-compact",
    md: "",
    lg: "p-8",
    xl: "p-10",
  };

  // Build DaisyUI classes
  const daisyClasses = [
    baseClasses,
    bordered && "border border-white/20 dark:border-gray-700/30",
    compact && "card-compact",
    hover && "hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 hover:scale-105",
    sizeClasses[size],
  ].filter(Boolean);

  // Custom brand styling with glassmorphism
  const customClasses = [
    glass && "shadow-lg shadow-primary/5",
    variant === "primary" && glass && "bg-gradient-to-br from-primary/20 via-primary/10 to-base-100/40",
    variant === "secondary" && glass && "bg-gradient-to-br from-secondary/30 via-secondary/15 to-base-100/40",
    variant === "success" && glass && "bg-gradient-to-br from-success/20 via-success/10 to-base-100/40",
    variant === "warning" && glass && "bg-gradient-to-br from-warning/20 via-warning/10 to-base-100/40",
    variant === "error" && glass && "bg-gradient-to-br from-error/20 via-error/10 to-base-100/40",
    variant === "default" && glass && "bg-gradient-to-br from-primary/10 via-secondary/5 to-base-100/40",
    !glass && variant === "primary" && "border-primary/20 bg-primary/5",
    !glass && variant === "secondary" && "border-secondary/40 bg-secondary/10",
    !glass && variant === "success" && "border-success/20 bg-success/5",
    !glass && variant === "warning" && "border-warning/20 bg-warning/5",
    !glass && variant === "error" && "border-error/20 bg-error/5",
    !glass && variant === "default" && "border-secondary/30 shadow-md",
  ].filter(Boolean);

  const allClasses = [...daisyClasses, ...customClasses, className].join(" ");

  return (
    <div className={allClasses} {...props}>
      <div className="card-body">
        {title && <h2 className="card-title">{title}</h2>}
        {children}
        {actions && <div className="card-actions justify-end">{actions}</div>}
      </div>
    </div>
  );
}
