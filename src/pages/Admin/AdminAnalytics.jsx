import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Users, Building, Hotel, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import AdminButton from '../../components/Admin/AdminCommon/AdminButton';
import AdminStatCard from '../../components/Admin/AdminCommon/AdminStatCard';
import { getGeneralAnalytics, getRevenueAnalytics, getUserAnalytics, getBookingAnalytics } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';


const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [exportFormat, setExportFormat] = useState('CSV');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topPerformingHotels, setTopPerformingHotels] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [platformInsights, setPlatformInsights] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [generalData, revenueData, userData, bookingData] = await Promise.all([
        getGeneralAnalytics(timeRange),
        getRevenueAnalytics(timeRange),
        getUserAnalytics(timeRange),
        getBookingAnalytics(timeRange)
      ]);

      // Format stats data
      const formattedStats = [
        {
          title: 'Total Users',
          value: generalData.totalUsers?.toLocaleString() || '0',
          change: generalData.userGrowth || '+0%',
          icon: Users,
          color: '#97B067'
        },
        {
          title: 'Active Hoteliers',
          value: generalData.activeHoteliers?.toLocaleString() || '0',
          change: generalData.hotelierGrowth || '+0%',
          icon: Building,
          color: '#437057'
        },
        {
          title: 'Hotel Listings',
          value: generalData.hotelListings?.toLocaleString() || '0',
          change: generalData.hotelGrowth || '+0%',
          icon: Hotel,
          color: '#2F5249'
        },
        {
          title: 'Total Bookings',
          value: bookingData.totalBookings?.toLocaleString() || '0',
          change: bookingData.bookingGrowth || '+0%',
          icon: Calendar,
          color: '#97B067'
        },
        {
          title: 'Platform Revenue',
          value: `Rs. ${(revenueData.totalRevenue / 1000000).toFixed(1)}M` || 'Rs. 0',
          change: revenueData.revenueGrowth || '+0%',
          icon: DollarSign,
          color: '#437057'
        }
      ];

      setStats(formattedStats);
      setMonthlyData(revenueData.monthlyData || []);
      setTopPerformingHotels(revenueData.topPerformingHotels || []);
      setUserGrowthData(userData.monthlyGrowth || []);
      setPlatformInsights({
        bookingTrends: bookingData.trends || {},
        platformHealth: generalData.platformHealth || {}
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      stats,
      monthlyData,
      topPerformingHotels,
      userGrowthData,
      exportDate: new Date().toISOString(),
      timeRange
    };

    if (exportFormat === 'CSV') {
      // Convert to CSV format
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Metric,Value,Change\n"
        + stats.map(stat => `${stat.title},${stat.value},${stat.change}`).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `hevenstay_analytics_${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Analytics data exported successfully!');
    } else {
      // For PDF, we'll simulate the download
      toast.info(`Exporting analytics data as ${exportFormat}. This would typically generate a comprehensive PDF report.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-600">Monitor platform performance and generate reports</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>

          {/* Export Options */}
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CSV">CSV</option>
            <option value="PDF">PDF</option>
          </select>

          <AdminButton
            onClick={handleExportData}
            style={{ backgroundColor: '#437057' }}
            className="hover:opacity-90 w-full sm:w-max"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </AdminButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <AdminStatCard key={index} {...stat} />
          ))
        )}
      </div>

      {/* Platform Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Booking Trends */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Peak Season (Dec-Feb)</span>
                <span className="text-sm font-medium text-gray-900">{platformInsights.bookingTrends?.peakSeasonPercentage || '65%'} of total bookings</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Booking Value</span>
                <span className="text-sm font-medium text-gray-900">Rs. {platformInsights.bookingTrends?.averageBookingValue?.toLocaleString() || '4,250'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Repeat Customers</span>
                <span className="text-sm font-medium text-gray-900">{platformInsights.bookingTrends?.repeatCustomerPercentage || '32%'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mobile Bookings</span>
                <span className="text-sm font-medium text-gray-900">{platformInsights.bookingTrends?.mobileBookingPercentage || '68%'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Platform Health */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Uptime</span>
                <span className="text-sm font-medium text-green-600">{platformInsights.platformHealth?.systemUptime || '99.9%'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Response Time</span>
                <span className="text-sm font-medium text-gray-900">{platformInsights.platformHealth?.averageResponseTime || '1.2s'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User Satisfaction</span>
                <span className="text-sm font-medium text-green-600">{platformInsights.platformHealth?.userSatisfaction || '4.6/5'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Support Tickets</span>
                <span className="text-sm font-medium text-yellow-600">{platformInsights.platformHealth?.pendingTickets || '23'} pending</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export default AdminAnalytics;