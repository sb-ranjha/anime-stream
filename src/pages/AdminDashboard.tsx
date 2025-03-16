import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Database, Film, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#141821] pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Anime Admin Card */}
          <Link 
            to="/admin/anime"
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Database className="h-8 w-8 text-[#f47521]" />
              <div>
                <h2 className="text-xl font-semibold text-white">Anime Management</h2>
                <p className="text-gray-400 mt-1">Manage anime series, seasons, and episodes</p>
              </div>
            </div>
          </Link>

          {/* Movie Admin Card */}
          <Link 
            to="/admin/movies"
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Film className="h-8 w-8 text-[#f47521]" />
              <div>
                <h2 className="text-xl font-semibold text-white">Movie Management</h2>
                <p className="text-gray-400 mt-1">Manage movies and their details</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <Link 
                to="/admin/anime"
                className="text-[#f47521] hover:text-[#ff8a3d] transition-colors flex items-center gap-2"
              >
                <span>Add New Anime</span>
              </Link>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <Link 
                to="/admin/movies"
                className="text-[#f47521] hover:text-[#ff8a3d] transition-colors flex items-center gap-2"
              >
                <span>Add New Movie</span>
              </Link>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <Link 
                to="/admin/settings"
                className="text-[#f47521] hover:text-[#ff8a3d] transition-colors flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 