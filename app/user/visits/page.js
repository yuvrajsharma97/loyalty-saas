"use client";
import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { useUserStore } from "../layout";
import Table from "@/components/ui/Table";
import TableToolbar from "@/components/ui/TableToolbar";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import StoreSwitcher from "@/components/user/StoreSwitcher";
import { exportCsv } from "@/lib/exportCsv";
import { formatDate, formatCurrency } from "@/lib/formatters";

const MOCK_VISITS = [
  {
    id: "visit-1",
    storeId: "1",
    storeName: "Café Central",
    date: "2024-03-13",
    method: "qr",
    status: "approved",
    points: 12,
    spend: 12.50
  },
  {
    id: "visit-2",
    storeId: "2", 
    storeName: "The Coffee Bean",
    date: "2024-03-12",
    method: "manual",
    status: "approved",
    points: 18,
    spend: 12.00
  },
  {
    id: "visit-3",
    storeId: "1",
    storeName: "Café Central", 
    date: "2024-03-10",
    method: "qr",
    status: "pending",
    points: 0,
    spend: 8.75
  },
  {
    id: "visit-4",
    storeId: "3",
    storeName: "Green Leaf Bistro",
    date: "2024-03-08",
    method: "qr",
    status: "approved",
    points: 15,
    spend: 0
  },
  {
    id: "visit-5",
    storeId: "2",
    storeName: "The Coffee Bean",
    date: "2024-03-07",
    method: "manual",
    status: "approved", 
    points: 22,
    spend: 15.50
  },
  {
    id: "visit-6",
    storeId: "1",
    storeName: "Café Central",
    date: "2024-03-05",
    method: "qr",
    status: "approved",
    points: 10,
    spend: 10.25
  },
  {
    id: "visit-7",
    storeId: "3", 
    storeName: "Green Leaf Bistro",
    date: "2024-03-03",
    method: "manual",
    status: "approved",
    points: 15,
    spend: 0
  },
  {
    id: "visit-8",
    storeId: "1",
    storeName: "Café Central",
    date: "2024-03-01",
    method: "qr",
    status: "approved",
    points: 7,
    spend: 7.50
  }
];

export default function UserVisits() {
  const { currentStore, setCurrentStore, connectedStores } = useUserStore();
  const [visits] = useState(MOCK_VISITS);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Filter visits based on current store and filters
  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      // Store filter
      if (currentStore && visit.storeId !== currentStore) return false;

      // Search filter
      if (
        searchQuery &&
        !visit.storeName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Method filter
      if (methodFilter && visit.method !== methodFilter) return false;

      // Status filter
      if (statusFilter && visit.status !== statusFilter) return false;

      // Date range filter
      if (dateFrom && visit.date < dateFrom) return false;
      if (dateTo && visit.date > dateTo) return false;

      return true;
    });
  }, [
    visits,
    currentStore,
    searchQuery,
    methodFilter,
    statusFilter,
    dateFrom,
    dateTo,
  ]);

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
  const paginatedVisits = filteredVisits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportVisits = () => {
    const csvData = filteredVisits.map((visit) => ({
      store: visit.storeName,
      date: formatDate(visit.date),
      method: visit.method.toUpperCase(),
      status: visit.status.charAt(0).toUpperCase() + visit.status.slice(1),
      pointsEarned: visit.points,
      spend: formatCurrency(visit.spend),
    }));

    exportCsv(csvData, "my-visits.csv");
  };

  const visitColumns = [
    { key: "storeName", label: "Store", sortable: true },
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
        <Badge variant={status === "approved" ? "success" : "warning"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      ),
    },
    { key: "points", label: "Points Earned", sortable: true },
    {
      key: "spend",
      label: "Spend",
      sortable: true,
      render: (amount) => formatCurrency(amount),
    },
  ];

  const filters = [
    <Select
      key="store"
      placeholder="All Stores"
      value={currentStore}
      onChange={(e) => setCurrentStore(e.target.value)}>
      {connectedStores.map((store) => (
        <option key={store.id} value={store.id}>
          {store.name}
        </option>
      ))}
    </Select>,
    <Select
      key="method"
      placeholder="All Methods"
      value={methodFilter}
      onChange={(e) => setMethodFilter(e.target.value)}>
      <option value="qr">QR Code</option>
      <option value="manual">Manual</option>
    </Select>,
    <Select
      key="status"
      placeholder="All Status"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}>
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
    </Select>,
    <div key="daterange" className="flex gap-2">
      <Input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        placeholder="From date"
        className="w-full"
      />
      <Input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        placeholder="To date"
        className="w-full"
      />
    </div>,
  ];

  const actions = [
    <Button key="export" variant="secondary" onClick={exportVisits}>
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>,
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#014421] dark:text-white">
          Visit History
        </h1>
        <div className="sm:hidden">
          <StoreSwitcher
            stores={connectedStores}
            currentStore={currentStore}
            onStoreChange={setCurrentStore}
          />
        </div>
      </div>

      <TableToolbar
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        filters={filters}
        actions={actions}
      />

      <Table columns={visitColumns} data={paginatedVisits} />

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
  );
}
