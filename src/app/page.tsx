'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockExpenses as initialExpenses } from "./data/mockData";
import SummaryCard from "./components/SummaryCard";
import CategoryChart from "./components/CategoryChart";
import TopExpensesTable from "./components/TopExpensesTable";
import TimeChart from "./components/TimeChart";
import PendingApprovals from "./components/PendingApprovals";

export default function Dashboard() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Validates the local storage session and redirects to the auth page if missing.
    const storedRole = localStorage.getItem('user_role');
    const storedUsername = localStorage.getItem('username');

    if (!storedRole || !storedUsername) {
      router.push('/auth');
    } else {
      setRole(storedRole);
      setUsername(storedUsername);
    }
  }, [router]);

  const handleExpenseUpdate = (id: string, newStatus: 'approved' | 'rejected') => {
    // Simulates an API PATCH request by updating the local state array.
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: newStatus } : exp
    ));
  };

  const handleLogout = () => {
    // Clears the local storage session data and routes to the login screen.
    localStorage.clear();
    router.push('/auth');
  };

  if (!role || !username) return null;

  return (
    <div
      className="p-8 w-full"
    >
      <div
        className="flex justify-between items-start mb-8"
      >
        <div>
          <h1
            className="text-3xl font-bold text-gray-900"
          >
            Welcome back, {username}
          </h1>
          <p
            className="text-gray-500 mt-1"
          >
            Logged in as: <span className="font-semibold text-[#8e082d] uppercase text-sm">{role}</span>
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          Logout
        </button>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <SummaryCard
          title="Total Expenses"
          amount="$4,250.00"
          description="+12% compared to last month"
          trend="negative"
        />
        <SummaryCard
          title="Approved Budget"
          amount="$10,000.00"
          description="Available for spending"
          trend="positive"
        />
        <SummaryCard
          title="Pending Requests"
          amount="3 requests"
          description="Requires manager action"
          trend="neutral"
        />
      </div>

      {role === 'manager' && (
        <div
          className="mb-8"
        >
          <PendingApprovals
            expenses={expenses}
            onAction={handleExpenseUpdate}
          />
        </div>
      )}

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
      >
        <CategoryChart
          expenses={expenses}
        />
        <TopExpensesTable
          expenses={expenses}
        />
      </div>

      <div
        className="w-full"
      >
        <TimeChart
          expenses={expenses}
        />
      </div>
    </div>
  );
}