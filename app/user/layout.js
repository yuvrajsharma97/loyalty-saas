"use client";
import { useState, createContext, useContext, useEffect } from "react";
import SidebarUser from "@/components/user/SidebarUser";
import TopbarUser from "@/components/user/TopbarUser";
import StoreSwitcher from "@/components/user/StoreSwitcher";

// Create context for store selection
const UserStoreContext = createContext();

export const useUserStore = () => {
  const context = useContext(UserStoreContext);
  if (!context) {
    throw new Error("useUserStore must be used within UserStoreProvider");
  }
  return context;
};

export default function UserLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState(""); // Empty = all stores
  const [connectedStores, setConnectedStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch connected stores from API
  const fetchConnectedStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/stores');

      if (!response.ok) {
        throw new Error('Failed to fetch connected stores');
      }

      const data = await response.json();
      setConnectedStores(data.stores || []);
    } catch (error) {
      console.error('Error fetching connected stores:', error);
      setConnectedStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectedStores();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getCurrentStoreData = () => {
    return connectedStores.find((store) => store.id === currentStore) || null;
  };

  const refreshStores = () => {
    fetchConnectedStores();
  };

  const contextValue = {
    currentStore,
    setCurrentStore,
    connectedStores,
    getCurrentStoreData,
    loading,
    refreshStores,
  };

  return (
    <UserStoreContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex h-screen">
          {/* Sidebar */}
          <SidebarUser isOpen={sidebarOpen} onToggle={toggleSidebar} />

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
            <TopbarUser onMenuToggle={toggleSidebar} />

            <main className="flex-1 overflow-y-auto p-6">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </UserStoreContext.Provider>
  );
}
