'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface Expense {
  id: string;
  employeeFirstName?: string;
  employeeName?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

export default function ApprovalsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [editComment, setEditComment] = useState('');
  
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
  const [isStatusFilterDropdownOpen, setIsStatusFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [sortAscending, setSortAscending] = useState(true);
  const [sortCriterion, setSortCriterion] = useState("description");
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusFilterDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role');
    if (storedRole !== 'manager' && storedRole !== 'admin') {
      router.push('/');
    } else {
      fetchExpenses();
    }
  }, [router]);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses/approvals');
      const rawData = Array.isArray(response.data?.content) 
        ? response.data.content 
        : (Array.isArray(response.data) ? response.data : []);
      
      const mapped = rawData.map((item: any) => ({
        ...item,
        id: String(item.id),
        employeeName: item.employeeFirstName || 'Employee',
        status: item.status ? item.status.toLowerCase() : 'pending'
      }));
      
      setExpenses(mapped);
    } catch (err) {
      console.error('Error fetching approvals:', err);
      setExpenses([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (statusFilterDropdownRef.current && !statusFilterDropdownRef.current.contains(event.target as Node)) {
        setIsStatusFilterDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditStatus(expense.status);
    setEditComment(expense.comment || '');
    setIsStatusDropdownOpen(false);
  };

  const closeModal = () => {
    setSelectedExpense(null);
    setEditStatus('pending');
    setEditComment('');
  };

  const handleUpdateExpense = async () => {
    if (!selectedExpense) return;
    try {
      await api.patch(`/expenses/${selectedExpense.id}/status`, {
        status: editStatus.toUpperCase(),
        comment: editComment
      });

      setExpenses(prev => prev.map(exp => 
        exp.id === selectedExpense.id 
          ? { ...exp, status: editStatus, comment: editComment } 
          : exp
      ));
      closeModal();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteExpense = async (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/expenses/${idToDelete}`);
      setExpenses(prev => prev.filter(exp => exp.id !== idToDelete));
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleDeleteAllFiltered = async () => {
    try {
      await Promise.all(filteredExpenses.map(exp => api.delete(`/expenses/${exp.id}`)));
      const filteredIds = new Set(filteredExpenses.map(exp => exp.id));
      setExpenses(prev => prev.filter(exp => !filteredIds.has(exp.id)));
      setIsDeleteAllConfirmOpen(false);
    } catch (err) {
      console.error('Error deleting filtered expenses:', err);
    }
  };

  const filteredExpenses = expenses
    .filter((expense) => categoryFilter === "All" || expense.category.toLowerCase() === categoryFilter.toLowerCase() || (categoryFilter === "Transport" && expense.category === "TRANSPORTATION"))
    .filter((expense) => statusFilter === "All Statuses" || expense.status.toLowerCase() === statusFilter.toLowerCase())
    .filter((expense) => expense.description.toLowerCase().includes(searchQuery.toLowerCase()) || (expense.employeeName && expense.employeeName.toLowerCase().includes(searchQuery.toLowerCase())));

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let result = 0;
    if (sortCriterion === "amount") {
      result = a.amount - b.amount;
    } else if (sortCriterion === "description") {
      result = a.description.localeCompare(b.description);
    } else if (sortCriterion === "date") {
      result = a.date.localeCompare(b.date);
    }
    return sortAscending ? result : result * -1;
  });

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const displayData = sortedExpenses.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage) || 1;

  const getStatusColor = (status: string) => {
    const s = status ? status.toLowerCase() : '';
    switch (s) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-white text-gray-700 border-gray-300';
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

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Request Management</h1>
          <p className="text-gray-500 mt-1">Review, approve, and reject submitted employee expenses.</p>
        </div>
        {filteredExpenses.length > 0 && (
          <button
            onClick={() => setIsDeleteAllConfirmOpen(true)}
            className="bg-[#8e082d] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-red-900 transition-colors shadow-sm cursor-pointer"
          >
            Delete all on list ({filteredExpenses.length})
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {["All", "Representation", "Transport", "Equipment", "Education"].map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${categoryFilter === cat ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {cat}
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
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search..."
            className="w-48 pl-9 pr-4 py-2 text-sm font-medium border border-gray-300 rounded-full focus:ring-2 focus:ring-[#8e082d] focus:border-transparent outline-none transition-all text-gray-700 bg-gray-50/50 focus:bg-white shadow-sm"
          />
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="relative z-20" ref={statusFilterDropdownRef}>
          <button
            onClick={() => {
              setIsStatusFilterDropdownOpen(!isStatusFilterDropdownOpen);
              setIsSortDropdownOpen(false);
            }}
            className={`px-4 py-2 border rounded-full focus:ring-2 focus:ring-[#8e082d] outline-none font-bold transition-colors cursor-pointer flex items-center justify-between w-auto shadow-sm ${getStatusColor(statusFilter)}`}
          >
            {statusFilter}
            <svg className={`w-4 h-4 ml-2 transition-transform ${isStatusFilterDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isStatusFilterDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-max bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
              {["All Statuses", "pending", "approved", "rejected"].map((status) => (
                <div
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setIsStatusFilterDropdownOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-3 cursor-pointer text-sm font-bold transition-colors hover:bg-gray-100 ${statusFilter === status ? "bg-gray-50 text-[#8e082d]" : "text-gray-700"}`}
                >
                  {status}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 z-10">
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => {
                setIsSortDropdownOpen(!isSortDropdownOpen);
                setIsStatusFilterDropdownOpen(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#8e082d] outline-none font-bold text-gray-700 bg-white cursor-pointer flex items-center justify-between w-auto transition-colors shadow-sm text-sm"
            >
              {sortCriterion === "date" ? "Date" : sortCriterion === "amount" ? "Amount" : "Description (A-Z)"}
              <svg className={`w-4 h-4 ml-2 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isSortDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-full min-w-max bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                {[
                  { id: "description", name: "Description (A-Z)" },
                  { id: "date", name: "Date" },
                  { id: "amount", name: "Amount" }
                ].map((option) => (
                  <div
                    key={option.id}
                    onClick={() => {
                      setSortCriterion(option.id);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`px-4 py-3 cursor-pointer text-sm font-bold transition-colors hover:bg-gray-100 ${sortCriterion === option.id ? "bg-gray-50 text-[#8e082d]" : "text-gray-700"}`}
                  >
                    {option.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="p-2 border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#8e082d] outline-none cursor-pointer shadow-sm"
          >
            <svg className={`w-6 h-6 transition-transform duration-300 ${sortAscending ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full relative">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Expenses</h2>
        <div className="min-w-[600px] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="pb-3 font-medium">Employee</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {displayData.map((expense) => (
                <tr
                  key={expense.id}
                  onClick={() => openModal(expense)}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="py-4 font-semibold text-gray-900">{expense.employeeName}</td>
                  <td className="py-4">
                    <div className="max-w-[180px] overflow-x-auto whitespace-nowrap font-medium text-gray-900 pb-2 custom-scrollbar">
                      {expense.description}
                    </div>
                  </td>
                  <td className="py-4 text-gray-500">{expense.category}</td>
                  <td className="py-4 text-gray-500">{expense.date}</td>
                  <td className="py-4 text-gray-900 font-bold">${expense.amount.toFixed(2)}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="py-4 whitespace-nowrap text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openModal(expense)}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDeleteExpense(expense.id, e)}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold hover:bg-red-200 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 font-medium">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 border border-gray-200 rounded-xl shadow-sm">
            <div className="text-sm text-gray-700 font-medium">
              Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg text-sm font-bold transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg text-sm font-bold transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Expense Details</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</label>
                  <p className="mt-1 font-semibold text-gray-900">{selectedExpense.employeeName}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Description</label>
                  <p className="mt-1 text-gray-900 text-base leading-relaxed whitespace-pre-wrap">{selectedExpense.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                    <p className="mt-1 font-medium text-gray-900">{selectedExpense.category}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
                    <p className="mt-1 font-medium text-gray-900">{selectedExpense.date}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</label>
                    <p className="mt-1 font-bold text-[#8e082d] text-lg">${selectedExpense.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedExpense.status)}`}>
                        {selectedExpense.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border-2 border-[#8e082d] rounded-xl font-bold text-sm text-gray-900 shadow-sm cursor-pointer"
                    >
                      <span className="capitalize">{editStatus}</span>
                      <svg className={`h-4 w-4 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isStatusDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                        {statusOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => {
                              setEditStatus(option.value as any);
                              setIsStatusDropdownOpen(false);
                            }}
                            className={`px-4 py-3 cursor-pointer text-sm font-bold transition-colors hover:bg-gray-100 ${editStatus === option.value ? 'bg-gray-50 text-[#8e082d]' : 'text-gray-700'}`}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manager Comment</label>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8e082d] outline-none text-gray-900 resize-none shadow-sm text-sm"
                    placeholder="Enter reason for rejection or approval note..."
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateExpense}
                className="bg-[#8e082d] text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-red-900 transition-colors shadow-sm cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteAllConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Delete Confirmation</h3>
                <button onClick={() => setIsDeleteAllConfirmOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Are you sure you want to delete all displayed (filtered) expenses? This action cannot be undone.
              </p>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setIsDeleteAllConfirmOpen(false)}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAllFiltered}
                className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}