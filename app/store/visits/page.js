"use client";
import { useState } from "react";
import { Download, CheckCircle, X } from "lucide-react";
import Tabs from "@/components/ui/Tabs";
import Table from "@/components/ui/Table";
import TableToolbar from "@/components/ui/TableToolbar";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Banner from "@/components/ui/Banner";
import RangeDatePicker from "@/components/store/RangeDatePicker";
import { exportCsv } from "@/lib/exportCsv";
import { formatDate, formatCurrency } from "@/lib/formatters";

const MOCK_VISITS_PENDING = [
  {
    id: "pending-1",
    userName: "Alice Johnson",
    date: "2024-03-15",
    method: "qr",
    spendAmount: 8.50,
    points: 9,
    status: "pending"
  },
  {
    id: "pending-2", 
    userName: "Bob Wilson",
    date: "2024-03-15",
    method: "manual",
    spendAmount: 12.75,
    points: 13,
    status: "pending"
  },
  {
    id: "pending-3",
    userName: "Carol Davis",
    date: "2024-03-14",
    method: "qr",
    spendAmount: 6.25,
    points: 6,
    status: "pending"
  },
  {
    id: "pending-4",
    userName: "David Brown",
    date: "2024-03-14", 
    method: "manual",
    spendAmount: 15.00,
    points: 15,
    status: "pending"
  }
];

const MOCK_VISITS_HISTORY = [
  {
    id: "history-1",
    userName: "John Smith",
    date: "2024-03-13",
    method: "qr", 
    status: "approved",
    pointsEarned: 12,
    spendAmount: 12.50
  },
  {
    id: "history-2",
    userName: "Emma Thompson", 
    date: "2024-03-13",
    method: "manual",
    status: "approved",
    pointsEarned: 8,
    spendAmount: 8.00
  },
  {
    id: "history-3",
    userName: "Michael Johnson",
    date: "2024-03-12",
    method: "qr",
    status: "approved", 
    pointsEarned: 18,
    spendAmount: 18.75
  },
  {
    id: "history-4",
    userName: "Sarah Wilson",
    date: "2024-03-12",
    method: "manual",
    status: "approved",
    pointsEarned: 10,
    spendAmount: 10.25
  },
  {
    id: "history-5", 
    userName: "James Davis",
    date: "2024-03-11",
    method: "qr",
    status: "approved",
    pointsEarned: 15,
    spendAmount: 15.50
  },
  {
    id: "history-6",
    userName: "Lisa Brown",
    date: "2024-03-11", 
    method: "manual",
    status: "approved",
    pointsEarned: 7,
    spendAmount: 7.25
  },
  {
    id: "history-7",
    userName: "Robert Taylor",
    date: "2024-03-10",
    method: "qr",
    status: "approved",
    pointsEarned: 22,
    spendAmount: 22.00
  },
  {
    id: "history-8",
    userName: "Jennifer Wilson",
    date: "2024-03-10",
    method: "manual", 
    status: "approved",
    pointsEarned: 9,
    spendAmount: 9.75
  }
];

export default function StoreVisits() {
  const [pendingVisits, setPendingVisits] = useState(MOCK_VISITS_PENDING);
  const [historyVisits, setHistoryVisits] = useState(MOCK_VISITS_HISTORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "",
    visitId: "",
  });
  const [successBanner, setSuccessBanner] = useState("");

  const itemsPerPage = 10;

  const handleApproveVisit = () => {
    const { visitId } = confirmDialog;
    const visit = pendingVisits.find((v) => v.id === visitId);

    if (visit) {
      const approvedVisit = {
        ...visit,
        status: "approved",
        pointsEarned: visit.points,
      };

      setHistoryVisits((prev) => [approvedVisit, ...prev]);
      setPendingVisits((prev) => prev.filter((v) => v.id !== visitId));
      setSuccessBanner(`Visit from ${visit.userName} has been approved.`);
    }

    setConfirmDialog({ isOpen: false, type: "", visitId: "" });
  };

  const handleRejectVisit = () => {
    const { visitId } = confirmDialog;
    const visit = pendingVisits.find((v) => v.id === visitId);

    setPendingVisits((prev) => prev.filter((v) => v.id !== visitId));
    setSuccessBanner(`Visit from ${visit?.userName} has been rejected.`);
    setConfirmDialog({ isOpen: false, type: "", visitId: "" });
  };

  const exportHistory = () => {
    const csvData = historyVisits.map((visit) => ({
      user: visit.userName,
      date: formatDate(visit.date),
      method: visit.method.toUpperCase(),
      status: visit.status,
      pointsEarned: visit.pointsEarned,
      spendAmount: formatCurrency(visit.spendAmount),
    }));

    exportCsv(csvData, "visit-history.csv");
  };

  const pendingColumns = [
    { key: "userName", label: "User", sortable: true },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (date) => formatDate(date),
    },
    {
      key: "method",
      label: "Method",
      render: (method) => (
        <Badge variant={method === "qr" ? "primary" : "default"}>
          {method.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "spendAmount",
      label: "Spend",
      render: (amount) => formatCurrency(amount),
    },
    { key: "points", label: "Points", sortable: true },
    {
      key: "actions",
      label: "Actions",
      render: (_, visit) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                type: "approve",
                visitId: visit.id,
              })
            }
            className="text-green-600 hover:text-green-700">
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                type: "reject",
                visitId: visit.id,
              })
            }
            className="text-red-600 hover:text-red-700">
            <X className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const historyColumns = [
    { key: "userName", label: "User", sortable: true },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (date) => formatDate(date),
    },
    {
      key: "method",
      label: "Method",
      render: (method) => (
        <Badge variant={method === "qr" ? "primary" : "default"}>
          {method.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <Badge variant="success">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      ),
    },
    { key: "pointsEarned", label: "Points Earned", sortable: true },
    {
      key: "spendAmount",
      label: "Spend Amount",
      render: (amount) => formatCurrency(amount),
    },
  ];

  const filteredHistory = historyVisits.filter((visit) => {
    const matchesSearch =
      !searchQuery ||
      visit.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = !methodFilter || visit.method === methodFilter;

    // Simple date filtering (in real app would be more sophisticated)
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const visitDate = new Date(visit.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = visitDate >= startDate && visitDate <= endDate;
    }

    return matchesSearch && matchesMethod && matchesDate;
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filters = [
    <Select
      key="method"
      placeholder="All Methods"
      value={methodFilter}
      onChange={(e) => setMethodFilter(e.target.value)}>
      <option value="qr">QR Code</option>
      <option value="manual">Manual</option>
    </Select>,
    <div key="date" className="w-64">
      <RangeDatePicker value={dateRange} onChange={setDateRange} />
    </div>,
  ];

  const actions = [
    <Button key="export" variant="secondary" onClick={exportHistory}>
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>,
  ];

  const tabs = [
    {
      label: `Pending (${pendingVisits.length})`,
      content: (
        <div className="space-y-6">
          <Table columns={pendingColumns} data={pendingVisits} />
        </div>
      ),
    },
    {
      label: "History",
      content: (
        <div className="space-y-6">
          <TableToolbar
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            filters={filters}
            actions={actions}
          />

          <Table columns={historyColumns} data={paginatedHistory} />

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ),
    },
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
          Store Visits
        </h1>
        <Tabs tabs={tabs} />
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, type: "", visitId: "" })
        }
        onConfirm={
          confirmDialog.type === "approve"
            ? handleApproveVisit
            : handleRejectVisit
        }
        title={
          confirmDialog.type === "approve" ? "Approve Visit" : "Reject Visit"
        }
        message={
          confirmDialog.type === "approve"
            ? "Are you sure you want to approve this visit? Points will be awarded to the customer."
            : "Are you sure you want to reject this visit? This action cannot be undone."
        }
        confirmLabel={confirmDialog.type === "approve" ? "Approve" : "Reject"}
        variant={confirmDialog.type === "approve" ? "primary" : "danger"}
      />
    </div>
  );
}
