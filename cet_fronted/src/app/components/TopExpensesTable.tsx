import React from 'react';
import { Expense } from '../data/mockData';

interface TopExpensesTableProps {
  expenses: Expense[];
}

export default function TopExpensesTable({ expenses }: TopExpensesTableProps) {
  // Evaluates the expenses array to extract and return the single highest expense value mapped to each category.
  const topExpensesMap = expenses.reduce((acc: { [key: string]: Expense }, expense) => {
    if (!acc[expense.category] || expense.amount > acc[expense.category].amount) {
      acc[expense.category] = expense;
    }
    return acc;
  }, {});

  const topExpenses = Object.values(topExpensesMap).sort((a, b) => b.amount - a.amount);

  if (topExpenses.length === 0) {
    return (
      <div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-[350px]"
      >
        <p
          className="text-gray-500 font-medium"
        >
          No data available to display.
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full h-[350px] flex flex-col overflow-hidden"
    >
      <h2
        className="text-xl font-bold text-gray-900 mb-4"
      >
        Top Expenses by Category
      </h2>
      <div
        className="overflow-y-auto flex-1 pr-2 custom-scrollbar"
      >
        <table
          className="w-full text-left border-collapse"
        >
          <thead>
            <tr
              className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider sticky top-0 bg-white"
            >
              <th
                className="pb-3 font-medium"
              >
                Category
              </th>
              <th
                className="pb-3 font-medium"
              >
                Main Expense (Desc)
              </th>
              <th
                className="pb-3 font-medium text-right"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody
            className="text-sm"
          >
            {topExpenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td
                  className="py-4 font-medium text-gray-900"
                >
                  {expense.category}
                </td>
                <td
                  className="py-4 text-gray-500 truncate max-w-[150px]"
                  title={expense.description}
                >
                  {expense.description}
                </td>
                <td
                  className="py-4 text-[#8e082d] font-bold text-right"
                >
                  ${expense.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}