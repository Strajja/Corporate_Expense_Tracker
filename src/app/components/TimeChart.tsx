'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Expense } from '../data/mockData';

interface TimeChartProps {
    expenses: Expense[];
}

export default function TimeChart({ expenses }: TimeChartProps) {
    const dnevniTroskovi = expenses.reduce((acc: { [key: string]: number }, expense) => {
        if (!acc[expense.date]) acc[expense.date] = 0;
        acc[expense.date] += expense.amount;
        return acc;
    }, {});

    const podaci = Object.entries(dnevniTroskovi)
        .map(([datum, iznos]) => ({ datum, iznos }))
        .sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full h-[350px] flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Potrošnja kroz vreme</h2>
            <div className="w-full h-full overflow-x-auto">
                <div className="min-w-[600px] h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={podaci} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="datum" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `$${value}`} />
                            <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ukupno']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f3f4f6' }} />
                            <Bar dataKey="iznos" fill="#8e082d" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}