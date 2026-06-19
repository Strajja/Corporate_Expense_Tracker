
export interface Expense {
    id: string;
    description: string;
    category: string;
    amount: number;
    date: string;
    status: 'Odobreno' | 'Na cekanju' | 'Odbijeno';
}

export const mockExpenses: Expense[] = [
    { id: 'TRX-001', description: 'Poslovni ručak sa klijentom', category: 'Reprezentacija', amount: 120.50, date: '2026-06-12', status: 'Odobreno' },
    { id: 'TRX-002', description: 'Taksi do aerodroma', category: 'Prevoz', amount: 45.00, date: '2026-06-14', status: 'Na cekanju' },
    { id: 'TRX-003', description: 'Kotizacija za konferenciju', category: 'Edukacija', amount: 350.00, date: '2026-06-15', status: 'Odbijeno' },
    { id: 'TRX-004', description: 'Kancelarijski materijal', category: 'Oprema', amount: 85.20, date: '2026-06-15', status: 'Odobreno' },
];