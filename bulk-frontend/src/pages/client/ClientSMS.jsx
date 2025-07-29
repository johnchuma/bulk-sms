import React, { useState, useEffect } from 'react';
import { Send, Users, MessageSquare, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import api from '../../utils/api';

const ClientSMS = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [smsHistory, setSmsHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('send'); // 'send', 'history'

  useEffect(() => {
    fetchContacts();
    fetchSmsHistory();
    fetchBalance();
    
    // Check if we should start on history tab from URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'history') {
      setActiveTab('history');
    }
  }, []);

  const fetchContacts = async () => {
    try {
      // Fetch all contacts for SMS sending
      let allContactsData = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await api.get(`/client/contacts?page=${currentPage}&limit=500`);
        const contacts = response.data.data.contacts || [];
        const pagination = response.data.data.pagination || {};
        
        allContactsData = [...allContactsData, ...contacts];
        
        if (currentPage >= pagination.pages) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }
      
      setContacts(allContactsData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchSmsHistory = async () => {
    try {
      const response = await api.get('/client/sms-history?limit=50');
      setSmsHistory(response.data.data.smsHistory || []);
    } catch (error) {
      console.error('Error fetching SMS history:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await api.get('/client/balance');
      const balanceValue = response.data.data.smsBalance?.totalSmsAvailable || 0;
      console.log('Balance fetched:', balanceValue); // Debug log
      setBalance(balanceValue);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    }
  };

  const handleContactSelection = (contactId) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleSendSms = async (e) => {
    e.preventDefault();
    
    if (selectedContacts.length === 0) {
      alert('Please select at least one contact');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (selectedContacts.length > balance) {
      alert(`Insufficient SMS balance. You have ${balance} SMS credits, but trying to send ${selectedContacts.length} messages.`);
      return;
    }

    try {
      setLoading(true);
      await api.post('/client/send-sms', {
        contactIds: selectedContacts,
        message: message.trim()
      });
      
      alert('SMS sent successfully!');
      setMessage('');
      setSelectedContacts([]);
      fetchSmsHistory();
      fetchBalance();
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert(error.response?.data?.message || 'Error sending SMS');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedContactNames = () => {
    return contacts
      .filter(c => selectedContacts.includes(c.id))
      .map(c => c.name)
      .join(', ');
  };

  const messageLength = message.length;
  const smsCount = Math.ceil(messageLength / 160);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">SMS Management</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              fetchBalance();
              fetchContacts();
              fetchSmsHistory();
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
          <div className="bg-blue-100 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-blue-800">
              Balance: {balance.toLocaleString()} SMS
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('send')}
            className={`${
              activeTab === 'send'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            Send SMS
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            SMS History
          </button>
        </nav>
      </div>

      {activeTab === 'send' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Selection */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Select Recipients</h2>
                <button
                  onClick={selectAllContacts}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {selectedContacts.length} of {contacts.length} contacts selected
              </p>
            </div>
            <div className="p-6">
              {contacts.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {contacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleContactSelection(contact.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No contacts available</p>
                  <button
                    onClick={() => window.location.href = '/client/contacts'}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Add contacts first
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Message Composition */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Compose Message</h2>
            </div>
            <form onSubmit={handleSendSms} className="p-6">
              <div className="space-y-4">
                {selectedContacts.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-800">Recipients:</p>
                    <p className="text-sm text-blue-600 truncate">
                      {getSelectedContactNames()}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Type your message here..."
                    required
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{messageLength} characters</span>
                    <span>{smsCount} SMS {smsCount > 1 ? 'credits' : 'credit'}</span>
                  </div>
                </div>

                {/* Cost Preview */}
                {selectedContacts.length > 0 && message && (
                  <div className="p-4 bg-gray-50 rounded-md">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Cost Preview</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Recipients:</span>
                        <span>{selectedContacts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SMS per recipient:</span>
                        <span>{smsCount}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total SMS credits:</span>
                        <span>{selectedContacts.length * smsCount}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Remaining balance:</span>
                        <span>{balance - (selectedContacts.length * smsCount)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || selectedContacts.length === 0 || !message.trim()}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send SMS
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* SMS History */
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">SMS History</h2>
          </div>
          <div className="p-6">
            {smsHistory.length > 0 ? (
              <div className="space-y-4">
                {smsHistory.map((sms, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            Sent to {sms.recipientCount || 1} recipients
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            {new Date(sms.createdAt).toLocaleDateString()} at{' '}
                            {new Date(sms.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                          {sms.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No SMS sent yet</p>
                <button
                  onClick={() => setActiveTab('send')}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Send your first SMS
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Low Balance Warning */}
      {balance < 10 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Low SMS Balance
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your SMS balance is very low ({balance} remaining). 
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

export default ClientSMS;
