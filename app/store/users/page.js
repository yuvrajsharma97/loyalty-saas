"use client";
import { useState, useMemo } from "react";
import { Download, UserPlus, Eye, Plus, Minus } from "lucide-react";
import Table from "@/components/ui/Table";
import TableToolbar from "@/components/ui/TableToolbar";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Banner from "@/components/ui/Banner";
import { exportCsv } from "@/lib/exportCsv";
import { formatDate } from "@/lib/formatters";

const MOCK_USERS = [
{
  id: "1",
  name: "John Smith",
  email: "john.smith@example.com",
  points: 245,
  visits: 12,
  lastVisit: "2024-03-13",
  joinedAt: "2024-01-20",
  status: "active",
  hasRewards: true,
  role: "User"
},
{
  id: "2",
  name: "Alice Johnson",
  email: "alice.johnson@example.com",
  points: 156,
  visits: 8,
  lastVisit: "2024-03-12",
  joinedAt: "2024-02-03",
  status: "active",
  hasRewards: false,
  role: "User"
},
{
  id: "3",
  name: "Bob Wilson",
  email: "bob.wilson@example.com",
  points: 89,
  visits: 5,
  lastVisit: "2024-03-08",
  joinedAt: "2024-02-15",
  status: "suspended",
  hasRewards: true,
  role: "User"
},
{
  id: "4",
  name: "Emma Thompson",
  email: "emma.thompson@example.com",
  points: 387,
  visits: 18,
  lastVisit: "2024-03-14",
  joinedAt: "2024-01-10",
  status: "active",
  hasRewards: true,
  role: "User"
},
{
  id: "5",
  name: "Michael Johnson",
  email: "michael.johnson@example.com",
  points: 142,
  visits: 7,
  lastVisit: "2024-03-11",
  joinedAt: "2024-02-20",
  status: "active",
  hasRewards: false,
  role: "User"
},
{
  id: "6",
  name: "Sarah Wilson",
  email: "sarah.wilson@example.com",
  points: 298,
  visits: 15,
  lastVisit: "2024-03-15",
  joinedAt: "2024-01-25",
  status: "active",
  hasRewards: true,
  role: "User"
},
{
  id: "7",
  name: "James Davis",
  email: "james.davis@example.com",
  points: 67,
  visits: 4,
  lastVisit: "2024-03-05",
  joinedAt: "2024-02-28",
  status: "active",
  hasRewards: false,
  role: "User"
},
{
  id: "8",
  name: "Lisa Brown",
  email: "lisa.brown@example.com",
  points: 445,
  visits: 22,
  lastVisit: "2024-03-14",
  joinedAt: "2024-01-05",
  status: "active",
  hasRewards: true,
  role: "User"
}];


export default function StoreUsers() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [rewardsFilter, setRewardsFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsAdjustment, setPointsAdjustment] = useState("");
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "",
    userId: ""
  });
  const [successBanner, setSuccessBanner] = useState("");

  const itemsPerPage = 10;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRewards =
      !rewardsFilter ||
      rewardsFilter === "yes" && user.hasRewards ||
      rewardsFilter === "no" && !user.hasRewards;

      const matchesStatus = !statusFilter || user.status === statusFilter;

      return matchesSearch && matchesRewards && matchesStatus;
    });
  }, [users, searchQuery, rewardsFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInviteUser = () => {
    if (inviteForm.name && inviteForm.email) {
      const newUser = {
        id: Date.now().toString(),
        name: inviteForm.name,
        email: inviteForm.email,
        points: 0,
        visits: 0,
        lastVisit: null,
        joinedAt: new Date().toISOString().split("T")[0],
        status: "active",
        hasRewards: false
      };

      setUsers((prev) => [newUser, ...prev]);
      setInviteForm({ name: "", email: "" });
      setShowInviteModal(false);
      setSuccessBanner(
        `User ${inviteForm.name} has been invited successfully.`
      );
    }
  };

  const handleAdjustPoints = () => {
    if (selectedUser && pointsAdjustment) {
      const adjustment = parseInt(pointsAdjustment);
      setUsers((prev) =>
      prev.map((user) =>
      user.id === selectedUser.id ?
      { ...user, points: Math.max(0, user.points + adjustment) } :
      user
      )
      );

      setSuccessBanner(
        `Points ${adjustment > 0 ? "added to" : "removed from"} ${
        selectedUser.name}: ${
        Math.abs(adjustment)} points`
      );
      setShowPointsModal(false);
      setSelectedUser(null);
      setPointsAdjustment("");
    }
  };

  const handleRemoveUser = () => {
    const { userId } = confirmDialog;
    const user = users.find((u) => u.id === userId);

    setUsers((prev) => prev.filter((user) => user.id !== userId));
    setSuccessBanner(`User ${user?.name} has been removed.`);
    setConfirmDialog({ isOpen: false, type: "", userId: "" });
  };

  const exportUsers = () => {
    const csvData = filteredUsers.map((user) => ({
      name: user.name,
      email: user.email,
      points: user.points,
      visits: user.visits,
      lastVisit: user.lastVisit ? formatDate(user.lastVisit) : "Never",
      joined: formatDate(user.joinedAt),
      status: user.status,
      hasRewards: user.hasRewards ? "Yes" : "No"
    }));

    exportCsv(csvData, "store-users.csv");
  };

  const userColumns = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "points", label: "Points", sortable: true },
  { key: "visits", label: "Visits", sortable: true },
  {
    key: "lastVisit",
    label: "Last Visit",
    sortable: true,
    render: (date) => date ? formatDate(date) : "Never"
  },
  {
    key: "joinedAt",
    label: "Joined",
    sortable: true,
    render: (date) => formatDate(date)
  },
  {
    key: "status",
    label: "Status",
    render: (status) =>
    <Badge variant={status === "active" ? "success" : "danger"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>

  },
  {
    key: "actions",
    label: "Actions",
    render: (_, user) =>
    <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" aria-label="View user">
            <Eye className="w-4 h-4" />
          </Button>
          <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setSelectedUser(user);
          setShowPointsModal(true);
        }}
        aria-label="Adjust points">
            <Plus className="w-4 h-4" />
          </Button>
          <Button
        variant="ghost"
        size="sm"
        onClick={() =>
        setConfirmDialog({
          isOpen: true,
          type: "remove",
          userId: user.id
        })
        }
        aria-label="Remove user">
            <Minus className="w-4 h-4" />
          </Button>
        </div>

  }];


  const filters = [
  <Select
    key="rewards"
    placeholder="Has Rewards"
    value={rewardsFilter}
    onChange={(e) => setRewardsFilter(e.target.value)}>
      <option value="yes">Yes</option>
      <option value="no">No</option>
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
  <Button key="export" variant="secondary" onClick={exportUsers}>
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>,
  <Button key="invite" onClick={() => setShowInviteModal(true)}>
      <UserPlus className="w-4 h-4 mr-2" />
      Invite User
    </Button>];


  return (
    <div className="space-y-6">
      {successBanner &&
      <Banner
        type="success"
        message={successBanner}
        onDismiss={() => setSuccessBanner("")} />

      }

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Store Users
        </h1>

        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          filters={filters}
          actions={actions} />
        

        <Table columns={userColumns} data={paginatedUsers} />

        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage} />
          
        </div>
      </div>

      {}
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteForm({ name: "", email: "" });
        }}
        title="Invite New User"
        actions={
        <>
            <Button variant="ghost" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser}>Send Invitation</Button>
          </>
        }>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <Input
              value={inviteForm.name}
              onChange={(e) =>
              setInviteForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter customer's name" />
            
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={inviteForm.email}
              onChange={(e) =>
              setInviteForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter customer's email" />
            
          </div>
        </div>
      </Modal>

      {}
      <Modal
        isOpen={showPointsModal}
        onClose={() => {
          setShowPointsModal(false);
          setSelectedUser(null);
          setPointsAdjustment("");
        }}
        title="Adjust Points"
        actions={
        <>
            <Button variant="ghost" onClick={() => setShowPointsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustPoints}>Update Points</Button>
          </>
        }>
        {selectedUser &&
        <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adjusting points for <strong>{selectedUser.name}</strong>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Current points: <strong>{selectedUser.points}</strong>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Point Adjustment
              </label>
              <Input
              type="number"
              value={pointsAdjustment}
              onChange={(e) => setPointsAdjustment(e.target.value)}
              placeholder="Enter points (use negative to subtract)" />
            
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use positive numbers to add points, negative to subtract
              </p>
            </div>
          </div>
        }
      </Modal>

      {}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
        setConfirmDialog({ isOpen: false, type: "", userId: "" })
        }
        onConfirm={handleRemoveUser}
        title="Remove User"
        message="Are you sure you want to remove this user? This action cannot be undone."
        confirmLabel="Remove User"
        variant="danger" />
      
    </div>);

}