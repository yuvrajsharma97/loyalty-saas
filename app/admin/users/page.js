"use client";
import { useState, useMemo } from "react";
import { Download, UserCheck, AlertTriangle } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import TableToolbar from "@/components/admin/TableToolbar";
import Pagination from "@/components/admin/Pagination";
import Button from "@/components/admin/Button";
import Select from "@/components/admin/Select";
import Badge from "@/components/admin/Badge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Banner from "@/components/admin/Banner";

// Mock data for development
const MOCK_USERS = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "User",
    storesCount: 2,
    createdAt: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "StoreAdmin",
    storesCount: 1,
    createdAt: "2024-01-20",
    status: "active",
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@example.com",
    role: "SuperAdmin",
    storesCount: 0,
    createdAt: "2024-01-10",
    status: "active",
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "",
    userId: "",
  });
  const [successBanner, setSuccessBanner] = useState("");

  const itemsPerPage = 10;

  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = !roleFilter || user.role === roleFilter;

      return matchesSearch && matchesRole;
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
  }, [users, searchQuery, roleFilter, sortBy, sortDirection]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column, direction) => {
    setSortBy(column);
    setSortDirection(direction);
  };

  const handleConfirmAction = () => {
    const { type, userId } = confirmDialog;
    const user = users.find((u) => u.id === userId);

    if (type === "suspend") {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: user.status === "active" ? "suspended" : "active",
              }
            : user
        )
      );
      setSuccessBanner(
        `User ${user?.name} has been ${
          user?.status === "active" ? "suspended" : "activated"
        }.`
      );
    } else if (type === "impersonate") {
      setSuccessBanner(`Now impersonating ${user?.name} (UI-only simulation).`);
    }

    setConfirmDialog({ isOpen: false, type: "", userId: "" });
  };

  const exportCSV = () => {
    const headers = ["Name,Email,Role,Connected Stores,Created,Status"];
    const rows = filteredUsers.map(
      (user) =>
        `${user.name},${user.email},${user.role},${user.storesCount},${user.createdAt},${user.status}`
    );
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const userColumns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (name, user) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (role) => (
        <Badge
          variant={
            role === "admin"
              ? "primary"
              : role === "store-owner"
              ? "warning"
              : "default"
          }>
          {role
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Badge>
      ),
    },
    { key: "storesCount", label: "Connected Stores", sortable: true },
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
      render: (_, user) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                type: "impersonate",
                userId: user.id,
              })
            }>
            <UserCheck className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                type: "suspend",
                userId: user.id,
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
      key="role"
      placeholder="All Roles"
      value={roleFilter}
      onChange={(e) => setRoleFilter(e.target.value)}>
      <option value="">Select your role</option>
      <option value="SuperAdmin">Super Admin</option>
      <option value="StoreAdmin">Store Admin</option>
      <option value="User">User</option>
    </Select>,
  ];

  const actions = [
    <Button key="export" variant="secondary" onClick={exportCSV}>
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>,
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
          Users
        </h1>

        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          filters={filters}
          actions={actions}
        />

        <DataTable
          columns={userColumns}
          data={paginatedUsers}
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
          setConfirmDialog({ isOpen: false, type: "", userId: "" })
        }
        onConfirm={handleConfirmAction}
        title={
          confirmDialog.type === "suspend"
            ? "Confirm Action"
            : "Impersonate User"
        }
        message={
          confirmDialog.type === "suspend"
            ? "Are you sure you want to change this user's status?"
            : "Are you sure you want to impersonate this user? This is a UI-only simulation."
        }
        confirmLabel={
          confirmDialog.type === "suspend" ? "Change Status" : "Impersonate"
        }
        variant={confirmDialog.type === "suspend" ? "danger" : "primary"}
      />
    </div>
  );
}
