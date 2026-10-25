'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import SummaryCard from "./components/SummaryCard";
import CategoryChart from "./components/CategoryChart";
import TopExpensesTable from "./components/TopExpensesTable";
import TimeChart from "./components/TimeChart";
import PendingApprovals from "./components/PendingApprovals";

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Dashboard Component
 * Serves as the main landing page post-login. Displays high-level analytics, charts, and quick-action widgets based on the user's role.
 */
export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  // Validate session presence and role, then hydrate the dashboard with expense data
  useEffect(() => {
    const storedRole = localStorage.getItem('user_role');
    const storedUsername = localStorage.getItem('username');

    if (!storedRole || !storedUsername) {
      router.push('/auth');
    } else {
      const currentRole = storedRole.toLowerCase();
      setRole(currentRole);
      setUsername(storedUsername);

      const endpoint = (currentRole === 'manager' || currentRole === 'admin') 
        ? '/expenses/approvals' 
        : '/expenses';

      api.get(endpoint)
        .then(response => {
          const rawData = Array.isArray(response.data?.content) 
            ? response.data.content 
            : (Array.isArray(response.data) ? response.data : []);
          
          const mapped = rawData.map((item: any) => ({
            ...item,
            id: String(item.id),
            amount: parseFloat(item.amount) || 0,
            status: item.status ? String(item.status).trim().toLowerCase() : 'pending'
          }));
          
          setExpenses(mapped);
        })
        .catch(error => {
          console.error('Error fetching dashboard expenses:', error);
          setExpenses([]);
        });
    }
  }, [router]);

  /**
   * Submits quick status updates from the dashboard widget.
   */
  const handleExpenseUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await api.patch(`/expenses/${id}/status`, { status: newStatus.toUpperCase() });
      setExpenses(prev => prev.map(exp => 
        exp.id === id ? { ...exp, status: newStatus } : exp
      ));
    } catch (error) {
      console.error('Error updating expense status:', error);
    }
  };

  // Prevent rendering if user context is missing
  if (!role || !username) return null;

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Calculate aggregates for Summary Cards
  const totalExpensesAmount = safeExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const approvedExpensesAmount = safeExpenses
    .filter(exp => exp.status === 'approved')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const pendingCount = safeExpenses.filter(exp => exp.status === 'pending').length;

  const canApprove = role === 'manager' || role === 'admin';

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {username}
          </h1>
          <p className="text-gray-500 mt-1">
            Logged in as: <span className="font-semibold text-[#8e082d] uppercase text-sm">{role}</span>
          </p>
        </div>
      </div>

      {/* High-Level Metric Summaries */}
      <div className={`grid grid-cols-1 ${canApprove ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-8`}>
        <SummaryCard
          title="Total Expenses"
          amount={`$${totalExpensesAmount.toFixed(2)}`}
          description="Total recorded expenses"
          trend="negative"
        />
        <SummaryCard
          title="Approved Budget"
          amount={`$${approvedExpensesAmount.toFixed(2)}`}
          description="Total approved spending"
          trend="positive"
        />
        {canApprove && (
          <SummaryCard
            title="Pending Requests"
            amount={`${pendingCount} requests`}
            description="Requires action"
            trend="neutral"
          />
        )}
      </div>

      {/* Inline Approvals Widget for Managers */}
      {canApprove && (
        <div className="mb-8">
          <PendingApprovals
            expenses={safeExpenses}
            onAction={handleExpenseUpdate}
          />
        </div>
      )}

      {/* Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <CategoryChart expenses={safeExpenses} />
        <TopExpensesTable expenses={safeExpenses} />
      </div>

      <div className="w-full">
        <TimeChart expenses={safeExpenses} />
      </div>
    </div>
  );
}