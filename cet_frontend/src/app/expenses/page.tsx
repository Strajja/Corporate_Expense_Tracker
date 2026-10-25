'use client';

import ExpenseForm from "@/app/components/ExpenseForm";
import RecentExpenses from "../components/RecentExpenses";
import { useState, useEffect, useRef } from "react";
import api from "@/services/api";
import { Expense } from "../data/mockData";

/**
 * ExpensePage Component
 * Provides a comprehensive layout for managing, filtering, adding, and viewing user expenses.
 */
export default function ExpensePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  
  // Filtering states
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sorting states
  const [sortAscending, setSortAscending] = useState(true);
  const [sortCriterion, setSortCriterion] = useState("description");
  
  // Dropdown UI states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize view by fetching data
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Handle outside clicks to close open dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Retrieves user expenses from the server and updates state.
   */
  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      const rawData = Array.isArray(response.data?.content) 
        ? response.data.content 
        : (Array.isArray(response.data) ? response.data : []);
      
      const mapped = rawData.map((item: any) => ({
        ...item,
        id: String(item.id),
        status: item.status ? item.status.toLowerCase() : 'pending'
      }));
      
      setExpenses(mapped);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    }
  };

  /**
   * Handles POST (create) and PUT (update) requests for the expense entity.
   */
  const handleSaveExpense = async (formData: { description: string; amount: number; category: string }) => {
    try {
      const categoryMap: { [key: string]: string } = {
        "Representation": "REPRESENTATION",
        "Transport": "TRANSPORTATION",
        "Equipment": "EQUIPMENT",
        "Education": "EDUCATION"
      };
      const backendCategory = categoryMap[formData.category] || formData.category.toUpperCase();

      const payload = {
        description: formData.description,
        amount: formData.amount,
        category: backendCategory,
        date: expenseToEdit ? expenseToEdit.date : new Date().toISOString().split('T')[0]
      };

      if (expenseToEdit) {
        const response = await api.put(`/expenses/${expenseToEdit.id}`, payload);
        const updatedExp = {
          ...response.data,
          id: String(response.data.id),
          status: response.data.status ? response.data.status.toLowerCase() : 'pending'
        };
        
        setExpenses(expenses.map(exp => exp.id === expenseToEdit.id ? updatedExp : exp));
        setExpenseToEdit(null);
      } else {
        const response = await api.post('/expenses', payload);
        if (response.data) {
          const newExp = {
            ...response.data,
            id: String(response.data.id),
            status: response.data.status ? response.data.status.toLowerCase() : 'pending'
          };
          setExpenses([newExp, ...expenses]);
        }
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  /**
   * Deletes a specific expense record.
   */
  const handleDeleteExpense = async (idToDelete: string) => {
    try {
      await api.delete(`/expenses/${idToDelete}`);
      setExpenses(expenses.filter((expense) => expense.id !== idToDelete));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Pipeline for filtering constraints
  const filteredExpenses = expenses
    .filter((expense) => categoryFilter === "All" || expense.category.toLowerCase() === categoryFilter.toLowerCase() || (categoryFilter === "Transport" && expense.category === "TRANSPORTATION"))
    .filter((expense) => statusFilter === "All Statuses" || expense.status.toLowerCase() === statusFilter.toLowerCase())
    .filter((expense) => expense.description.toLowerCase().includes(searchQuery.toLowerCase()));

  // Sorting logic based on selected criterion
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
  const totalExpenseAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  /**
   * Maps status strings to Tailwind visual cues.
   */
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
    <div className="p-8 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Expense Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Header Metric Card */}
          <div className="bg-[#8e082d] text-white p-6 rounded-xl shadow-sm mb-8 flex justify-between items-center">
            <div>
              <p className="text-sm text-white/80 uppercase tracking-wider font-bold mb-1">Total Expenses</p>
              <h2 className="text-4xl font-extrabold">${totalExpenseAmount.toFixed(2)}</h2>
            </div>
            <div className="p-4 bg-white/20 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          {/* Top Filter Row: Category & Search */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 w-full gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {["All", "Representation", "Transport", "Equipment", "Education"].map((category) => (
                <button
                  key={category}
                  onClick={() => { setCategoryFilter(category); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${categoryFilter === category ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {category}
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

          {/* Sorting and Secondary Filters */}
          <div className="flex justify-between items-center mb-6 w-full">
            <div className="relative z-20" ref={statusDropdownRef}>
              <button
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsSortDropdownOpen(false);
                }}
                className={`px-4 py-2 border rounded-full focus:ring-2 focus:ring-[#8e082d] outline-none font-bold transition-colors cursor-pointer flex items-center justify-between w-auto shadow-sm ${getStatusColor(statusFilter)}`}
              >
                {statusFilter}
                <svg className={`w-4 h-4 ml-2 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-max bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                  {["All Statuses", "pending", "approved", "rejected"].map((status) => (
                    <div
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsStatusDropdownOpen(false);
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
                    setIsStatusDropdownOpen(false);
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

          <RecentExpenses
            noResize
            data={displayData}
            onDelete={handleDeleteExpense}
            onEdit={(expense) => setExpenseToEdit(expense)}
          />

          {/* Pagination Component */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 border border-gray-200 rounded-xl shadow-sm">
              <div className="text-sm text-gray-700 font-medium">
                Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border rounded-lg text-sm font-bold transition-colors outline-none focus:ring-2 focus:ring-[#8e082d] cursor-pointer ${currentPage === 1 ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100"}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 border rounded-lg text-sm font-bold transition-colors outline-none focus:ring-2 focus:ring-[#8e082d] cursor-pointer ${currentPage === totalPages ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100"}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel Form */}
        <div className="lg:col-span-1">
          <ExpenseForm
            onSave={handleSaveExpense}
            expenseToEdit={expenseToEdit}
          />
        </div>
      </div>
    </div>
  );
}