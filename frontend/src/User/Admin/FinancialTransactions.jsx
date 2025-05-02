import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MdAttachMoney, 
  MdMonetizationOn,
  MdPriceCheck,
  MdFilterList,
  MdSearch,
  MdRestaurant,
  MdDateRange,
  MdRefresh,
  MdPerson,
  MdMoreVert,
  MdFileDownload,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight
} from 'react-icons/md'
import toast from 'react-hot-toast'

export default function FinancialTransactions() {
  // State for transactions
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState({
    type: 'all',
    period: '7days',
    status: 'all'
  })
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 10
  
  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    totalTransactions: 0,
    pendingAmount: 0
  })

  // Mock data for demonstration
  useEffect(() => {
    // This would be replaced with an actual API call in a real implementation
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        
        // Wait for 1 second to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Generate mock transactions
        const mockTransactions = [
          {
            id: 'TRX-38291',
            date: '2023-07-22T08:30:00Z',
            amount: 24.99,
            fee: 2.50,
            status: 'completed',
            type: 'order_payment',
            restaurant: {
              id: 'REST-1234',
              name: 'Burger Palace'
            },
            user: {
              id: 'USR-5678',
              name: 'John Smith'
            }
          },
          {
            id: 'TRX-38292',
            date: '2023-07-22T09:15:00Z',
            amount: 18.50,
            fee: 1.85,
            status: 'completed',
            type: 'order_payment',
            restaurant: {
              id: 'REST-1235',
              name: 'Pizza Heaven'
            },
            user: {
              id: 'USR-5679',
              name: 'Emily Johnson'
            }
          },
          {
            id: 'TRX-38293',
            date: '2023-07-21T14:20:00Z',
            amount: 32.75,
            fee: 3.28,
            status: 'completed',
            type: 'order_payment',
            restaurant: {
              id: 'REST-1236',
              name: 'Sushi World'
            },
            user: {
              id: 'USR-5680',
              name: 'Michael Brown'
            }
          },
          {
            id: 'TRX-38294',
            date: '2023-07-21T16:05:00Z',
            amount: 42.00,
            fee: 4.20,
            status: 'completed',
            type: 'order_payment',
            restaurant: {
              id: 'REST-1234',
              name: 'Burger Palace'
            },
            user: {
              id: 'USR-5681',
              name: 'Sarah Davis'
            }
          },
          {
            id: 'TRX-38295',
            date: '2023-07-20T11:30:00Z',
            amount: 15.25,
            fee: 1.53,
            status: 'refunded',
            type: 'refund',
            restaurant: {
              id: 'REST-1235',
              name: 'Pizza Heaven'
            },
            user: {
              id: 'USR-5682',
              name: 'Alex Wilson'
            }
          },
          {
            id: 'TRX-38296',
            date: '2023-07-20T13:45:00Z',
            amount: 27.99,
            fee: 2.80,
            status: 'pending',
            type: 'payout',
            restaurant: {
              id: 'REST-1236',
              name: 'Sushi World'
            },
            user: null
          },
          {
            id: 'TRX-38297',
            date: '2023-07-19T10:15:00Z',
            amount: 35.50,
            fee: 3.55,
            status: 'completed',
            type: 'order_payment',
            restaurant: {
              id: 'REST-1237',
              name: 'Taco Town'
            },
            user: {
              id: 'USR-5683',
              name: 'Jessica Martinez'
            }
          },
          {
            id: 'TRX-38298',
            date: '2023-07-19T12:30:00Z',
            amount: 19.75,
            fee: 1.98,
            status: 'completed',
            type: 'order_payment',
            restaurant: {
              id: 'REST-1238',
              name: 'Curry House'
            },
            user: {
              id: 'USR-5684',
              name: 'David Lee'
            }
          },
          {
            id: 'TRX-38299',
            date: '2023-07-18T15:20:00Z',
            amount: 22.50,
            fee: 2.25,
            status: 'failed',
            type: 'order_payment',
            restaurant: {
              id: 'REST-1239',
              name: 'Pasta Place'
            },
            user: {
              id: 'USR-5685',
              name: 'Lisa Thompson'
            }
          },
          {
            id: 'TRX-38300',
            date: '2023-07-18T17:45:00Z',
            amount: 48.99,
            fee: 4.90,
            status: 'completed',
            type: 'order_payment',
            restaurant: {
              id: 'REST-1240',
              name: 'BBQ Joint'
            },
            user: {
              id: 'USR-5686',
              name: 'Robert Johnson'
            }
          },
          {
            id: 'TRX-38301',
            date: '2023-07-17T09:30:00Z',
            amount: 31.25,
            fee: 3.13,
            status: 'completed',
            type: 'order_payment',
            restaurant: {
              id: 'REST-1241',
              name: 'Breakfast Club'
            },
            user: {
              id: 'USR-5687',
              name: 'Amanda White'
            }
          },
          {
            id: 'TRX-38302',
            date: '2023-07-17T11:15:00Z',
            amount: 26.00,
            fee: 2.60,
            status: 'pending',
            type: 'payout',
            restaurant: {
              id: 'REST-1234',
              name: 'Burger Palace'
            },
            user: null
          },
        ];
        
        setTransactions(mockTransactions);
        
        // Calculate stats
        const totalRevenue = mockTransactions
          .filter(t => t.status === 'completed' && t.type === 'order_payment')
          .reduce((sum, t) => sum + t.fee, 0);
          
        const today = new Date();
        const dayStart = new Date(today.setHours(0, 0, 0, 0));
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);
        
        const dailyRevenue = mockTransactions
          .filter(t => t.status === 'completed' && t.type === 'order_payment' && new Date(t.date) >= dayStart)
          .reduce((sum, t) => sum + t.fee, 0);
          
        const weeklyRevenue = mockTransactions
          .filter(t => t.status === 'completed' && t.type === 'order_payment' && new Date(t.date) >= weekStart)
          .reduce((sum, t) => sum + t.fee, 0);
          
        const pendingAmount = mockTransactions
          .filter(t => t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);
          
        setStats({
          totalRevenue: totalRevenue.toFixed(2),
          weeklyRevenue: weeklyRevenue.toFixed(2),
          dailyRevenue: dailyRevenue.toFixed(2),
          totalTransactions: mockTransactions.length,
          pendingAmount: pendingAmount.toFixed(2)
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transaction data');
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    // Search by ID, restaurant name or user name
    const matchesSearch = searchQuery === '' || 
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.restaurant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Filter by type
    const matchesType = filter.type === 'all' || transaction.type === filter.type;
    
    // Filter by status
    const matchesStatus = filter.status === 'all' || transaction.status === filter.status;
    
    // Filter by period
    let matchesPeriod = true;
    if (filter.period !== 'all') {
      const now = new Date();
      const transactionDate = new Date(transaction.date);
      if (filter.period === '24hours') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        matchesPeriod = transactionDate >= yesterday;
      } else if (filter.period === '7days') {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        matchesPeriod = transactionDate >= lastWeek;
      } else if (filter.period === '30days') {
        const lastMonth = new Date(now);
        lastMonth.setDate(now.getDate() - 30);
        matchesPeriod = transactionDate >= lastMonth;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesPeriod;
  });
  
  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  // Handle export transactions
  const handleExport = () => {
    toast.success('Transactions exported successfully');
    // In a real app, this would generate and download a CSV/Excel file
  };

  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get transaction type display text
  const getTransactionType = (type) => {
    switch(type) {
      case 'order_payment':
        return 'Order Payment';
      case 'payout':
        return 'Payout to Restaurant';
      case 'refund':
        return 'Refund';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Financial Transactions</h1>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <MdFileDownload />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md text-white p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="opacity-90 text-sm">Total Platform Revenue</p>
              <h2 className="text-3xl font-bold mt-1">${stats.totalRevenue}</h2>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <MdAttachMoney className="text-2xl" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md text-white p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="opacity-90 text-sm">This Week's Revenue</p>
              <h2 className="text-3xl font-bold mt-1">${stats.weeklyRevenue}</h2>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <MdMonetizationOn className="text-2xl" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md text-white p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="opacity-90 text-sm">Pending Payouts</p>
              <h2 className="text-3xl font-bold mt-1">${stats.pendingAmount}</h2>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <MdPriceCheck className="text-2xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-auto">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search by ID, restaurant, or customer..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <MdFilterList className="text-gray-500" />
              <select 
                value={filter.type}
                onChange={(e) => setFilter({...filter, type: e.target.value})}
                className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent p-2"
              >
                <option value="all">All Types</option>
                <option value="order_payment">Order Payments</option>
                <option value="payout">Restaurant Payouts</option>
                <option value="refund">Refunds</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <MdDateRange className="text-gray-500" />
              <select 
                value={filter.period}
                onChange={(e) => setFilter({...filter, period: e.target.value})}
                className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent p-2"
              >
                <option value="24hours">Last 24 Hours</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <MdRefresh className="text-gray-500" />
              <select 
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
                className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent p-2"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
        </div>

        <div className="overflow-x-auto">
          {currentTransactions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTransactionType(transaction.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${transaction.fee.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MdRestaurant className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{transaction.restaurant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.user ? (
                        <div className="flex items-center">
                          <MdPerson className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{transaction.user.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MdMoreVert />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <MdAttachMoney className="text-gray-300 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No transactions found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstTransaction + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastTransaction, filteredTransactions.length)}
              </span>{" "}
              of <span className="font-medium">{filteredTransactions.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <MdKeyboardArrowLeft />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md ${
                    currentPage === i + 1
                      ? "bg-orange-500 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              )).slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2)
              )}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <MdKeyboardArrowRight />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}