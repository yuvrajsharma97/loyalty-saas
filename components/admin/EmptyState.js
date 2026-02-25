export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = ""
}) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {Icon &&
      <Icon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
      }
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description &&
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      }
      {action}
    </div>);

}