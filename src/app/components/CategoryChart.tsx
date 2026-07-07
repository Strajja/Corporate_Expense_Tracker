'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense } from '../data/mockData';

interface CategoryChartProps {
    expenses: Expense[];
}

const BOJE = ['#8e082d', '#111827', '#4b5563', '#71717a', '#27272a', '#be123c']; 

export default function CategoryChart({ expenses }: CategoryChartProps) {
    const unikatneKategorije = Array.from(new Set(expenses.map(t => t.category)));

    const podaciRaw = unikatneKategorije.map((kategorija) => ({
        name: kategorija,
        value: expenses.filter(t => t.category === kategorija).reduce((sum, t) => sum + t.amount, 0)
    }));

    const top5 = podaciRaw.sort((a, b) => b.value - a.value).slice(0, 5);
    const ostalo = podaciRaw.slice(5).reduce((sum, item) => sum + item.value, 0);
    
    if (ostalo > 0) top5.push({ name: "Ostalo", value: ostalo });

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full h-[350px] flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Raspodela troškova</h2>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={top5} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                            {top5.map((entry, index) => <Cell key={`cell-${index}`} fill={BOJE[index % BOJE.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: '500' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}