
import React from 'react';
import { Receipt } from 'lucide-react';
import { useBill } from '../context/BillContext';

const AppHeader: React.FC = () => {
  const { state, dispatch } = useBill();
  
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset? This will clear all data.")) {
      dispatch({ type: "RESET_BILL" });
    }
  };
  
  return (
    <header className="bg-white shadow-sm py-4 px-4 sm:px-6 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Receipt className="h-6 w-6 text-splitty-teal" />
        <h1 className="text-xl font-bold text-splitty-dark">Splitty Pally</h1>
      </div>
      
      {state.processedBill && (
        <button 
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset
        </button>
      )}
    </header>
  );
};

export default AppHeader;
