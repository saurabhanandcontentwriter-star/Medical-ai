import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Default data structure
  const defaultProfile = {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    dob: '1995-08-15',
    gender: 'Male',
    bloodGroup: 'B+',
    height: '175',
    weight: '72',
    address: 'Flat 402, Krishna Heights, Kankarbagh, Patna, Bihar',
    allergies: 'Peanuts, Dust Mites',
    conditions: 'Mild Asthma',
    emergencyContactName: 'Priya Sharma',
    emergencyContactPhone: '+91 98765 43211'
  };

  const [formData, setFormData] = useState(defaultProfile);

  // Update form data when user prop changes (e.g. login)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, we would save to backend here
  };

  const handleCancel = () => {
    // Reset to what it was before editing (simplified here by just closing)
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-5xl mx-auto w-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your personal information and health records.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center px-5 py-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-xl font-medium hover:bg-teal-100 dark:hover:bg-teal-800 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={handleCancel}
              className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - ID Card Style */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-white dark:border-gray-700 shadow-md overflow-hidden">
               {user?.avatar && user.avatar.length === 1 ? (
                 <span className="text-teal-600 dark:text-teal-400 font-bold">{user.avatar}</span>
               ) : (
                 <span className="text-teal-600 dark:text-teal-400 font-bold">{formData.name.charAt(0)}</span>
               )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{formData.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{formData.email}</p>
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wide">Patient</span>
              <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">{formData.bloodGroup}</span>
            </div>
            
            <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-4 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{formData.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Age</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">28 Years</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-2xl shadow-md p-6 mt-6 text-white">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Emergency Contact
            </h3>
            <div className="space-y-1">
              <p className="text-indigo-100 text-sm">Name</p>
              <p className="font-semibold text-lg">{formData.emergencyContactName}</p>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-indigo-100 text-sm">Phone Number</p>
              <p className="font-semibold text-lg">{formData.emergencyContactPhone}</p>
            </div>
            <button className="w-full mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-lg text-sm font-medium transition-colors">
              Call Emergency
            </button>
          </div>
        </div>

        {/* Right Column - Details Form */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-50 dark:border-gray-700">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                {isEditing ? (
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" />
                ) : (
                  <p className="p-2.5 text-gray-900 dark:text-gray-100">{formData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                {isEditing ? (
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" />
                ) : (
                  <p className="p-2.5 text-gray-900 dark:text-gray-100">{formData.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                {isEditing ? (
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" />
                ) : (
                  <p className="p-2.5 text-gray-900 dark:text-gray-100">{formData.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                {isEditing ? (
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" />
                ) : (
                  <p className="p-2.5 text-gray-900 dark:text-gray-100">{formData.dob}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                {isEditing ? (
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" />
                ) : (
                  <p className="p-2.5 text-gray-900 dark:text-gray-100">{formData.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Physical Attributes */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-50 dark:border-gray-700">Physical Attributes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                {isEditing ? (
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                ) : (
                  <p className="p-2.5 text-gray-900 dark:text-gray-100">{formData.gender}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                {isEditing ? (
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white">
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                  </select>
                ) : (
                  <p className="p-2.5 text-gray-900 dark:text-gray-100">{formData.bloodGroup}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
                {isEditing ? (
                  <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" />
                ) : (
                  <p className="p-2.5 text-gray-900 dark:text-gray-100">{formData.height} cm</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                {isEditing ? (
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" />
                ) : (
                  <p className="p-2.5 text-gray-900 dark:text-gray-100">{formData.weight} kg</p>
                )}
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-50 dark:border-gray-700">Medical History</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allergies</label>
                {isEditing ? (
                  <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" placeholder="e.g. Peanuts, Penicillin" />
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.allergies.split(',').map((allergy, i) => (
                      <span key={i} className="px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-sm font-medium">
                        {allergy.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chronic Conditions</label>
                {isEditing ? (
                  <input type="text" name="conditions" value={formData.conditions} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white" placeholder="e.g. Asthma, Diabetes" />
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.conditions.split(',').map((cond, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
                        {cond.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;