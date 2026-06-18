import AddExpenseForm from "@/app/components/AddExpenseForm";

export default function ExpensePage(){
    return (
        <div
        className="p-8 w-full max-w-7xl mx-auto">
          <h1
          className="text-3xl font-bold text-gray-900 mb-8"
          >Upravljanje Troškovima
          </h1>
          
          <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div
            className="lg:col-span-2">
              <div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                 <p
                 className="text-gray-500"
                 >Ovde ćemo kasnije prebaciti onu veliku tabelu sa filterima...
                 </p>
              </div>
            </div>
    
            <div
            className="lg:col-span-1">
              <AddExpenseForm />
            </div>
    
          </div>
        </div>
      );
}