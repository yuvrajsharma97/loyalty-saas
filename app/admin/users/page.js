"use client";
import { useState, useMemo, useEffect } from "react";
import { Download, AlertTriangle } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import TableToolbar from "@/components/admin/TableToolbar";
import Pagination from "@/components/admin/Pagination";
import Button from "@/components/admin/Button";
import Select from "@/components/admin/Select";
import Badge from "@/components/admin/Badge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Banner from "@/components/admin/Banner";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationMeta, setPaginationMeta] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "",
    userId: ""
  });
  const [successBanner, setSuccessBanner] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (roleFilter) params.append('role', roleFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/users?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();

      const normalizedUsers = (data.data || []).map((user) => ({
        ...user,
        id: String(user._id || user.id)
      }));

      setUsers(normalizedUsers);
      setPaginationMeta(data.meta || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const totalPages = paginationMeta.totalPages || 1;
  const paginatedUsers = users;

  const handleSort = (column, direction) => {
    setSortBy(column);
    setSortDirection(direction);
  };

  const handleConfirmAction = async () => {
    const { type, userId } = confirmDialog;
    const user = users.find((u) => u.id === userId);

    try {
      if (type === "suspend") {
        const newStatus = user?.isActive !== false ? "suspended" : "active";

        const response = await fetch(`/api/admin/users/${userId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: newStatus,
            reason: `Admin action: ${newStatus} user`
          })
        });

        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.error || 'Failed to update user status');
        }


        await fetchUsers();
        setSuccessBanner(
          `User ${user?.name} has been ${newStatus}.`
        );
      }
    } catch (err) {
      console.error('Error performing user action:', err);
      setError(err.message);
    }

    setConfirmDialog({ isOpen: false, type: "", userId: "" });
  };

  const exportCSV = () => {
    const headers = ["Name,Email,Role,Connected Stores,Created,Status"];
    const rows = paginatedUsers.map(
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
    render: (name, user) =>
    <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </div>
        </div>

  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    render: (role) =>
    <Badge
      variant={
      role === "SuperAdmin" ?
      "primary" :
      role === "StoreAdmin" ?
      "warning" :
      "default"
      }>
          {role === "SuperAdmin" ? "Super Admin" : role === "StoreAdmin" ? "Store Admin" : "User"}
        </Badge>

  },
  {
    key: "storeCount",
    label: "Connected Stores",
    sortable: true,
    render: (storeCount) => storeCount || 0
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
    <Badge variant={isActive !== false ? "success" : "danger"}>
          {isActive !== false ? "Active" : "Suspended"}
        </Badge>

  },
  {
    key: "actions",
    label: "Actions",
    render: (_, user) =>
    <div className="flex items-center gap-2">
          <Button
        variant="ghost"
        size="sm"
        onClick={() =>
        setConfirmDialog({
          isOpen: true,
          type: "suspend",
          userId: user.id
        })
        }>
            <AlertTriangle className="w-4 h-4" />
          </Button>
        </div>

  }];


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
    </Select>];


  const actions = [
  <Button key="export" variant="secondary" onClick={exportCSV}>
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>];


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
          Users
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
            columns={userColumns}
            data={paginatedUsers}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort} />
          

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, paginationMeta.total || 0)} of {paginationMeta.total || 0} users
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
        setConfirmDialog({ isOpen: false, type: "", userId: "" })
        }
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message="Are you sure you want to change this user's status?"
        confirmLabel="Change Status"
        variant="danger" />

    </div>);

}