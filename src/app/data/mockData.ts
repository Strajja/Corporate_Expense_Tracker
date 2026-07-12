
export interface Expense {
    id: string;
    description: string;
    category: string;
    amount: number;
    date: string;
    status: 'approved' | 'pending' | 'rejected';
}

export const mockExpenses: Expense[] = [
    { id: 'TRX-001', description: 'Poslovni ručak sa klijentom', category: 'Reprezentacija', amount: 120.50, date: '2026-06-12', status: 'approved' },
    { id: 'TRX-002', description: 'Taksi do aerodroma', category: 'Prevoz', amount: 45.00, date: '2026-06-14', status: 'pending' },
    { id: 'TRX-003', description: 'Kotizacija za konferenciju', category: 'Edukacija', amount: 350.00, date: '2026-06-15', status: 'rejected' },
    { id: 'TRX-004', description: 'Kancelarijski materijal', category: 'Oprema', amount: 85.20, date: '2026-06-15', status: 'approved' },
];