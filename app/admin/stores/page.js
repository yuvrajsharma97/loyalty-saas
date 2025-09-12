"use client";
import { useState, useMemo } from "react";
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

const MOCK_STORES = [
  {
    id: "1",
    name: "Bloom Coffee Co.",
    ownerEmail: "sarah@bloomcoffee.com",
    tier: "gold",
    usersCount: 245,
    createdAt: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "The Grooming Lounge",
    ownerEmail: "marcus@groominglounge.com",
    tier: "platinum",
    usersCount: 156,
    createdAt: "2024-02-03",
    status: "active",
  },
  {
    id: "3",
    name: "Fresh Bakes Bakery",
    ownerEmail: "emma@freshbakes.co.uk",
    tier: "silver",
    usersCount: 89,
    createdAt: "2024-02-20",
    status: "active",
  },
  {
    id: "4",
    name: "City Barbers",
    ownerEmail: "james@citybarbers.com",
    tier: "gold",
    usersCount: 203,
    createdAt: "2024-01-28",
    status: "suspended",
  },
  {
    id: "5",
    name: "Green Leaf Café",
    ownerEmail: "lisa@greenleaf.com",
    tier: "silver",
    usersCount: 67,
    createdAt: "2024-03-01",
    status: "active",
  },
];

export default function AdminStores() {
  const [stores, setStores] = useState(MOCK_STORES);
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

  // Filter and sort data
  const filteredStores = useMemo(() => {
    let filtered = stores.filter((store) => {
      const matchesSearch =
        !searchQuery ||
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = !tierFilter || store.tier === tierFilter;
      const matchesStatus = !statusFilter || store.status === statusFilter;

      return matchesSearch && matchesTier && matchesStatus;
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (sortDirection === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [stores, searchQuery, tierFilter, statusFilter, sortBy, sortDirection]);

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column, direction) => {
    setSortBy(column);
    setSortDirection(direction);
  };

  const handleConfirmAction = () => {
    const { type, storeId } = confirmDialog;

    if (type === "suspend") {
      setStores((prev) =>
        prev.map((store) =>
          store.id === storeId
            ? {
                ...store,
                status: store.status === "active" ? "suspended" : "active",
              }
            : store
        )
      );
      setSuccessBanner(
        `Store ${stores.find((s) => s.id === storeId)?.name} has been ${
          stores.find((s) => s.id === storeId)?.status === "active"
            ? "suspended"
            : "activated"
        }.`
      );
    } else if (type === "override") {
      setSuccessBanner(
        `Reward configuration overridden for ${
          stores.find((s) => s.id === storeId)?.name
        }.`
      );
    }

    setConfirmDialog({ isOpen: false, type: "", storeId: "" });
  };

  const exportCSV = () => {
    const headers = ["Store,Owner,Tier,Users,Created,Status"];
    const rows = filteredStores.map(
      (store) =>
        `${store.name},${store.ownerEmail},${store.tier},${store.usersCount},${store.createdAt},${store.status}`
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
            {store.ownerEmail}
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
    { key: "usersCount", label: "Users", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (status) => (
        <Badge variant={status === "active" ? "success" : "danger"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, store) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/store/${store.id}`}>
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
                storeId: store.id,
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
                storeId: store.id,
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
