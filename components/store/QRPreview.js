export default function QRPreview({ slug, size = "md", className = "" }) {
  const sizes = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  };

  return (
    <div className={`inline-flex flex-col items-center space-y-2 ${className}`}>
      <div
        className={`${sizes[size]} bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center relative overflow-hidden`}>
        {/* QR Code Pattern Simulation */}
        <div className="absolute inset-2 grid grid-cols-8 gap-px">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-sm ${
                (i + (slug ? slug.charCodeAt(0) : 42)) % 3 === 0 ? "bg-black" : "bg-transparent"
              }`}
            />
          ))}
        </div>

        {/* Corner markers */}
        <div className="absolute top-1 left-1 w-3 h-3 border-2 border-black rounded-sm"></div>
        <div className="absolute top-1 right-1 w-3 h-3 border-2 border-black rounded-sm"></div>
        <div className="absolute bottom-1 left-1 w-3 h-3 border-2 border-black rounded-sm"></div>
      </div>

      {slug && (
        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {slug}
        </p>
      )}
    </div>
  );
}
