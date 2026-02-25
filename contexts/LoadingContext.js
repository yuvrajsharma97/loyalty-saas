"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Loader from "@/components/ui/Loader";

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useSession();


  useEffect(() => {

    if (
    pathname.includes("/auth/login") ||
    pathname.includes("/auth/register") ||
    pathname === "/")
    {
      return;
    }

    setIsLoading(true);


    if (pathname.includes('/dashboard')) {
      setLoadingMessage("Loading dashboard...");
    } else {
      setLoadingMessage("Loading...");
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);


  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      setLoadingMessage("Checking authentication...");
    } else {

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const showLoading = (message = "Loading...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        showLoading,
        hideLoading,
        setLoadingMessage
      }}>
      
      {children}

      {}
      {isLoading &&
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-lg border" style={{ borderColor: 'var(--brand-secondary)' }}>
            <Loader />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {loadingMessage}
            </p>
          </div>
        </div>
      }
    </LoadingContext.Provider>);

}