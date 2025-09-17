import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.slice(
    Math.max(0, currentPage - 3),
    Math.min(totalPages, currentPage + 2)
  );

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {showPages[0] > 1 && (
          <>
            <Button variant="ghost" size="sm" onClick={() => onPageChange(1)}>
              1
            </Button>
            {showPages[0] > 2 && (
              <span className="px-2 text-[#6B7280]">...</span>
            )}
          </>
        )}

        {showPages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "primary" : "ghost"}
            size="sm"
            onClick={() => onPageChange(page)}>
            {page}
          </Button>
        ))}

        {showPages[showPages.length - 1] < totalPages && (
          <>
            {showPages[showPages.length - 1] < totalPages - 1 && (
              <span className="px-2 text-[#6B7280]">...</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}>
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <p className="text-sm text-[#6B7280] dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
}
