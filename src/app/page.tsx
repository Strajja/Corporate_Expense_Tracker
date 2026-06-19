import SummaryCard from "./components/SummaryCard";
import RecentExpenses from "./components/RecentExpenses";
import { Expense, mockExpenses } from "./data/mockData";



export default function Dashboard() {
  return (

    <div
      className="p-8 w-full">
      <div
        className="mb-8">
        <h1
          className="text-3xl font-bold text-gray-900"
        >Welcome back, user
        </h1>
        <p
          className="text-gray-500 mt-1"
        >Pregled vasih finansijskih aktivnosti za ovaj mesec
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <SummaryCard
          title="Ukupni troskovi"
          amount="$4,250.00"
          description="+12% u odnosu na prosli mesec"
          trend="negative"
        />

        <SummaryCard
          title="Odobren budzet"
          amount="$10,000.00"
          description="Dostupno za trosenje"
          trend="positive"
        />

        <SummaryCard
          title="Na cekanju (Pending)"
          amount="3 zahteva"
          description="Potrebna akcija menadzera"
          trend="neutral"
        />
        
      </div>
      <RecentExpenses data={mockExpenses}/>
    </div>

  );
}