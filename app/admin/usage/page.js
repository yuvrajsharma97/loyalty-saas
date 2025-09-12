'use client';
import { useState, useMemo } from 'react';
import { Download, Store, Users, TrendingUp, Activity, Gift } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import DataTable from '@/components/admin/DataTable';
import TableToolbar from '@/components/admin/TableToolbar';
import Button from '@/components/admin/Button';
import Select from '@/components/admin/Select';
import Badge from '@/components/admin/Badge';

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

export default function AdminUsage() {
  const [dateRange, setDateRange] = useState('30');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const usageData = MOCK_STORES.map(store => ({
    ...store,
    visits: Math.floor(Math.random() * 200) + 50,
    redemptions: Math.floor(Math.random() * 50) + 10
  }));

  const filteredData = useMemo(() => {
    return usageData.filter(store => {
      const matchesTier = !tierFilter || store.tier === tierFilter;
      const matchesStatus = !statusFilter || store.status === statusFilter;
      return matchesTier && matchesStatus;
    });
  }, [usageData, tierFilter, statusFilter]);

  const exportCSV = () => {
    const headers = ['Store,Tier,Users,Visits,Redemptions,Created,Status'];
    const rows = filteredData.map(store => 
      `${store.name},${store.tier},${store.usersCount},${store.visits},${store.redemptions},${store.createdAt},${store.status}`
    );
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-report-${dateRange}days.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate totals
  const totalStores = filteredData.length;
  const totalUsers = filteredData.reduce((sum, store) => sum + store.usersCount, 0);
  const avgUsersPerStore = totalUsers / totalStores || 0;
  const totalVisits = filteredData.reduce((sum, store) => sum + store.visits, 0);
  const totalRedemptions = filteredData.reduce((sum, store) => sum + store.redemptions, 0);

  const usageColumns = [
    { 
      key: 'name', 
      label: 'Store', 
      sortable: true,
      render: (name, store) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{store.ownerEmail}</div>
        </div>
      )
    },
    { 
      key: 'tier', 
      label: 'Tier', 
      sortable: true,
      render: (tier) => <Badge variant={tier}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Badge>
    },
    { key: 'usersCount', label: 'Users', sortable: true },
    { key: 'visits', label: `Visits (${dateRange}d)`, sortable: true },
    { key: 'redemptions', label: `Redemptions (${dateRange}d)`, sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (status) => <Badge variant={status === 'active' ? 'success' : 'danger'}>{status}</Badge>
    }
  ];

  const filters = [
    <Select
      key="dateRange"
      value={dateRange}
      onChange={(e) => setDateRange(e.target.value)}
    >
      <option value="7">Last 7 days</option>
      <option value="30">Last 30 days</option>
      <option value="90">Last 90 days</option>
    </Select>,
    <Select
      key="tier"
      placeholder="All Tiers"
      value={tierFilter}
      onChange={(e) => setTierFilter(e.target.value)}
    >
      <option value="silver">Silver</option>
      <option value="gold">Gold</option>
      <option value="platinum">Platinum</option>
    </Select>,
    <Select
      key="status"
      placeholder="All Statuses"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="active">Active</option>
      <option value="suspended">Suspended</option>
    </Select>
  ];

  const actions = [
    <Button key="export" variant="secondary" onClick={exportCSV}>
      <Download className="w-4 h-4 mr-2" />
      Export Report
    </Button>
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usage Report</h1>
      
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Stores"
          value={totalStores.toLocaleString()}
          icon={Store}
        />
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={Users}
        />
        <StatCard
          title="Avg Users/Store"
          value={avgUsersPerStore.toFixed(1)}
          icon={TrendingUp}
        />
        <StatCard
          title={`Visits (${dateRange}d)`}
          value={totalVisits.toLocaleString()}
          icon={Activity}
        />
        <StatCard
          title={`Redemptions (${dateRange}d)`}
          value={totalRedemptions.toLocaleString()}
          icon={Gift}
        />
      </div>

      {/* Table */}
      <div>
        <TableToolbar
          filters={filters}
          actions={actions}
        />

        <DataTable
          columns={usageColumns}
          data={filteredData}
        />
      </div>
    </div>
  );
}