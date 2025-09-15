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
  // Base DaisyUI card classes with AuthCard-style glassmorphism
  const baseClasses = glass
    ? "card glass backdrop-blur-md rounded-xl shadow-xl border border-white/10"
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
    compact && "card-compact",
    hover && "hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02]",
    sizeClasses[size],
  ].filter(Boolean);

  // Custom brand styling with AuthCard-inspired glassmorphism
  const customClasses = [
    variant === "primary" && glass && "bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/5",
    variant === "secondary" && glass && "bg-gradient-to-br from-secondary/20 via-secondary/15 to-secondary/5",
    variant === "success" && glass && "bg-gradient-to-br from-success/15 via-success/10 to-success/5",
    variant === "warning" && glass && "bg-gradient-to-br from-warning/15 via-warning/10 to-warning/5",
    variant === "error" && glass && "bg-gradient-to-br from-error/15 via-error/10 to-error/5",
    variant === "info" && glass && "bg-gradient-to-br from-info/15 via-info/10 to-info/5",
    variant === "default" && glass && "bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/5",
    !glass && variant === "primary" && "border-primary/20 bg-primary/5 shadow-md",
    !glass && variant === "secondary" && "border-secondary/40 bg-secondary/10 shadow-md",
    !glass && variant === "success" && "border-success/20 bg-success/5 shadow-md",
    !glass && variant === "warning" && "border-warning/20 bg-warning/5 shadow-md",
    !glass && variant === "error" && "border-error/20 bg-error/5 shadow-md",
    !glass && variant === "info" && "border-info/20 bg-info/5 shadow-md",
    !glass && variant === "default" && "border-secondary/30 bg-white shadow-md",
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
