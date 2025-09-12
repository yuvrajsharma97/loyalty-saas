"use client";
import { useState, createContext, useContext } from "react";
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

    const MOCK_CONNECTED_STORES = [
      {
        id: "bloom-coffee",
        name: "Bloom Coffee Co.",
        slug: "bloom-coffee",
        tier: "gold",
        points: 245,
        visitsMTD: 8,
        visitsLifetime: 47,
        joinedAt: "2024-01-20",
        conversionRate: 100,
        rewardConfig: {
          type: "hybrid",
          pointsPerPound: 2,
          pointsPerVisit: 10,
          conversionRate: 100,
        },
      },
      {
        id: "grooming-lounge",
        name: "The Grooming Lounge",
        slug: "grooming-lounge",
        tier: "platinum",
        points: 156,
        visitsMTD: 3,
        visitsLifetime: 18,
        joinedAt: "2024-02-15",
        conversionRate: 100,
        rewardConfig: {
          type: "spend",
          pointsPerPound: 3,
          pointsPerVisit: 0,
          conversionRate: 150,
        },
      },
      {
        id: "fresh-bakes",
        name: "Fresh Bakes Bakery",
        slug: "fresh-bakes",
        tier: "silver",
        points: 89,
        visitsMTD: 5,
        visitsLifetime: 12,
        joinedAt: "2024-03-01",
        conversionRate: 100,
        rewardConfig: {
          type: "visit",
          pointsPerPound: 0,
          pointsPerVisit: 15,
          conversionRate: 100,
        },
      },
    ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState(""); // Empty = all stores
  const [connectedStores] = useState(MOCK_CONNECTED_STORES);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getCurrentStoreData = () => {
    return connectedStores.find((store) => store.id === currentStore) || null;
  };

  const contextValue = {
    currentStore,
    setCurrentStore,
    connectedStores,
    getCurrentStoreData,
  };

  return (
    <UserStoreContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
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
