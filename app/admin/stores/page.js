"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Download, Plus, Eye, Settings, AlertTriangle } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import TableToolbar from "@/components/admin/TableToolbar";
import Pagination from "@/components/admin/Pagination";
import Button from "@/components/admin/Button";
import Select from "@/components/admin/Select";
import Badge from "@/components/admin/Badge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Banner from "@/components/admin/Banner";

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "",
    storeId: "",
  });
  const [successBanner, setSuccessBanner] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchStores();
  }, [currentPage, tierFilter, statusFilter, searchQuery]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (tierFilter) params.append('tier', tierFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/stores?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      setStores(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Use server-side pagination, so we don't need client-side filtering
  const totalPages = Math.ceil(stores.length / itemsPerPage); // This should come from API response
  const paginatedStores = stores; // Already paginated from server

  const handleSort = (column, direction) => {
    setSortBy(column);
    setSortDirection(direction);
  };

  const handleConfirmAction = async () => {
    const { type, storeId } = confirmDialog;
    const store = stores.find((s) => s._id === storeId);

    try {
      if (type === "suspend") {
        const newStatus = store?.isActive ? "suspended" : "active";

        const response = await fetch(`/api/admin/stores/${storeId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            reason: `Admin action: ${newStatus} store`,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update store status');
        }

        // Refresh stores data
        await fetchStores();
        setSuccessBanner(
          `Store ${store?.name} has been ${newStatus}.`
        );
      } else if (type === "override") {
        setSuccessBanner(
          `Reward configuration overridden for ${store?.name}.`
        );
      }
    } catch (err) {
      console.error('Error performing store action:', err);
      setError(err.message);
    }

    setConfirmDialog({ isOpen: false, type: "", storeId: "" });
  };

  const exportCSV = () => {
    const headers = ["Store,Owner,Tier,Users,Created,Status"];
    const rows = paginatedStores.map(
      (store) =>
        `${store.name},${store.ownerId?.email || "No owner"},${store.tier},${store.userCount || 0},${new Date(store.createdAt).toLocaleDateString()},${store.isActive ? "Active" : "Suspended"}`
    );
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stores.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const storeColumns = [
    {
      key: "name",
      label: "Store",
      sortable: true,
      render: (name, store) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {store.ownerId?.email || "No owner"}
          </div>
        </div>
      ),
    },
    {
      key: "tier",
      label: "Tier",
      sortable: true,
      render: (tier) => (
        <Badge variant={tier}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </Badge>
      ),
    },
    {
      key: "userCount",
      label: "Users",
      sortable: true,
      render: (userCount) => userCount || 0
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (createdAt) => new Date(createdAt).toLocaleDateString()
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (isActive) => (
        <Badge variant={isActive ? "success" : "danger"}>
          {isActive ? "Active" : "Suspended"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, store) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/store/${store._id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                type: "override",
                storeId: store._id,
              })
            }>
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                type: "suspend",
                storeId: store._id,
              })
            }>
            <AlertTriangle className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filters = [
    <Select
      key="tier"
      placeholder="All Tiers"
      value={tierFilter}
      onChange={(e) => setTierFilter(e.target.value)}>
      <option value="silver">Silver</option>
      <option value="gold">Gold</option>
      <option value="platinum">Platinum</option>
    </Select>,
    <Select
      key="status"
      placeholder="All Statuses"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}>
      <option value="active">Active</option>
      <option value="suspended">Suspended</option>
    </Select>,
  ];

  const actions = [
    <Button key="export" variant="secondary" onClick={exportCSV}>
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>,
    <Link key="create" href="/admin/store-owner/create">
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Create Store
      </Button>
    </Link>,
  ];

  return (
    <div className="space-y-6">
      {successBanner && (
        <Banner
          type="success"
          message={successBanner}
          onDismiss={() => setSuccessBanner("")}
        />
      )}

      {error && (
        <Banner
          type="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Stores
        </h1>

        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          filters={filters}
          actions={actions}
        />

        {loading ? (
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md animate-pulse">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <DataTable
              columns={storeColumns}
              data={paginatedStores}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
            />

            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, type: "", storeId: "" })
        }
        onConfirm={handleConfirmAction}
        title={
          confirmDialog.type === "suspend"
            ? "Confirm Action"
            : "Override Reward Configuration"
        }
        message={
          confirmDialog.type === "suspend"
            ? "Are you sure you want to change this store's status?"
            : "Are you sure you want to override the reward configuration for this store?"
        }
        confirmLabel={
          confirmDialog.type === "suspend" ? "Change Status" : "Override"
        }
        variant={confirmDialog.type === "suspend" ? "danger" : "primary"}
      />
    </div>
  );
}
