import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[#014421] dark:hover:text-[#D0D8C3] transition-colors">
              {item.name}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.name}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
