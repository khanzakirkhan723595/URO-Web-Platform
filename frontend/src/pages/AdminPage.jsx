// src/pages/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboardStats, getAllFeedbackAdmin, replyToFeedbackAdmin, updateFeedbackStatusAdmin, getAllUsersAdmin, updateUserRoleAdmin } from '../services/api';
import { Briefcase, MessageSquare, Users, BarChartHorizontalBig, Edit3, Send, Eye, Archive, UserCheck, UserX } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 border-${color}-500`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-semibold text-gray-800">{value ?? 'N/A'}</p>
      </div>
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const FeedbackItem = ({ feedback, onReply, onUpdateStatus }) => {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(feedback._id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg shadow mb-4 border border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm text-slate-600">
            <span className="font-semibold">{feedback.user?.name || 'Anonymous User'}</span> ({feedback.user?.email || 'No email'})
            {' for '} <span className="font-medium text-blue-600">{feedback.modelName}</span>
          </p>
          <p className="text-xs text-slate-400">
            {new Date(feedback.createdAt).toLocaleString()} - Rating: {'⭐'.repeat(feedback.rating)}{'⚫'.repeat(5 - feedback.rating)}
          </p>
        </div>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            feedback.status === 'new' ? 'bg-yellow-100 text-yellow-700' :
            feedback.status === 'seen' ? 'bg-blue-100 text-blue-700' :
            feedback.status === 'replied' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
        }`}>
            {feedback.status}
        </span>
      </div>
      <p className="text-slate-700 mb-2">{feedback.comment || "No comment provided."}</p>
      
      {feedback.adminReply && (
        <div className="mt-2 p-3 bg-blue-50 border-l-2 border-blue-400 rounded-r-md">
          <p className="text-xs font-semibold text-blue-700">Admin Reply (by {feedback.repliedBy?.name || 'Admin'} on {new Date(feedback.repliedAt).toLocaleDateString()}):</p>
          <p className="text-sm text-blue-600">{feedback.adminReply}</p>
        </div>
      )}

      <div className="mt-3 flex items-center space-x-2">
        {!isReplying && !feedback.adminReply && feedback.status !== 'replied' && (
          <button onClick={() => setIsReplying(true)} className="btn-secondary text-xs px-2 py-1 flex items-center">
            <Edit3 size={14} className="mr-1" /> Reply
          </button>
        )}
        {feedback.status === 'new' && (
             <button onClick={() => onUpdateStatus(feedback._id, 'seen')} className="btn-secondary text-xs px-2 py-1 flex items-center">
                <Eye size={14} className="mr-1" /> Mark as Seen
            </button>
        )}
        {feedback.status !== 'archived' && (
            <button onClick={() => onUpdateStatus(feedback._id, 'archived')} className="btn-secondary text-xs px-2 py-1 flex items-center">
                <Archive size={14} className="mr-1" /> Archive
            </button>
        )}
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} className="mt-3 space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Your reply..."
            rows="2"
            className="input-field w-full text-sm p-2"
            required
          />
          <div className="flex space-x-2">
            <button type="submit" className="btn-primary text-xs px-3 py-1 flex items-center">
              <Send size={14} className="mr-1" /> Send Reply
            </button>
            <button type="button" onClick={() => setIsReplying(false)} className="btn-secondary text-xs px-3 py-1">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const UserItem = ({ user, onUpdateRole }) => {
    return (
        <div className="bg-slate-50 p-4 rounded-lg shadow mb-4 border border-slate-200 flex justify-between items-center">
            <div>
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="text-xs text-slate-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-slate-400">Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
                <p className="text-xs text-slate-400">Page Hits: {user.pageHits || 0}</p>
            </div>
            <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {user.role}
                </span>
                {user.role === 'user' && (
                    <button 
                        onClick={() => onUpdateRole(user._id, 'admin')} 
                        title="Make Admin"
                        className="p-1.5 text-slate-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-100">
                        <UserCheck size={18}/>
                    </button>
                )}
                {user.role === 'admin' && (
                     <button 
                        onClick={() => onUpdateRole(user._id, 'user')} 
                        title="Make User"
                        className="p-1.5 text-slate-500 hover:text-green-600 transition-colors rounded-full hover:bg-green-100">
                        <UserX size={18}/>
                    </button>
                )}
            </div>
        </div>
    );
};


const AdminPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  // const [contactRequests, setContactRequests] = useState([]);
  // const [teamApplications, setTeamApplications] = useState([]);
  // const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, feedbackRes, usersRes] = await Promise.all([
        getAdminDashboardStats(),
        getAllFeedbackAdmin(),
        getAllUsersAdmin()
        // TODO: Add calls for contact requests, team applications, recent activity
      ]);

      if (statsRes.status === 'success') setStats(statsRes.data);
      else console.warn("Failed to load admin stats:", statsRes.message);

      if (feedbackRes.status === 'success') setFeedbacks(feedbackRes.data.feedbacks);
      else console.warn("Failed to load feedback:", feedbackRes.message);

      if (usersRes.status === 'success') setUsers(usersRes.data.users);
      else console.warn("Failed to load users:", usersRes.message);

    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setError(err.message || "Could not load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReplyToFeedback = async (feedbackId, adminReply) => {
    try {
      const res = await replyToFeedbackAdmin(feedbackId, adminReply);
      if (res.status === 'success') {
        setFeedbacks(prev => prev.map(fb => fb._id === feedbackId ? res.data.feedback : fb));
      } else {
        alert(`Error replying: ${res.message}`);
      }
    } catch (err) {
      alert(`Error replying: ${err.message}`);
    }
  };

  const handleUpdateFeedbackStatus = async (feedbackId, status) => {
    try {
        const res = await updateFeedbackStatusAdmin(feedbackId, status);
        if (res.status === 'success') {
            setFeedbacks(prev => prev.map(fb => fb._id === feedbackId ? res.data.feedback : fb));
        } else {
            alert(`Error updating status: ${res.message}`);
        }
    } catch (err) {
        alert(`Error updating status: ${err.message}`);
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${role}?`)) return;
    try {
        const res = await updateUserRoleAdmin(userId, role);
        if (res.status === 'success') {
            setUsers(prev => prev.map(u => u._id === userId ? res.data.user : u));
        } else {
            alert(`Error updating user role: ${res.message}`);
        }
    } catch (err) {
        alert(`Error updating user role: ${err.message}`);
    }
  };


  if (loading) {
    return <div className="p-8 text-center text-lg font-medium text-slate-600">Loading Admin Dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600 bg-red-50 rounded-md shadow">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-100 min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome, {user?.name || 'Admin'}. Oversee and manage your site.</p>
      </header>

      {/* Stats Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Site Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <StatCard title="Total Page Hits" value={stats?.totalPageHits} icon={BarChartHorizontalBig} color="blue" />
          <StatCard title="Unique Visitors (IPs)" value={stats?.totalUniqueIPs} icon={Users} color="green" />
          <StatCard title="Registered Users" value={stats?.totalRegisteredUsers} icon={Users} color="purple" />
          <StatCard title="Total Feedback" value={stats?.totalFeedbackItems} icon={MessageSquare} color="yellow" />
          <StatCard title="New Feedback" value={stats?.newFeedbackItems} icon={MessageSquare} color="red" />
        </div>
      </section>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Feedback Management Section */}
        <section className="lg:col-span-7 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-700 mb-6">User Feedback</h2>
            {feedbacks.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
                    {feedbacks.map(fb => (
                        <FeedbackItem 
                            key={fb._id} 
                            feedback={fb} 
                            onReply={handleReplyToFeedback}
                            onUpdateStatus={handleUpdateFeedbackStatus}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-slate-500">No feedback submissions yet.</p>
            )}
        </section>

        {/* User Management Section */}
        <section className="lg:col-span-5 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-700 mb-6">User Management</h2>
            {users.length > 0 ? (
                 <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
                    {users.map(u => (
                        <UserItem key={u._id} user={u} onUpdateRole={handleUpdateUserRole} />
                    ))}
                </div>
            ) : (
                <p className="text-slate-500">No users found.</p>
            )}
        </section>
      </div>


      {/* Placeholder for Contact/Team Requests and Recent Activity */}
      <section className="mt-10 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Other Management Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg shadow">
                <h3 className="text-xl font-medium text-blue-600 mb-2">Contact Requests</h3>
                <p className="text-slate-500 text-sm">Functionality to view and manage contact form submissions will be here.</p>
                {/* <Link to="/admin/contact-requests" className="text-blue-500 hover:underline mt-2 inline-block text-sm">View Contact Requests</Link> */}
            </div>
            <div className="bg-slate-50 p-4 rounded-lg shadow">
                <h3 className="text-xl font-medium text-blue-600 mb-2">Team Applications</h3>
                <p className="text-slate-500 text-sm">Interface to review applications to join the team.</p>
                {/* <Link to="/admin/team-applications" className="text-blue-500 hover:underline mt-2 inline-block text-sm">View Applications</Link> */}
            </div>
             <div className="bg-slate-50 p-4 rounded-lg shadow md:col-span-2">
                <h3 className="text-xl font-medium text-blue-600 mb-2">Recent Site Activity</h3>
                <p className="text-slate-500 text-sm">A log of important events or actions (e.g., new user signups, model runs by users, admin actions).</p>
            </div>
        </div>
      </section>

    </div>
  );
};

export default AdminPage;
