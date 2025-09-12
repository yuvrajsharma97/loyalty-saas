export default function Badge({
  children,
  variant = "default",
  size = "md",
  outline = false,
  className = "",
}) {
  // Base DaisyUI badge class
  const baseClasses = "badge";

  // Variant mapping with custom theme colors and glassmorphism
  const getVariantClasses = (variant) => {
    switch(variant) {
      case "primary":
        return "glass bg-gradient-to-r from-primary to-primary/80 text-white backdrop-blur-sm shadow-lg border border-white/20";
      case "secondary":
        return "glass bg-gradient-to-r from-secondary via-secondary/90 to-secondary/70 text-primary backdrop-blur-sm shadow-lg border border-primary/20";
      case "success":
        return "glass bg-gradient-to-r from-success/90 to-success/70 text-white backdrop-blur-sm shadow-lg border border-white/20";
      case "warning":
        return "glass bg-gradient-to-r from-warning/90 to-warning/70 text-white backdrop-blur-sm shadow-lg border border-white/20";
      case "error":
        return "glass bg-gradient-to-r from-error/90 to-error/70 text-white backdrop-blur-sm shadow-lg border border-white/20";
      case "info":
        return "glass bg-gradient-to-r from-info/90 to-info/70 text-white backdrop-blur-sm shadow-lg border border-white/20";
      // Custom tier variants with theme colors and glass effect
      case "silver":
        return "glass bg-gradient-to-r from-base-300 via-base-200 to-base-100 text-neutral backdrop-blur-sm shadow-lg border border-neutral/20";
      case "gold":
        return "glass bg-gradient-to-r from-secondary via-secondary/80 to-primary/20 text-primary backdrop-blur-sm shadow-lg border border-primary/30 font-semibold";
      case "platinum":
        return "glass bg-gradient-to-r from-primary via-primary/90 to-primary/70 text-white backdrop-blur-sm shadow-lg border border-white/30 font-semibold";
      default:
        return "glass bg-gradient-to-r from-neutral/80 to-neutral/60 text-neutral-content backdrop-blur-sm shadow-md border border-white/10";
    }
  };

  // Size mapping
  const sizeMap = {
    xs: "badge-xs",
    sm: "badge-sm",
    md: "", // default
    lg: "badge-lg",
    xl: "badge-lg", // DaisyUI doesn't have xl
  };

  const daisyClasses = [
    baseClasses,
    getVariantClasses(variant),
    sizeMap[size],
    outline && "badge-outline",
  ].filter(Boolean);

  const allClasses = [...daisyClasses, className].join(" ");

  return <span className={allClasses}>{children}</span>;
}
