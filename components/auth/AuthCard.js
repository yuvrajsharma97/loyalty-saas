export default function AuthCard({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto">
        <div
          className={`glass bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/5 backdrop-blur-md rounded-xl shadow-xl border border-white/10 p-8 sm:p-10 ${className}`}>
          {/* Header */}
          <div className="text-center mb-10">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl mb-6 shadow-lg">
              <span className="text-white font-bold text-xl drop-shadow-md">L</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-sm">
              {title}
            </h1>

            {subtitle && (
              <p className="text-gray-200 text-lg">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            © 2024 LoyaltyOS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
