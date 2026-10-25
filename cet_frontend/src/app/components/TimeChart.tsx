'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface TimeChartProps {
  expenses: Expense[];
}

/**
 * TimeChart Component
 * Visualizes expenses aggregated by date using a responsive bar chart from Recharts.
 */
export default function TimeChart({ expenses }: TimeChartProps) {
  // Aggregates expenses by date to calculate the total spent each day.
  const dailyExpenses = expenses.reduce((acc: { [key: string]: number }, expense) => {
    if (!acc[expense.date]) acc[expense.date] = 0;
    acc[expense.date] += expense.amount;
    return acc;
  }, {});

  // Convert the aggregated object into an array and sort it chronologically
  const data = Object.entries(dailyExpenses)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full h-[350px] flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Expenses Over Time
      </h2>
      <div className="w-full h-full overflow-x-auto">
        <div className="min-w-[600px] h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey="amount" fill="#8e082d" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}