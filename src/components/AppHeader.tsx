
import React from 'react';
import { Receipt, Moon, Sun } from 'lucide-react';
import { useBill } from '../context/BillContext';
import { useTheme } from '../hooks/useTheme';

const AppHeader: React.FC = () => {
  const { state, dispatch } = useBill();
  const { theme, setTheme } = useTheme();
  
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset? This will clear all data.")) {
      dispatch({ type: "RESET_BILL" });
    }
  };
  
  return (
    <header className="bg-background shadow-sm py-4 px-4 sm:px-6 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Receipt className="h-6 w-6 text-splitty-teal" />
        <h1 className="text-xl font-bold text-foreground">Splitty Pally</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600" />
          )}
        </button>
        
        {state.processedBill && (
          <button 
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
