import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Send, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    smsBalance: 0,
    totalContacts: 0,
    smsSent: 0,
    recentSms: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [balanceResponse, contactsResponse, smsHistoryResponse] = await Promise.all([
        api.get('/client/balance'),
        api.get('/client/contacts?limit=1000'),
        api.get('/client/sms-history?limit=10')
      ]);

      // Get the actual balance from the response
      const smsBalance = balanceResponse.data.data.smsBalance?.totalSmsAvailable || 0;
      const contacts = contactsResponse.data.data.contacts || [];
      const smsHistory = smsHistoryResponse.data.data.smsHistory || [];

      // Calculate total SMS sent from history
      const totalSmsSent = smsHistory.reduce((total, sms) => total + (sms.smsUsed || 0), 0);

      setStats({
        smsBalance: smsBalance,
        totalContacts: contacts.length,
        smsSent: totalSmsSent,
        recentSms: smsHistory.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'SMS Balance',
      value: stats.smsBalance.toLocaleString(),
      icon: MessageSquare,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Contacts',
      value: stats.totalContacts.toLocaleString(),
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'SMS Sent',
      value: stats.smsSent.toLocaleString(),
      icon: Send,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Success Rate',
      value: '100%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Client'}!</h1>
          <p className="text-gray-600">Here's an overview of your SMS platform activity</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent SMS Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent SMS Activity</h2>
          </div>
          <div className="p-6">
            {stats.recentSms.length > 0 ? (
              <div className="space-y-4">
                {stats.recentSms.map((sms, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {sms.recipientCount || 1} recipients
                        </p>
                        <p className="text-sm text-gray-500">{sms.message?.substring(0, 50)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(sms.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No SMS sent yet</p>
                <button 
                  onClick={() => window.location.href = '/client/sms'}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Send your first SMS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => window.location.href = '/client/sms'}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Send className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Send SMS</p>
                  <p className="text-sm text-gray-500">Send messages to your contacts</p>
                </div>
              </button>
              
              <button
                onClick={() => window.location.href = '/client/contacts'}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Users className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Manage Contacts</p>
                  <p className="text-sm text-gray-500">Add, edit, or import contacts</p>
                </div>
              </button>
              
              <button
                onClick={() => window.location.href = '/client/sms?tab=history'}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <TrendingUp className="h-8 w-8 text-purple-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-900">View Reports</p>
                  <p className="text-sm text-gray-500">Check SMS delivery reports</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Balance Alert */}
      {stats.smsBalance < 100 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Low SMS Balance
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your SMS balance is running low ({stats.smsBalance} remaining). 
                  Contact your administrator to purchase more SMS credits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
