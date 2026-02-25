export default function Avatar({ name, size = "md", className = "" }) {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg"
  };

  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={`bg-[#014421]/70 border border-[#D0D8C3] rounded-full flex items-center justify-center text-white font-bold ${sizes[size]} ${className}`}>
      {initial}
    </div>);

}