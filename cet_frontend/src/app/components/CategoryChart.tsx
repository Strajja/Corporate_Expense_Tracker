'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface CategoryChartProps {
  expenses: Expense[];
}

// Defines the color palette for the pie chart cells
const COLORS = ['#8e082d', '#111827', '#4b5563', '#71717a', '#27272a', '#be123c']; 

/**
 * CategoryChart Component
 * Renders a Pie Chart showing the distribution of expenses across different categories.
 * It displays the top 5 categories and groups the rest into an "Other" category.
 */
export default function CategoryChart({ expenses }: CategoryChartProps) {
  // Extract unique categories from the expenses array
  const uniqueCategories = Array.from(new Set(expenses.map(t => t.category)));

  // Calculate the total amount spent per category
  const rawData = uniqueCategories.map((category) => ({
    name: category,
    value: expenses
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0)
  }));

  // Sort categories by value in descending order and keep the top 5
  const top5 = rawData.sort((a, b) => b.value - a.value).slice(0, 5);
  
  // Group remaining categories into "Other" if they exist
  const other = rawData.slice(5).reduce((sum, item) => sum + item.value, 0);
  if (other > 0) {
    top5.push({ name: "Other", value: other });
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full h-[350px] flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Expense Distribution
      </h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={top5}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {top5.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '14px', fontWeight: '500' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}