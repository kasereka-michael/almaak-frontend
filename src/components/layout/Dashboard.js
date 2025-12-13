import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useExchangeRate } from '../../contexts/ExchangeRateContext';
import { canUserAccessSection } from '../../utils/roleBasedRedirect';
import {
  fetchCustomers,
  fetchProducts,
  fetchQuotations,
  fetchInvoices,
} from '../../services/api';
import API from '../../services/apiConfig';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { baseCurrency, formatCurrency } = useExchangeRate();
  const [showExchangeSettings, setShowExchangeSettings] = useState(false);
  const [stats, setStats] = useState({
    // Core Business
    employees: 0,
    personnel: 0,
    customers: 0,
    products: 0,
    quotations: 0,
    invoices: 0,
    projects: 0,
    documents: 0,
    
    // Financial
    totalAccounts: 0,
    totalTransactions: 0,
    totalBalance: 0,
    revenue: 0,
    expenses: 0,
    profit: 0,
    
    // Inventory & Assets
    inventoryItems: 0,
    inventoryValue: 0,
    
    // Compliance & Audit
    taxRecords: 0,
    pendingTaxAmount: 0,
    auditChanges: 0,
    
    // Projects
    completedProjects: 0,
    ongoingProjects: 0,
    delayedProjects: 0,
    
    // Personnel Management
    activePersonnel: 0,
    completedInductions: 0,
    pendingInductions: 0,
  });

  const [chartData, setChartData] = useState({
    revenueData: { labels: [], datasets: [] },
    projectStatus: { labels: [], datasets: [] },
    resourceUtilization: { labels: [], datasets: [] },
  });

  // Calendar events
  const [calendarEvents, setCalendarEvents] = useState([
    { id: 1, date: '2025-04-18', title: 'Project Review', type: 'meeting', marked: true },
    { id: 2, date: '2025-04-20', title: 'Client Call', type: 'call', marked: false },
    { id: 3, date: '2025-04-22', title: 'Deadline: Q2 Report', type: 'deadline', marked: true },
  ]);

  // Chronometer state
  const [timerDuration, setTimerDuration] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load data from all modules (these fetches likely don't correspond to variable names below; normalize defensively)
      const results = await Promise.all([
        fetchCustomers().catch(() => []),
        fetchProducts().catch(() => []),
        fetchQuotations().catch(() => []),
        fetchInvoices().catch(() => []),
      ]);
      // Fetch backend total quotations count (fallback to list length if not available)
      let backendQuotationsCount = 0;
      try {
        const { data } = await API.get('quotation/v1/count');
        backendQuotationsCount = Number(data || 0);
      } catch (_) {
        // ignore and fallback later
      }

      // Map results to named collections with safe defaults
      const customers = Array.isArray(results[0]?.content) ? results[0].content : (Array.isArray(results[0]) ? results[0] : []);
      const products = Array.isArray(results[1]?.content) ? results[1].content : (Array.isArray(results[1]) ? results[1] : []);
      const quotations = Array.isArray(results[2]?.content) ? results[2].content : (Array.isArray(results[2]) ? results[2] : []);
      const invoices = Array.isArray(results[3]?.content) ? results[3].content : (Array.isArray(results[3]) ? results[3] : []);

      // Derive metrics for cards requested
      const totalQuotations = backendQuotationsCount > 0 ? backendQuotationsCount : quotations.length;
      const acceptedQuotations = quotations.filter(q => (q.status || q.etat || '').toString().toLowerCase() === 'accepted').length;
      // Treat invoices as POs for now if PO endpoint not wired; adjust when PO fetch exists
      const allPOs = invoices; // replace with fetched POs when available
      // Backend POs count
      let totalPOs = allPOs.length;
      try {
        const { data: posCount } = await API.get('po/v1/count');
        if (!Number.isNaN(Number(posCount)) && Number(posCount) >= 0) {
          totalPOs = Number(posCount);
        }
      } catch (_) { /* fallback to list length */ }
      // Backend paid POs count (fallback to client-side computation)
      let paidPOs = allPOs.filter(po => {
        const st = (po.status || po.paymentStatus || '').toString().toLowerCase();
        return st === 'paid' || st === 'completed' || st === 'settled';
      }).length;
      try {
        const { data: paidCount } = await API.get('po/v1/count', { params: { paid: true } });
        const n = Number(paidCount);
        if (!Number.isNaN(n) && n >= 0) {
          paidPOs = n;
        }
      } catch (_) { /* fallback to filtered length */ }
      // Prefer backend total income for POs if available
      let totalIncomeFromPOs = allPOs.reduce((sum, po) => {
        const amount = Number(po.totalAmount || po.amount || po.total || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      try {
        const { data: poIncome } = await API.get('po/v1/income/total');
        const n = Number(poIncome);
        if (!Number.isNaN(n) && n >= 0) {
          totalIncomeFromPOs = n;
        }
      } catch (_) { /* fallback to computed sum */ }

      // Placeholder/empty arrays for modules not yet wired
      const accounts = [];
      const transactions = [];
      const personnel = [];
      const inventaire = [];
      const taxCompliance = [];
      const employees = [];
      const projects = [];

      // Calculate financial metrics safely
      const totalBalance = (Array.isArray(accounts) ? accounts : []).reduce((sum, account) => sum + (Number(account?.solde) || 0), 0);
      const totalRevenue = (Array.isArray(transactions) ? transactions : [])
        .filter(t => Number(t?.entree) > 0)
        .reduce((sum, t) => sum + (Number(t?.entree) || 0), 0);
      const totalExpenses = (Array.isArray(transactions) ? transactions : [])
        .filter(t => Number(t?.sortie) > 0)
        .reduce((sum, t) => sum + (Number(t?.sortie) || 0), 0);

      // Calculate inventory value
      const inventoryValue = (Array.isArray(inventaire) ? inventaire : []).reduce((sum, item) => sum + (Number(item?.montantTotalUSD) || 0), 0);

      // Calculate tax compliance
      const pendingTaxAmount = (Array.isArray(taxCompliance) ? taxCompliance : [])
        .filter(tax => tax?.status === 'pending' || tax?.status === 'overdue')
        .reduce((sum, tax) => sum + (Number(tax?.taxAmount) || 0), 0);

      // Calculate project status
      const completedProjects = (Array.isArray(projects) ? projects : []).filter(p => p?.status === 'completed').length;
      const ongoingProjects = (Array.isArray(projects) ? projects : []).filter(p => p?.status === 'in_progress').length;
      const delayedProjects = (Array.isArray(projects) ? projects : []).filter(p => p?.status === 'delayed').length;

      // Calculate personnel metrics
      const activePersonnel = (Array.isArray(personnel) ? personnel : []).filter(p => p?.accepte).length;

      setStats({
        // Core Business
        employees: (Array.isArray(employees) ? employees.length : 0),
        personnel: (Array.isArray(personnel) ? personnel.length : 0),
        customers: customers.length,
        products: products.length,
        quotations: quotations.length,
        invoices: invoices.length,
        projects: (Array.isArray(projects) ? projects.length : 0),
        documents: 0,

        // Financial
        totalAccounts: (Array.isArray(accounts) ? accounts.length : 0),
        totalTransactions: (Array.isArray(transactions) ? transactions.length : 0),
        totalBalance,
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: totalRevenue - totalExpenses,
        // New KPIs
        totalQuotations,
        acceptedQuotations,
        totalPOs,
        paidPOs,
        totalIncomeFromPOs,

        // Inventory & Assets
        inventoryItems: (Array.isArray(inventaire) ? inventaire.length : 0),
        inventoryValue,

        // Compliance & Audit
        taxRecords: (Array.isArray(taxCompliance) ? taxCompliance.length : 0),
        pendingTaxAmount,
        auditChanges: 0,

        // Projects
        completedProjects,
        ongoingProjects,
        delayedProjects,

        // Personnel Management
        activePersonnel,
        completedInductions: 0,
        pendingInductions: 0,
      });

      // Update chart data with safe arrays
      updateChartData(
        Array.isArray(transactions) ? transactions : [],
        Array.isArray(projects) ? projects : [],
        Array.isArray(inventaire) ? inventaire : [],
        Array.isArray(taxCompliance) ? taxCompliance : []
      );
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const updateChartData = (transactions, projects, inventaire, taxCompliance) => {
    // Normalize inputs to arrays
    const txs = Array.isArray(transactions) ? transactions : [];
    const projs = Array.isArray(projects) ? projects : [];
    const inv = Array.isArray(inventaire) ? inventaire : [];
    const taxes = Array.isArray(taxCompliance) ? taxCompliance : [];

    // Calculate monthly revenue/expense data
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize months
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, i).toLocaleString('default', { month: 'short' });
      monthlyData[month] = { revenue: 0, expenses: 0 };
    }
    
    // Process transactions
    txs.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === currentYear) {
        const month = date.toLocaleString('default', { month: 'short' });
        if (monthlyData[month]) {
          monthlyData[month].revenue += transaction.entree || 0;
          monthlyData[month].expenses += transaction.sortie || 0;
        }
      }
    });

    const months = Object.keys(monthlyData);
    const revenueData = months.map(month => monthlyData[month].revenue);
    const expenseData = months.map(month => monthlyData[month].expenses);

    // Project status data
    const completedCount = projs.filter(p => p.status === 'completed').length;
    const ongoingCount = projs.filter(p => p.status === 'in_progress').length;
    const delayedCount = projs.filter(p => p.status === 'delayed').length;

    // Inventory distribution by condition
    const inventoryByCondition = inv.reduce((acc, item) => {
      acc[item.etat] = (acc[item.etat] || 0) + 1;
      return acc;
    }, {});

    // Tax compliance status
    const taxByStatus = taxes.reduce((acc, tax) => {
      acc[tax.status] = (acc[tax.status] || 0) + 1;
      return acc;
    }, {});

    setChartData({
      revenueData: {
        labels: months,
        datasets: [
          {
            label: 'Revenue',
            data: revenueData,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.1,
          },
          {
            label: 'Expenses',
            data: expenseData,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.1,
          },
        ],
      },
      projectStatus: {
        labels: ['Completed', 'Ongoing', 'Delayed'],
        datasets: [
          {
            label: 'Project Status',
            data: [completedCount, ongoingCount, delayedCount],
            backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
            hoverOffset: 4,
          },
        ],
      },
      inventoryCondition: {
        labels: Object.keys(inventoryByCondition),
        datasets: [
          {
            label: 'Inventory by Condition',
            data: Object.values(inventoryByCondition),
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
            hoverOffset: 4,
          },
        ],
      },
      taxCompliance: {
        labels: Object.keys(taxByStatus),
        datasets: [
          {
            label: 'Tax Compliance Status',
            data: Object.values(taxByStatus),
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
            hoverOffset: 4,
          },
        ],
      },
    });
  };

  // Chronometer logic
  const startTimer = () => {
    if (!timerDuration || isNaN(timerDuration) || timerDuration <= 0) {
      alert('Please enter a valid duration in minutes.');
      return;
    }
    const durationInSeconds = parseInt(timerDuration) * 60;
    setTimeLeft(durationInSeconds);
    setTimerRunning(true);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerRunning(false);
          alert('Task time is up!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimeLeft(0);
    setTimerDuration('');
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle marking for calendar events
  const toggleEventMark = (id) => {
    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id ? { ...event, marked: !event.marked } : event
      )
    );
  };

  // Helper function to filter cards based on user access
  const filterCardsByAccess = (cards) => {
    return cards.filter(card => {
      const section = card.path.substring(1); // Remove leading slash
      return canUserAccessSection(currentUser, section);
    });
  };

  // Financial Overview Cards
  const allFinancialCards = [
    { name: 'Total Balance', value: formatCurrency(stats.totalBalance), icon: '💰', path: '/accounts', color: 'bg-emerald-500', section: 'accounts' },
    { name: 'Revenue', value: formatCurrency(stats.revenue), icon: '📈', path: '/transactions', color: 'bg-green-500', section: 'transactions' },
    { name: 'Expenses', value: formatCurrency(stats.expenses), icon: '📉', path: '/transactions', color: 'bg-red-500', section: 'transactions' },
    // Financial summary from POs
    { name: 'Total Income (POs)', value: formatCurrency(stats.totalIncomeFromPOs || 0), icon: '🏦', path: '/pos', color: 'bg-indigo-600', section: 'pos' },
  ];

  // Business Operations Cards
  const allOperationsCards = [
    { name: 'Customers', value: stats.customers, icon: '🤝', path: '/customers', color: 'bg-pink-500', section: 'customers' },
    { name: 'Projects', value: stats.projects, icon: '📝', path: '/projects', color: 'bg-yellow-500', section: 'projects' },
    // New quotation/PO cards (operations area)
    { name: 'Total Quotations', value: stats.totalQuotations || 0, icon: '🧾', path: '/quotations', color: 'bg-blue-500', section: 'quotations' },
    { name: 'Accepted Quotations', value: stats.acceptedQuotations || 0, icon: '✅', path: '/quotations', color: 'bg-green-500', section: 'quotations' },
    { name: 'Total POs', value: stats.totalPOs || 0, icon: '📄', path: '/pos', color: 'bg-cyan-600', section: 'pos' },
    { name: 'Paid POs', value: stats.paidPOs || 0, icon: '💸', path: '/pos', color: 'bg-emerald-600', section: 'pos' },
  ];

  // Inventory & Assets Cards
  const allInventoryCards = [
    { name: 'Inventory Items', value: stats.inventoryItems, icon: '📦', path: '/inventaire', color: 'bg-teal-500', section: 'inventaire' },
    { name: 'Inventory Value', value: formatCurrency(stats.inventoryValue), icon: '💎', path: '/inventaire', color: 'bg-cyan-500', section: 'inventaire' },
    { name: 'Products', value: stats.products, icon: '🏷️', path: '/products', color: 'bg-orange-500', section: 'products' },
  ];

  // Compliance & Audit Cards
  const allComplianceCards = [
    { name: 'Transactions', value: stats.totalTransactions, icon: '💳', path: '/transactions', color: 'bg-gray-500', section: 'transactions' },
    { name: 'Active Personnel', value: stats.activePersonnel, icon: '✅', path: '/personnel', color: 'bg-lime-500', section: 'personnel' },
  ];

  // Show all cards to all authenticated users (no role gating)
  const financialCards = allFinancialCards;
  const operationsCards = allOperationsCards;
  const inventoryCards = allInventoryCards;
  const complianceCards = allComplianceCards;

  // Defensive check for charts
  if (!chartData.revenueData.datasets.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Welcome, {currentUser?.email || 'User'}!</h1>
        <p className="text-gray-600">Comprehensive Business Dashboard - Base Currency: USD</p>
      </div>

      {/* Financial Overview - visible to everyone */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">💰 Financial Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {financialCards.map((card) => (
            <div
              key={card.name}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className={`${card.color} h-1`}></div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-medium text-gray-600">{card.name}</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{card.value}</p>
                  </div>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div className="mt-2">
                  <Link to={card.path} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Operations - visible to everyone */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🏢 Business Operations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {operationsCards.map((card) => (
            <div
              key={card.name}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className={`${card.color} h-1`}></div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-medium text-gray-600">{card.name}</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{card.value}</p>
                  </div>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div className="mt-2">
                  <Link to={card.path} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                    Manage →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory & Assets - visible to everyone */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📦 Inventory & Assets</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {inventoryCards.map((card) => (
            <div
              key={card.name}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className={`${card.color} h-1`}></div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-medium text-gray-600">{card.name}</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{card.value}</p>
                  </div>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div className="mt-2">
                  <Link to={card.path} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                    View →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance & Audit - visible to everyone */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Compliance & Audit</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {complianceCards.map((card) => (
            <div
              key={card.name}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className={`${card.color} h-1`}></div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-medium text-gray-600">{card.name}</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{card.value}</p>
                  </div>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div className="mt-2">
                  <Link to={card.path} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                    Review →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics & Reports - visible to everyone */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📈 Analytics & Reports</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Expenses Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-base font-semibold mb-4">Revenue vs Expenses Trend</h3>
            <div className="h-64">
              <Line 
                data={chartData.revenueData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(value);
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>

          {/* Project Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-base font-semibold mb-4">Project Status Distribution</h3>
            <div className="h-64">
              <Doughnut 
                data={chartData.projectStatus} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  }
                }} 
              />
            </div>
          </div>

          {/* Inventory Condition Analysis */}
          {chartData.inventoryCondition && chartData.inventoryCondition.datasets.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Inventory Condition Analysis</h3>
              <div className="h-64">
                <Doughnut 
                  data={chartData.inventoryCondition} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    }
                  }} 
                />
              </div>
            </div>
          )}

          {/* Tax Compliance Status */}
          {chartData.taxCompliance && chartData.taxCompliance.datasets.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Quotation Revenue Expected</h3>
              <div className="h-64">
                <Doughnut 
                  data={chartData.taxCompliance} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    }
                  }} 
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar & Schedule */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold mb-2">Calendar & Schedule</h3>
          <div className="space-y-4">
          
            <div>
              <h4 className="text-xs font-medium text-gray-700">Calendar</h4>
              <div className="mt-1">
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  height="300px"
                  events={calendarEvents.map((event) => ({
                    id: event.id.toString(),
                    title: event.title,
                    date: event.date,
                    className: event.marked ? 'marked-event' : '',
                  }))}
                  eventClick={(info) => toggleEventMark(Number(info.event.id))}
                />
              </div>
            </div>
            {/* Chronometer */}
            <div>
              <h4 className="text-xs font-medium text-gray-700">Task Timer</h4>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="number"
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(e.target.value)}
                  placeholder="Minutes"
                  className="w-24 p-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={timerRunning}
                />
                <button
                  onClick={timerRunning ? stopTimer : startTimer}
                  className={`px-2 py-1 text-xs rounded ${
                    timerRunning ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'
                  } hover:bg-opacity-90`}
                >
                  {timerRunning ? 'Stop' : 'Start'}
                </button>
              </div>
              {timerRunning && (
                <p className="mt-1 text-xs font-semibold text-gray-800">Time Left: {formatTime(timeLeft)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
