'use client';

import React, { useState } from 'react';
import { Expense } from '../data/mockData';

interface RecentExpensesProps {
  noResize?: boolean;
  data: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

export default function RecentExpenses({ noResize = false, data, onDelete, onEdit }: RecentExpensesProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const getStatusColor = (status: string) => {
    // Determines tailwind classes to render the status pill correctly.
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resizeClass = !noResize ? "resize-x overflow-auto" : "";

  return (
    <div
      className={`bg-white mt-8 p-6 rounded-xl shadow-sm border border-gray-100 ${resizeClass} w-full max-w-full min-w-[300px] relative`}
    >
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
              height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: transparent;
              border-radius: 10px;
              transition: background-color 0.3s;
          }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb {
              background-color: #e5e7eb; 
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: #d1d5db; 
          }
        `}
      </style>

      <h2
        className="text-xl font-bold text-gray-900 mb-6"
      >
        Recent Expenses
      </h2>
      <div
        className="min-w-[600px]"
      >
        <table
          className="w-full text-left border-collapse"
        >
          <thead>
            <tr
              className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider"
            >
              <th
                className="pb-3 font-medium"
              >
                Description
              </th>
              <th
                className="pb-3 font-medium"
              >
                Category
              </th>
              <th
                className="pb-3 font-medium"
              >
                Date
              </th>
              <th
                className="pb-3 font-medium"
              >
                Amount
              </th>
              <th
                className="pb-3 font-medium"
              >
                Status
              </th>
              <th
                className="pb-3 font-medium text-right"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className="text-sm"
          >
            {data.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td
                  className="py-4"
                >
                  <div 
                    onClick={() => setSelectedExpense(expense)}
                    className="max-w-[200px] overflow-x-auto whitespace-nowrap font-medium text-gray-900 cursor-pointer hover:text-[#8e082d] transition-colors pb-2 custom-scrollbar"
                    title="Click for details"
                  >
                    {expense.description}
                  </div>
                </td>
                <td
                  className="py-4 text-gray-500"
                >
                  {expense.category}
                </td>
                <td
                  className="py-4 text-gray-500"
                >
                  {expense.date}
                </td>
                <td
                  className="py-4 text-gray-900 font-bold"
                >
                  ${expense.amount.toFixed(2)}
                </td>
                <td
                  className="py-4"
                >
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(expense.status)}`}
                  >
                    {expense.status}
                  </span>
                </td>
                <td
                  className="py-4 whitespace-nowrap text-right flex justify-end gap-2"
                >
                  <button
                    onClick={() => onEdit(expense)}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-bold hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedExpense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all"
          >
            <div
              className="p-6"
            >
              <div
                className="flex justify-between items-center mb-6"
              >
                <h3
                  className="text-2xl font-bold text-gray-900"
                >
                  Expense Details
                </h3>
                <button 
                  onClick={() => setSelectedExpense(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    >
                    </path>
                  </svg>
                </button>
              </div>
              
              <div
                className="space-y-4"
              >
                <div>
                  <label
                    className="text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Full Description
                  </label>
                  <p
                    className="mt-1 text-gray-900 text-base leading-relaxed whitespace-pre-wrap"
                  >
                    {selectedExpense.description}
                  </p>
                </div>
                
                <div
                  className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100"
                >
                  <div>
                    <label
                      className="text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </label>
                    <p
                      className="mt-1 font-medium text-gray-900"
                    >
                      {selectedExpense.category}
                    </p>
                  </div>
                  <div>
                    <label
                      className="text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </label>
                    <p
                      className="mt-1 font-medium text-gray-900"
                    >
                      {selectedExpense.date}
                    </p>
                  </div>
                  <div>
                    <label
                      className="text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </label>
                    <p
                      className="mt-1 font-bold text-[#8e082d] text-lg"
                    >
                      ${selectedExpense.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label
                      className="text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </label>
                    <div
                      className="mt-1"
                    >
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedExpense.status)}`}
                      >
                        {selectedExpense.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div
              className="bg-gray-50 px-6 py-4 flex justify-end"
            >
              <button 
                onClick={() => setSelectedExpense(null)}
                className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}