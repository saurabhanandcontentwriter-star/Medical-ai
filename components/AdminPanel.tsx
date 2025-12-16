import React, { useState } from 'react';

type AdminTab = 'dashboard' | 'orders' | 'inventory' | 'users';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Mock Data
  const recentOrders = [
    { id: 'ORD-2983', customer: 'Rahul Sharma', items: 'Metformin, Atorvastatin', amount: 450, status: 'Processing', date: 'Oct 24, 2023' },
    { id: 'ORD-2982', customer: 'Priya Patel', items: 'Thyroid Profile Test', amount: 499, status: 'Completed', date: 'Oct 24, 2023' },
    { id: 'ORD-2981', customer: 'Amit Kumar', items: 'Vitamin C, Zinc', amount: 120, status: 'Shipped', date: 'Oct 23, 2023' },
    { id: 'ORD-2980', customer: 'Sneha Gupta', items: 'Full Body Checkup', amount: 1499, status: 'Scheduled', date: 'Oct 23, 2023' },
    { id: 'ORD-2979', customer: 'Vikram Singh', items: 'Protein Powder', amount: 1499, status: 'Delivered', date: 'Oct 22, 2023' },
  ];

  const inventory = [
    { id: 1, name: 'Paracetamol 650mg', category: 'Medicine', stock: 1500, status: 'In Stock', price: 30 },
    { id: 2, name: 'Vitamin C + Zinc', category: 'Supplements', stock: 45, status: 'Low Stock', price: 120 },
    { id: 3, name: 'Digene Gel', category: 'Medicine', stock: 200, status: 'In Stock', price: 180 },
    { id: 4, name: 'Band-Aid Pack', category: 'First Aid', stock: 0, status: 'Out of Stock', price: 50 },
    { id: 5, name: 'Diabetes Screen Kit', category: 'Lab Test', stock: 50, status: 'In Stock', price: 350 },
  ];

  const stats = [
    { label: 'Total Revenue', value: '₹1.2L', change: '+12%', icon: '💰', color: 'bg-green-100 text-green-700' },
    { label: 'Active Orders', value: '24', change: '+5', icon: '📦', color: 'bg-blue-100 text-blue-700' },
    { label: 'Pending Tests', value: '12', change: '-2', icon: '🔬', color: 'bg-purple-100 text-purple-700' },
    { label: 'Total Users', value: '1,840', change: '+24', icon: '👥', color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full overflow-y-auto bg-gray-50 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your medical application overview.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
          <div className="text-sm pr-2">
            <p className="font-bold text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-xs text-green-600 font-medium mt-1">{stat.change} this week</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 mb-6 w-fit">
        {['dashboard', 'orders', 'inventory', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as AdminTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab 
                ? 'bg-teal-50 text-teal-700 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Table Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Orders Section */}
          {(activeTab === 'dashboard' || activeTab === 'orders') && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Recent Orders</h3>
                <button className="text-sm text-teal-600 font-medium hover:text-teal-700">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Order ID</th>
                      <th className="px-6 py-3 font-medium">Customer</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 text-gray-600">
                          <div>{order.customer}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[150px]">{order.items}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">₹{order.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Processing' || order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventory Section */}
          {(activeTab === 'dashboard' || activeTab === 'inventory') && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Inventory Overview</h3>
                <button className="text-sm text-teal-600 font-medium hover:text-teal-700">Manage Stock</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Product Name</th>
                      <th className="px-6 py-3 font-medium">Category</th>
                      <th className="px-6 py-3 font-medium">Price</th>
                      <th className="px-6 py-3 font-medium">Stock Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventory.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-gray-500">{item.category}</td>
                        <td className="px-6 py-4 text-gray-900">₹{item.price}</td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium w-fit ${
                            item.status === 'In Stock' ? 'bg-green-50 text-green-700' :
                            item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                               item.status === 'In Stock' ? 'bg-green-500' :
                               item.status === 'Low Stock' ? 'bg-amber-500' :
                               'bg-red-500'
                            }`}></span>
                            {item.status} ({item.stock})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Admin Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors flex items-center">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-lg">+</span>
                Add New Product
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors flex items-center">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </span>
                Create User
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors flex items-center">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </span>
                Generate Sales Report
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-bold text-lg mb-2">System Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Server Uptime</span>
                <span className="text-green-400 font-mono">99.9%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Database</span>
                <span className="text-green-400">Connected</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Last Backup</span>
                <span className="text-gray-300">2 mins ago</span>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className="flex items-center text-xs text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  All Systems Operational
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;