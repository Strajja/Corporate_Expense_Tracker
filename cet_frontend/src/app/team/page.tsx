'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

// Interface defining the structure of a User object
interface User {
  id: number;
  username: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  role: string;
  manager?: any;
  managerId?: number;
}

export default function TeamPage() {
  // State variables for managing different user lists
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState<User[]>([]);
  
  // UI state variables for tabs and forms
  const [activeTab, setActiveTab] = useState<'team' | 'all' | 'unassigned' | 'add'>('team');
  const [userFormRole, setUserFormRole] = useState<'EMPLOYEE' | 'MANAGER'>('EMPLOYEE');
  
  // State variables for feedback messages and loading status
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State variables for current user context
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // State variables for search, filtering, and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'firstName' | 'username' | 'emailAddress'>('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // State variables for confirmation modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  // State variable for viewing detailed user information
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const router = useRouter();

  // Initialize user context from local storage on component mount
  useEffect(() => {
    const role = localStorage.getItem('user_role');
    const lowerRole = role ? role.toLowerCase() : '';
    setUserRole(lowerRole);
    
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setCurrentUserId(Number(storedUserId));
    }

    // Redirect to home if no role is found, otherwise fetch initial data
    if (!lowerRole) {
      router.push('/');
    } else {
      setActiveTab('team');
      fetchData(lowerRole);
    }
  }, [router]);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auto-clear error messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /**
   * Fetches users data based on the current user's role.
   * Populates allUsers, teamMembers, and unassignedEmployees states.
   */
  const fetchData = async (role: string) => {
    try {
      const storedUserId = localStorage.getItem('user_id');
      let activeId = storedUserId ? Number(storedUserId) : currentUserId;

      // Fetch all users
      const usersRes = await api.get('/users').catch(() => ({ data: [] }));
      const usersList = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.content || []);
      setAllUsers(usersList);

      // Determine active user ID if not present in local storage
      if (!activeId && usersList.length > 0) {
        const currentUserObj = usersList.find((u: User) => u.role?.toLowerCase() === role);
        if (currentUserObj) {
          activeId = currentUserObj.id;
          setCurrentUserId(currentUserObj.id);
        }
      }

      // Fetch team members
      const teamRes = await api.get('/users/team').catch(() => ({ data: [] }));
      let fetchedTeam = Array.isArray(teamRes.data) ? teamRes.data : [];

      // If the current user is an employee, add their manager to the team view
      if (role === 'employee' && usersList.length > 0) {
        const myRecord = usersList.find((u: User) => u.id === activeId);
        const myMgrId = myRecord?.managerId || myRecord?.manager?.id;
        
        if (myMgrId) {
          const managerRecord = usersList.find((u: User) => u.id === myMgrId);
          if (managerRecord && !fetchedTeam.some((u: User) => u.id === managerRecord.id)) {
            fetchedTeam = [managerRecord, ...fetchedTeam];
          }
        }
      }
      
      setTeamMembers(fetchedTeam);

      // Fetch unassigned employees for admins and managers
      if (role === 'admin' || role === 'manager') {
        const unassignedRes = await api.get('/users/unassigned').catch(() => ({ data: [] }));
        let unassignedList = Array.isArray(unassignedRes.data) ? unassignedRes.data : [];
        if (unassignedList.length === 0 && usersList.length > 0) {
          unassignedList = usersList.filter((u: User) => u.role && u.role.toLowerCase() === 'employee' && !u.manager && !u.managerId);
        }
        setUnassignedEmployees(unassignedList);
      } else {
        setUnassignedEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  /**
   * Assigns an employee to the current manager's team.
   */
  const handleAssign = async (id: number) => {
    setMessage('');
    setError('');
    try {
      await api.patch(`/users/${id}/assign`);
      setMessage('Employee successfully assigned to team.');
      fetchData(userRole || '');
    } catch (err: any) {
      console.error('Assign error:', err);
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Failed to assign employee.');
    }
  };

  /**
   * Removes an employee from the current manager's team.
   */
  const handleUnassign = async (id: number) => {
    setMessage('');
    setError('');
    try {
      await api.patch(`/users/${id}/unassign`);
      setMessage('Employee removed from team.');
      setIsConfirmOpen(false);
      fetchData(userRole || '');
    } catch (err: any) {
      console.error('Unassign error:', err);
      setIsConfirmOpen(false);
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Failed to unassign employee.');
    }
  };

  /**
   * Permanently deletes a user from the system.
   */
  const executeDelete = async (id: number) => {
    setMessage('');
    setError('');
    try {
      await api.delete(`/users/${id}`);
      setMessage('User successfully deleted.');
      setIsConfirmOpen(false);
      fetchData(userRole || '');
    } catch (err: any) {
      console.error('Delete error:', err);
      setIsConfirmOpen(false);
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Failed to delete user.');
    }
  };

  /**
   * Opens a confirmation modal before executing critical actions.
   */
  const promptAction = (title: string, msg: string, action: () => void) => {
    setConfirmTitle(title);
    setConfirmMessage(msg);
    setConfirmAction(() => action);
    setIsConfirmOpen(true);
  };

  /**
   * Handles the submission of the form to invite a new user to the system.
   */
  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    setMessage('');
    setError('');
    setIsSubmitting(true);

    const payload = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      emailAddress: formData.get('emailAddress'),
      dateOfBirth: formData.get('dateOfBirth'),
      hireDate: formData.get('hireDate'),
      role: userFormRole
    };

    try {
      await api.post('/users/invite', payload);
      form.reset();
      setMessage(`Invitation successfully sent to ${payload.emailAddress} as ${userFormRole}.`);
      setActiveTab('team');
    } catch (err: any) {
      console.error('Invite error:', err);
      const errData = err.response?.data;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Failed to send invitation.');
      setIsSubmitting(false);
      return;
    }

    await fetchData(userRole || '');
    setIsSubmitting(false);
  };

  // Filter out admin users from the general view to prevent modification
  const filteredAllUsers = allUsers.filter(user => {
    if (user.role?.toLowerCase() === 'admin') return false;
    return true;
  });

  /**
   * Returns the corresponding list of users based on the currently active tab.
   */
  const getActiveList = () => {
    if (activeTab === 'team') return teamMembers;
    if (activeTab === 'all') return filteredAllUsers;
    if (activeTab === 'unassigned') return unassignedEmployees;
    return [];
  };

  /**
   * Memoized list of users processed with current search, role filters, and sorting rules.
   */
  const processedList = useMemo(() => {
    let list = getActiveList();

    // Apply search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u => 
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.emailAddress?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    }

    // Apply role filter
    if (roleFilter !== 'ALL') {
      list = list.filter(u => u.role?.toUpperCase() === roleFilter);
    }

    // Apply sorting
    list.sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [activeTab, teamMembers, filteredAllUsers, unassignedEmployees, searchQuery, roleFilter, sortField, sortOrder]);

  /**
   * Target users for bulk operations (excludes the currently logged-in user).
   */
  const targetUsers = useMemo(() => {
    return processedList.filter(user => user.id !== currentUserId);
  }, [processedList, currentUserId]);

  /**
   * Deletes all users currently displayed in the list, respecting permissions 
   * and preventing self-deletion.
   */
  const handleDeleteAllFromList = () => {
    promptAction(
      'Bulk Delete Confirmation',
      `Are you sure you want to delete all ${targetUsers.length} displayed users from this list?`,
      async () => {
        setIsConfirmOpen(false);
        setMessage('');
        setError('');
        try {
          for (const user of targetUsers) {
            if (userRole === 'manager') {
              // Managers can delete any employee in the targeted list
              if (user.role?.toLowerCase() === 'employee') {
                await api.delete(`/users/${user.id}`);
              }
            } else if (userRole === 'admin') {
              // Admins can delete any user in the targeted list
              await api.delete(`/users/${user.id}`);
            }
          }
          setMessage('List successfully cleared according to permissions.');
          fetchData(userRole || '');
        } catch (err: any) {
          console.error('Bulk delete error:', err);
          setError('An error occurred during bulk deletion.');
        }
      }
    );
  };

  /**
   * Helper function to determine the background and text color for role badges.
   */
  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: transparent;
              border-radius: 10px;
              transition: background-color 0.3s;
          }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #e5e7eb; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #d1d5db; }
        `}
      </style>

      {/* Header Section */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-950">
            {userRole === 'employee' ? 'Team and User Overview' : 'Team & User Management'}
          </h1>
          <p className="text-gray-500 mt-1">
            {userRole === 'employee' 
              ? 'Overview of your team members and other users in the system.' 
              : 'Manage system users, team members, and add new members.'}
          </p>
        </div>
        
        {/* Bulk Delete Button - Hidden only on 'Add Member' tab */}
        {(userRole === 'admin' || userRole === 'manager') && activeTab !== 'add' && targetUsers.length > 0 && (
          <button
            onClick={handleDeleteAllFromList}
            className="bg-[#8e082d] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-red-900 transition-colors shadow-sm cursor-pointer"
          >
            Delete all on list ({targetUsers.length})
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl flex-wrap w-fit mb-8">
        <button
          onClick={() => setActiveTab('team')}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition cursor-pointer ${
            activeTab === 'team' ? 'bg-[#8e082d] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Team ({teamMembers.length})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition cursor-pointer ${
            activeTab === 'all' ? 'bg-[#8e082d] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Users ({filteredAllUsers.length})
        </button>
        
        {(userRole === 'admin' || userRole === 'manager') && (
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition cursor-pointer ${
              activeTab === 'unassigned' ? 'bg-[#8e082d] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unassigned ({unassignedEmployees.length})
          </button>
        )}

        {(userRole === 'admin' || userRole === 'manager') && (
          <button
            onClick={() => setActiveTab('add')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition cursor-pointer ${
              activeTab === 'add' ? 'bg-[#8e082d] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            + Add Member
          </button>
        )}
      </div>

      {/* Feedback Messages */}
      {message && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg font-medium mb-6">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg font-medium mb-6">
          {error}
        </div>
      )}

      {/* Search and Filters (Visible only on list tabs) */}
      {activeTab !== 'add' && (
        <>
          <div className="flex justify-between items-center mb-6 w-full gap-4 flex-wrap">
            <div className="flex gap-2 overflow-x-auto">
              {["ALL", "EMPLOYEE", "MANAGER"].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${roleFilter === role ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {role === 'ALL' ? 'All' : role.charAt(0) + role.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="relative flex-shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full md:w-64 pl-9 pr-4 py-2 text-sm font-medium border border-gray-300 rounded-full focus:ring-2 focus:ring-[#8e082d] focus:border-transparent outline-none transition-all text-gray-700 bg-gray-50/50 focus:bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Sorting Controls */}
          <div className="flex justify-end items-center mb-6 w-full">
            <div className="flex items-center gap-2 z-10">
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#8e082d] outline-none font-bold text-gray-700 bg-white cursor-pointer flex items-center justify-between w-auto transition-colors shadow-sm text-sm"
                >
                  {sortField === "firstName" ? "Name (A-Z)" : sortField === "username" ? "Username" : "Email"}
                  <svg className={`w-4 h-4 ml-2 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full min-w-max bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                    {[
                      { id: "firstName", name: "Name (A-Z)" },
                      { id: "username", name: "Username" },
                      { id: "emailAddress", name: "Email" }
                    ].map((option) => (
                      <div
                        key={option.id}
                        onClick={() => {
                          setSortField(option.id as any);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`px-4 py-3 cursor-pointer text-sm font-bold transition-colors hover:bg-gray-100 ${sortField === option.id ? "bg-gray-50 text-[#8e082d]" : "text-gray-700"}`}
                      >
                        {option.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#8e082d] outline-none cursor-pointer shadow-sm"
              >
                <svg className={`w-6 h-6 transition-transform duration-300 ${sortOrder === 'asc' ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* My Team Tab Content */}
      {activeTab === 'team' && (
        <div className="bg-white mt-8 p-6 rounded-xl shadow-sm border border-gray-100 resize-x overflow-auto w-full max-w-full min-w-[300px] relative">
          {processedList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No team members found.</div>
          ) : (
            <div className="min-w-[600px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Username</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    {userRole !== 'employee' && (
                      <th className="pb-3 font-medium text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {processedList.map((member) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <div 
                          onClick={() => setSelectedUser(member)}
                          className="max-w-[200px] overflow-x-auto whitespace-nowrap font-medium text-gray-900 cursor-pointer hover:text-[#8e082d] transition-colors pb-2 custom-scrollbar"
                          title="Click for details"
                        >
                          {member.firstName} {member.lastName}
                        </div>
                      </td>
                      <td className="py-4 text-gray-500">{member.username}</td>
                      <td className="py-4 text-gray-500">{member.emailAddress}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      {userRole !== 'employee' && (
                        <td className="py-4 whitespace-nowrap text-right flex justify-end gap-2">
                          <button
                            onClick={() => promptAction('Removal Confirmation', 'Are you sure you want to remove this employee from the team?', () => handleUnassign(member.id))}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-bold hover:bg-gray-200 transition-colors cursor-pointer text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All Users Tab Content */}
      {activeTab === 'all' && (
        <div className="bg-white mt-8 p-6 rounded-xl shadow-sm border border-gray-100 resize-x overflow-auto w-full max-w-full min-w-[300px] relative">
          {processedList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          ) : (
            <div className="min-w-[600px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Username</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    {userRole !== 'employee' && (
                      <th className="pb-3 font-medium text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {processedList.map((user) => {
                    // Update check to allow manager to delete any employee they see on this list
                    const canManagerDelete = userRole === 'manager' && user.role?.toLowerCase() === 'employee';
                    const canAdminDelete = userRole === 'admin';
                    const canDelete = (canAdminDelete || canManagerDelete) && user.id !== currentUserId;

                    return (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4">
                          <div 
                            onClick={() => setSelectedUser(user)}
                            className="max-w-[200px] overflow-x-auto whitespace-nowrap font-medium text-gray-900 cursor-pointer hover:text-[#8e082d] transition-colors pb-2 custom-scrollbar"
                            title="Click for details"
                          >
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td className="py-4 text-gray-500">{user.username}</td>
                        <td className="py-4 text-gray-500">{user.emailAddress}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        {userRole !== 'employee' && (
                          <td className="py-4 whitespace-nowrap text-right flex justify-end gap-2">
                            {canDelete && (
                              <button
                                onClick={() => promptAction('Delete Confirmation', 'Are you sure you want to delete this user?', () => executeDelete(user.id))}
                                className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold hover:bg-red-200 transition-colors cursor-pointer text-xs"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Unassigned Employees Tab Content */}
      {activeTab === 'unassigned' && (userRole === 'admin' || userRole === 'manager') && (
        <div className="bg-white mt-8 p-6 rounded-xl shadow-sm border border-gray-100 resize-x overflow-auto w-full max-w-full min-w-[300px] relative">
          {processedList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">There are no unassigned employees available.</div>
          ) : (
            <div className="min-w-[600px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Username</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {processedList.map((emp) => (
                    <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <div 
                          onClick={() => setSelectedUser(emp)}
                          className="max-w-[200px] overflow-x-auto whitespace-nowrap font-medium text-gray-900 cursor-pointer hover:text-[#8e082d] transition-colors pb-2 custom-scrollbar"
                          title="Click for details"
                        >
                          {emp.firstName} {emp.lastName}
                        </div>
                      </td>
                      <td className="py-4 text-gray-500">{emp.username}</td>
                      <td className="py-4 text-gray-500">{emp.emailAddress}</td>
                      <td className="py-4 whitespace-nowrap text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleAssign(emp.id)}
                          className="bg-black text-white px-3 py-1 rounded-full font-bold hover:bg-gray-800 transition-colors cursor-pointer text-xs"
                        >
                          Add to My Team
                        </button>
                        <button
                          onClick={() => promptAction('Delete Confirmation', 'Are you sure you want to delete this user?', () => executeDelete(emp.id))}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold hover:bg-red-200 transition-colors cursor-pointer text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add New Member Form Tab */}
      {activeTab === 'add' && (userRole === 'admin' || userRole === 'manager') && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6 mt-8">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Add New System Member</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUserFormRole('EMPLOYEE')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                  userFormRole === 'EMPLOYEE' ? 'bg-[#8e082d] text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Employee
              </button>
              {userRole === 'admin' && (
                <button
                  type="button"
                  onClick={() => setUserFormRole('MANAGER')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                    userFormRole === 'MANAGER' ? 'bg-[#8e082d] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Manager
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input required type="text" name="firstName" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900" placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input required type="text" name="lastName" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900" placeholder="Doe" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input required type="email" name="emailAddress" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900" placeholder="email@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
              <input required type="date" name="dateOfBirth" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hire Date</label>
              <input required type="date" name="hireDate" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('team')}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`px-8 py-3 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8e082d] hover:bg-red-900 cursor-pointer'} text-white font-medium rounded-lg transition shadow-sm`}
              >
                {isSubmitting ? 'Sending...' : 'Generate & Send Code'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <p className="mt-1 text-gray-900 text-base leading-relaxed font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
                    <p className="mt-1 font-medium text-gray-900">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <p className="mt-1 font-medium text-gray-900">{selectedUser.emailAddress}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)}
                className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{confirmTitle}</h3>
                <button onClick={() => setIsConfirmOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {confirmMessage}
              </p>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction || undefined}
                className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}