import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Upload, Download, Users, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const ClientContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'delete', 'import'
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [importData, setImportData] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 6
  });
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [totalContactsCount, setTotalContactsCount] = useState(0);

  // Initial load on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Load initial contacts and handle pagination changes
  useEffect(() => {
    if (showAllContacts) {
      fetchAllContacts();
    } else {
      // Only fetch if not currently searching
      if (!searchTerm.trim()) {
        fetchContacts();
      }
    }
  }, [pagination.page, pagination.limit, showAllContacts]);

  // Handle search with debouncing to prevent losing focus
  useEffect(() => {
    if (showAllContacts) {
      // Client-side filtering when showing all contacts
      if (searchTerm.trim() === '') {
        setContacts(allContacts);
        return;
      }

      const filtered = allContacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setContacts(filtered);
    } else {
      // Backend search for paginated mode with debouncing
      const delayedSearch = setTimeout(() => {
        performBackendSearch();
      }, 500); // 500ms debounce to reduce API calls

      return () => clearTimeout(delayedSearch);
    }
  }, [searchTerm, allContacts, showAllContacts]);

  const performBackendSearch = async () => {
    try {
      // Don't show loading spinner for search to prevent UI flicker
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await api.get(`/client/contacts?page=1&limit=${pagination.limit}${searchParam}`);
      const contactsData = response.data.data.contacts || [];
      const paginationData = response.data.data.pagination || {};
      
      setContacts(contactsData);
      setPagination(prev => ({
        ...prev,
        ...paginationData,
        page: 1 // Reset to page 1 on search
      }));
      
      // Set total contacts count for stats
      setTotalContactsCount(paginationData.total || 0);
    } catch (error) {
      console.error('Error searching contacts:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      // Don't include search in regular pagination fetch
      const response = await api.get(`/client/contacts?page=${pagination.page}&limit=${pagination.limit}`);
      const contactsData = response.data.data.contacts || [];
      const paginationData = response.data.data.pagination || {};
      
      setContacts(contactsData);
      setPagination(prev => ({
        ...prev,
        ...paginationData
      }));
      
      // Set total contacts count for stats
      setTotalContactsCount(paginationData.total || 0);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllContacts = async () => {
    try {
      setLoading(true);
      // Fetch all contacts in batches
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
      
      setAllContacts(allContactsData);
      setContacts(allContactsData);
      setTotalContactsCount(allContactsData.length);
      setPagination(prev => ({
        ...prev,
        total: allContactsData.length
      }));
    } catch (error) {
      console.error('Error fetching all contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ name: '', phone: '' });
    setModalType('create');
    setShowModal(true);
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (contact) => {
    setSelectedContact(contact);
    setModalType('delete');
    setShowModal(true);
  };

  const handleImport = () => {
    setImportData('');
    setModalType('import');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await api.post('/client/contacts', formData);
      } else if (modalType === 'edit') {
        await api.put(`/client/contacts/${selectedContact.id}`, formData);
      } else if (modalType === 'delete') {
        await api.delete(`/client/contacts/${selectedContact.id}`);
      } else if (modalType === 'import') {
        await api.post('/client/contacts/import', { data: importData });
      }
      setShowModal(false);
      
      // Refresh data based on current mode
      if (showAllContacts) {
        fetchAllContacts();
      } else {
        fetchContacts();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/client/contacts/export');
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting contacts:', error);
      alert('Error exporting contacts');
    }
  };

  const formatPhone = (phone) => {
    // Format phone number for display
    if (phone.startsWith('+255')) {
      return phone;
    } else if (phone.startsWith('255')) {
      return '+' + phone;
    } else if (phone.startsWith('0')) {
      return '+255' + phone.substring(1);
    }
    return '+255' + phone;
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (!showAllContacts) {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchContacts();
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleImport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </div      >
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-md p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">
                {showAllContacts ? allContacts.length : totalContactsCount}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-md p-3">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valid Numbers</p>
              <p className="text-2xl font-bold text-gray-900">
                {showAllContacts ? allContacts.filter(c => c.phone).length : totalContactsCount}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-md p-3">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {searchTerm ? 'Search Results' : 'Showing'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search contacts by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 focus:ring-0 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="ml-2 px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{formatPhone(contact.phone)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {contacts.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No contacts found</p>
            <button
              onClick={handleCreate}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Add your first contact
            </button>
          </div>
        )}
      </div>

      {/* Load All Contacts Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {showAllContacts ? (
              `Showing all ${allContacts.length} contacts`
            ) : (
              `Showing ${contacts.length} of ${totalContactsCount} contacts (page ${pagination.page} of ${pagination.pages})`
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAllContacts(!showAllContacts)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showAllContacts ? 'Show Paginated' : 'Load All Contacts'}
            </button>
            {!showAllContacts && pagination.pages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newPage = Math.max(pagination.page - 1, 1);
                    setPagination(prev => ({ ...prev, page: newPage }));
                    if (searchTerm.trim()) {
                      // If searching, perform search for new page
                      setTimeout(() => performBackendSearch(), 0);
                    }
                  }}
                  className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => {
                    const newPage = Math.min(pagination.page + 1, pagination.pages);
                    setPagination(prev => ({ ...prev, page: newPage }));
                    if (searchTerm.trim()) {
                      // If searching, perform search for new page
                      setTimeout(() => performBackendSearch(), 0);
                    }
                  }}
                  className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {modalType === 'import' ? (
                <form onSubmit={handleSubmit}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Import Contacts</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Data (CSV format: Name,Phone)
                      </label>
                      <textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={6}
                        placeholder="John Doe,+255712345678&#10;Jane Smith,+255787654321"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter one contact per line in format: Name,Phone
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Import
                    </button>
                  </div>
                </form>
              ) : (modalType === 'create' || modalType === 'edit') ? (
                <form onSubmit={handleSubmit}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {modalType === 'create' ? 'Add Contact' : 'Edit Contact'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+255712345678"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter phone number with country code (e.g., +255712345678)
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {modalType === 'create' ? 'Add' : 'Update'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete contact "{selectedContact?.name}"? 
                    This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientContacts;
