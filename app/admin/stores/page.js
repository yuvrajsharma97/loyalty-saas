"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Download, Plus, Eye, Settings, AlertTriangle } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import TableToolbar from "@/components/admin/TableToolbar";
import Pagination from "@/components/admin/Pagination";
import Button from "@/components/admin/Button";
import Select from "@/components/admin/Select";
import Input from "@/components/admin/Input";
import Badge from "@/components/admin/Badge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import Banner from "@/components/admin/Banner";

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationMeta, setPaginationMeta] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "",
    storeId: ""
  });
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardStoreId, setRewardStoreId] = useState("");
  const [rewardConfig, setRewardConfig] = useState({
    type: "hybrid",
    pointsPerPound: "0",
    pointsPerVisit: "0",
    conversionRate: "100"
  });
  const [savingRewardConfig, setSavingRewardConfig] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  const itemsPerPage = 10;

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (tierFilter) params.append('tier', tierFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/stores?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      const normalizedStores = (data.data || []).map((store) => ({
        ...store,
        id: store._id || store.id
      }));

      setStores(normalizedStores);
      setPaginationMeta(data.meta || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, tierFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);


  const totalPages = paginationMeta.totalPages || 1;
  const paginatedStores = stores;

  const handleSort = (column, direction) => {
    setSortBy(column);
    setSortDirection(direction);
  };

  const handleConfirmAction = async () => {
    const { type, storeId } = confirmDialog;
    const store = stores.find((s) => s.id === storeId);

    try {
      if (type === "suspend") {
        const newStatus = store?.isActive ? "suspended" : "active";

        const response = await fetch(`/api/admin/stores/${storeId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: newStatus,
            reason: `Admin action: ${newStatus} store`
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update store status');
        }


        await fetchStores();
        setSuccessBanner(
          `Store ${store?.name} has been ${newStatus}.`
        );
      }
    } catch (err) {
      console.error('Error performing store action:', err);
      setError(err.message);
    }

    setConfirmDialog({ isOpen: false, type: "", storeId: "" });
  };

  const openRewardModal = (store) => {
    const config = store?.rewardConfig || {};

    setRewardStoreId(store.id);
    setRewardConfig({
      type: config.type || "hybrid",
      pointsPerPound: String(config.pointsPerPound ?? 0),
      pointsPerVisit: String(config.pointsPerVisit ?? 0),
      conversionRate: String(config.conversionRate ?? 100)
    });
    setShowRewardModal(true);
  };

  const handleRewardConfigSave = async () => {
    if (!rewardStoreId) return;

    try {
      setSavingRewardConfig(true);
      const payload = {
        type: rewardConfig.type,
        pointsPerPound: Number(rewardConfig.pointsPerPound),
        pointsPerVisit: Number(rewardConfig.pointsPerVisit),
        conversionRate: Number(rewardConfig.conversionRate)
      };

      const response = await fetch(
        `/api/admin/stores/${rewardStoreId}/reward-config`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to override reward configuration");
      }

      await fetchStores();
      const selectedStore = stores.find((s) => s.id === rewardStoreId);
      setSuccessBanner(
        `Reward configuration updated for ${selectedStore?.name || "store"}.`
      );
      setShowRewardModal(false);
      setRewardStoreId("");
    } catch (err) {
      console.error("Error updating reward config:", err);
      setError(err.message);
    } finally {
      setSavingRewardConfig(false);
    }
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
    render: (name, store) =>
    <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {store.ownerId?.email || "No owner"}
          </div>
        </div>

  },
  {
    key: "tier",
    label: "Tier",
    sortable: true,
    render: (tier) =>
    <Badge variant={tier}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </Badge>

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
    render: (isActive) =>
    <Badge variant={isActive ? "success" : "danger"}>
          {isActive ? "Active" : "Suspended"}
        </Badge>

  },
  {
    key: "actions",
    label: "Actions",
    render: (_, store) =>
    <div className="flex items-center gap-2">
          <Link href={`/admin/store/${store.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Button
        variant="ghost"
        size="sm"
        onClick={() => openRewardModal(store)}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button
        variant="ghost"
        size="sm"
        onClick={() =>
        setConfirmDialog({
          isOpen: true,
          type: "suspend",
          storeId: store.id
        })
        }>
            <AlertTriangle className="w-4 h-4" />
          </Button>
        </div>

  }];


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
    </Select>];


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
    </Link>];


  return (
    <div className="space-y-6">
      {successBanner &&
      <Banner
        type="success"
        message={successBanner}
        onDismiss={() => setSuccessBanner("")} />

      }

      {error &&
      <Banner
        type="error"
        message={error}
        onDismiss={() => setError(null)} />

      }

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Stores
        </h1>

        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          filters={filters}
          actions={actions} />
        

        {loading ?
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md animate-pulse">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) =>
            <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                </div>
            )}
            </div>
          </div> :

        <>
            <DataTable
            columns={storeColumns}
            data={paginatedStores}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort} />
          

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, paginationMeta.total || 0)} of {paginationMeta.total || 0} stores
                </div>
                <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage} />
              
              </div>
            </div>
          </>
        }
      </div>

      {}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
        setConfirmDialog({ isOpen: false, type: "", storeId: "" })
        }
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message="Are you sure you want to change this store's status?"
        confirmLabel="Change Status"
        variant="danger" />


      <Modal
        isOpen={showRewardModal}
        onClose={() => {
          setShowRewardModal(false);
          setRewardStoreId("");
        }}
        title="Override Reward Configuration"
        size="lg"
        actions={
        <>
            <Button
            variant="ghost"
            onClick={() => {
              setShowRewardModal(false);
              setRewardStoreId("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleRewardConfigSave} disabled={savingRewardConfig}>
              {savingRewardConfig ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reward Type
            </label>
            <Select
              value={rewardConfig.type}
              onChange={(e) =>
              setRewardConfig((prev) => ({ ...prev, type: e.target.value }))
              }>
              <option value="spend">Spend-based</option>
              <option value="visit">Visit-based</option>
              <option value="hybrid">Hybrid</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Points per GBP
            </label>
            <Input
              type="number"
              min="0"
              value={rewardConfig.pointsPerPound}
              onChange={(e) =>
              setRewardConfig((prev) => ({
                ...prev,
                pointsPerPound: e.target.value
              }))
              } />

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Points per Visit
            </label>
            <Input
              type="number"
              min="0"
              value={rewardConfig.pointsPerVisit}
              onChange={(e) =>
              setRewardConfig((prev) => ({
                ...prev,
                pointsPerVisit: e.target.value
              }))
              } />

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conversion Rate (points per GBP 1)
            </label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={rewardConfig.conversionRate}
              onChange={(e) =>
              setRewardConfig((prev) => ({
                ...prev,
                conversionRate: e.target.value
              }))
              } />

          </div>
        </div>
      </Modal>
    </div>);

}