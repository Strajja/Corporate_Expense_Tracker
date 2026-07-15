'use client';

import React from 'react';
import { Expense } from '../data/mockData';

interface PendingApprovalsProps {
  expenses: Expense[];
  onAction: (id: string, status: 'approved' | 'rejected') => void;
}

export default function PendingApprovals({ expenses, onAction }: PendingApprovalsProps) {
  // Filters data and renders an actionable list for managers to quickly process requests.
  const pending = expenses.filter(e => e.status === 'pending');

  if (pending.length === 0) return null;

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full"
    >
      <h2
        className="text-xl font-bold text-gray-900 mb-4"
      >
        Pending Requests ({pending.length})
      </h2>
      <div
        className="space-y-4"
      >
        {pending.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
          >
            <div>
              <p
                className="font-semibold text-gray-900"
              >
                {item.description}
              </p>
              <p
                className="text-sm text-gray-500"
              >
                {item.category} • ${item.amount.toFixed(2)}
              </p>
            </div>
            <div
              className="flex gap-2"
            >
              <button 
                onClick={() => onAction(item.id, 'rejected')}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition"
              >
                Reject
              </button>
              <button 
                onClick={() => onAction(item.id, 'approved')}
                className="px-3 py-1.5 text-sm font-medium text-white bg-[#8e082d] hover:bg-red-900 rounded-md transition"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}