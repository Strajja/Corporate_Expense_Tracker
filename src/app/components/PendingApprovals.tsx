'use client';

import React from 'react';
import { Expense } from '../data/mockData';

interface PendingApprovalsProps {
    expenses: Expense[];
    onAction: (id: string, status: 'Odobreno' | 'Odbijeno') => void;
}

export default function PendingApprovals({ expenses, onAction }: PendingApprovalsProps) {
    const pending = expenses.filter(e => e.status === 'Na cekanju');

    if (pending.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Zahtevi za odobrenje ({pending.length})</h2>
            <div className="space-y-4">
                {pending.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <p className="font-semibold text-gray-900">{item.description}</p>
                            <p className="text-sm text-gray-500">{item.category} • ${item.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onAction(item.id, 'Odbijeno')}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition"
                            >
                                Odbij
                            </button>
                            <button 
                                onClick={() => onAction(item.id, 'Odobreno')}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-[#8e082d] hover:bg-red-900 rounded-md transition"
                            >
                                Odobri
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}