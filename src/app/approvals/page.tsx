'use client';

import { useState, useEffect, useRef } from 'react';

interface Expense {
  id: string;
  employeeName: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

const initialExpenses: Expense[] = [
  { 
    id: '1', 
    employeeName: 'Marko Markovic', 
    description: 'Conference registration', 
    amount: 350.00, 
    category: 'Education', 
    date: '2026-07-01', 
    status: 'pending' 
  },
  { 
    id: '2', 
    employeeName: 'Jelena Jelic', 
    description: 'Business lunch with client', 
    amount: 120.50, 
    category: 'Representation', 
    date: '2026-07-05', 
    status: 'pending' 
  },
  { 
    id: '3', 
    employeeName: 'Nikola Nikolic', 
    description: 'Taxi to airport', 
    amount: 45.00, 
    category: 'Transport', 
    date: '2026-07-08', 
    status: 'pending' 
  },
  { 
    id: '4', 
    employeeName: 'Ana Anic', 
    description: 'Software license', 
    amount: 99.00, 
    category: 'Equipment', 
    date: '2026-07-10', 
    status: 'approved' 
  },
  { 
    id: '5', 
    employeeName: 'Marko Markovic', 
    description: 'Office supplies', 
    amount: 85.20, 
    category: 'Equipment', 
    date: '2026-07-11', 
    status: 'rejected', 
    comment: 'Monthly equipment budget exceeded.' 
  },
  { 
    id: '6', 
    employeeName: 'Jovan Jovanovic', 
    description: 'Hotel accommodation', 
    amount: 450.00, 
    category: 'Travel', 
    date: '2026-07-12', 
    status: 'pending' 
  },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

export default function ApprovalsPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [editComment, setEditComment] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [userFormRole, setUserFormRole] = useState<'employee' | 'manager' | null>(null);
  const [generatedCodeMessage, setGeneratedCodeMessage] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 4;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = expenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  useEffect(() => {
    // Closes the dropdown menu if the user clicks outside of it.
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openModal = (expense: Expense) => {
    // Opens the modal and sets the state for the selected expense to be edited.
    setSelectedExpense(expense);
    setEditStatus(expense.status);
    setEditComment(expense.comment || '');
    setIsStatusDropdownOpen(false);
  };

  const closeModal = () => {
    // Closes the modal and resets the editing state variables.
    setSelectedExpense(null);
    setEditStatus('pending');
    setEditComment('');
  };

  const handleUpdateExpense = () => {
    // Updates the expense array with the newly selected status and comment.
    if (!selectedExpense) return;
    setExpenses(prev => prev.map(exp => 
      exp.id === selectedExpense.id 
        ? { ...exp, status: editStatus, comment: editComment } 
        : exp
    ));
    closeModal();
  };

  const getStatusStyle = (status: string) => {
    // Returns the appropriate Tailwind CSS classes based on the expense status.
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    // Returns the formatted text label for the corresponding status string.
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const handleUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevents default form submission, generates a mock invitation code, and displays a success message.
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const code = 'SAP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setGeneratedCodeMessage(`Success! Generated code ${code} was sent to: ${email}`);
    e.currentTarget.reset();
    setTimeout(() => setGeneratedCodeMessage(''), 8000);
  };

  return (
    <div
      className="p-8 w-full max-w-7xl mx-auto space-y-12"
    >
      <section>
        <div
          className="mb-6"
        >
          <h1
            className="text-3xl font-bold text-gray-900"
          >
            Request Management
          </h1>
          <p
            className="text-gray-500 mt-1"
          >
            Review, approve, and reject submitted employee expenses.
          </p>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <table
            className="w-full text-left border-collapse"
          >
            <thead>
              <tr
                className="bg-gray-50 border-b border-gray-100"
              >
                <th
                  className="px-6 py-4 text-sm font-semibold text-gray-600"
                >
                  Employee
                </th>
                <th
                  className="px-6 py-4 text-sm font-semibold text-gray-600"
                >
                  Date
                </th>
                <th
                  className="px-6 py-4 text-sm font-semibold text-gray-600"
                >
                  Category
                </th>
                <th
                  className="px-6 py-4 text-sm font-semibold text-gray-600"
                >
                  Amount
                </th>
                <th
                  className="px-6 py-4 text-sm font-semibold text-gray-600"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((expense) => (
                <tr 
                  key={expense.id} 
                  onClick={() => openModal(expense)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td
                    className="px-6 py-4 text-sm font-medium text-gray-900"
                  >
                    {expense.employeeName}
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-gray-600"
                  >
                    {expense.date}
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-gray-600"
                  >
                    {expense.category}
                  </td>
                  <td
                    className="px-6 py-4 text-sm font-bold text-gray-900"
                  >
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td
                    className="px-6 py-4"
                  >
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(expense.status)}`}
                    >
                      {getStatusLabel(expense.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white"
          >
            <span
              className="text-sm text-gray-500"
            >
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, expenses.length)} of {expenses.length} requests
            </span>
            <div
              className="flex gap-2"
            >
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        className="pt-8 border-t border-gray-200"
      >
        <div
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h2
              className="text-2xl font-bold text-gray-900"
            >
              User Management
            </h2>
            <p
              className="text-gray-500 mt-1"
            >
              Send invitation codes to register new system members.
            </p>
          </div>
          <div
            className="flex gap-4"
          >
            <button 
              onClick={() => setUserFormRole('employee')}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition shadow-sm ${userFormRole === 'employee' ? 'bg-[#8e082d] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              + Add Employee
            </button>
            <button 
              onClick={() => setUserFormRole('manager')}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition shadow-sm ${userFormRole === 'manager' ? 'bg-[#8e082d] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              + Add Manager
            </button>
          </div>
        </div>

        {generatedCodeMessage && (
          <div
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg font-medium"
          >
            {generatedCodeMessage}
          </div>
        )}

        {userFormRole && (
          <div
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          >
            <h3
              className="text-lg font-bold text-gray-900 mb-6"
            >
              Data Entry for New {userFormRole === 'employee' ? 'Employee' : 'Manager'}
            </h3>
            <form
              onSubmit={handleUserSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  System User ID
                </label>
                <input
                  required
                  type="text"
                  name="userId"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900"
                  placeholder="e.g. EMP-1045"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900"
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  First Name
                </label>
                <input
                  required
                  type="text"
                  name="firstName"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Last Name
                </label>
                <input
                  required
                  type="text"
                  name="lastName"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Date of Birth
                </label>
                <input
                  required
                  type="date"
                  name="dob"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Hire Date
                </label>
                <input
                  required
                  type="date"
                  name="hireDate"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900"
                />
              </div>
              <div
                className="md:col-span-2 flex justify-end mt-4"
              >
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#8e082d] hover:bg-red-900 text-white font-medium rounded-lg transition shadow-sm"
                >
                  Generate & Send Code
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {selectedExpense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            <div
              className="flex items-center justify-between px-8 py-6 border-b border-gray-100"
            >
              <h2
                className="text-xl font-bold text-gray-900"
              >
                Expense Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div
              className="px-8 py-6 space-y-6"
            >
              <div
                className="grid grid-cols-2 gap-8 bg-gray-50 p-6 rounded-xl border border-gray-100"
              >
                <div>
                  <p
                    className="text-sm text-gray-500 mb-1"
                  >
                    Employee
                  </p>
                  <p
                    className="text-lg font-bold text-gray-900"
                  >
                    {selectedExpense.employeeName}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm text-gray-500 mb-1"
                  >
                    Amount
                  </p>
                  <p
                    className="text-lg font-bold text-gray-900"
                  >
                    ${selectedExpense.amount.toFixed(2)}
                  </p>
                </div>
                <div
                  className="col-span-2"
                >
                  <p
                    className="text-sm text-gray-500 mb-1"
                  >
                    Expense Description
                  </p>
                  <p
                    className="text-lg font-medium text-gray-900 leading-relaxed"
                  >
                    {selectedExpense.description}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm text-gray-500 mb-1"
                  >
                    Category
                  </p>
                  <p
                    className="font-medium text-gray-900"
                  >
                    {selectedExpense.category}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm text-gray-500 mb-1"
                  >
                    Date
                  </p>
                  <p
                    className="font-medium text-gray-900"
                  >
                    {selectedExpense.date}
                  </p>
                </div>
              </div>

              <div
                className="space-y-4 pt-4"
              >
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Update Status
                  </label>
                  <div
                    className="relative"
                    ref={dropdownRef}
                  >
                    <button
                      type="button"
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-white border-2 border-[#8e082d] rounded-xl focus:outline-none text-[#111827] font-semibold text-sm transition-shadow"
                    >
                      <span>
                        {statusOptions.find(opt => opt.value === editStatus)?.label}
                      </span>
                      <svg
                        className={`h-4 w-4 text-[#111827] transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isStatusDropdownOpen && (
                      <div
                        className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg py-2"
                      >
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setEditStatus(option.value as any);
                              setIsStatusDropdownOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${editStatus === option.value ? 'text-[#8e082d] bg-gray-50' : 'text-[#374151] hover:bg-gray-50'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Manager Comment (Optional)
                  </label>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#8e082d] text-gray-900 resize-none"
                    placeholder="Enter reason for rejection or approval note..."
                  />
                </div>
              </div>
            </div>

            <div
              className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4"
            >
              <button
                onClick={closeModal}
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateExpense}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#8e082d] hover:bg-red-900 rounded-lg shadow-sm transition"
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