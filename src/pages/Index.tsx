
import React from 'react';
import AppHeader from '../components/AppHeader';
import BillUpload from '../components/BillUpload';
import BillDisplay from '../components/BillDisplay';
import FriendsList from '../components/FriendsList';
import ItemList from '../components/ItemList';
import Summary from '../components/Summary';
import { BillProvider, useBill } from '../context/BillContext';

const StepIndicator: React.FC = () => {
  const { state } = useBill();
  
  const steps = [
    { number: 1, name: "Upload" },
    { number: 2, name: "Friends" },
    { number: 3, name: "Items" },
    { number: 4, name: "Summary" },
  ];
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="step-indicator-item">
              <div className={`step-indicator-circle ${
                state.currentStep === step.number 
                  ? 'active' 
                  : state.currentStep > step.number 
                  ? 'completed'
                  : ''
              }`}>
                {state.currentStep > step.number ? '✓' : step.number}
              </div>
              <span className="text-xs mt-1">{step.name}</span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`step-indicator-line ${
                state.currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const BillSplitterContent: React.FC = () => {
  const { state } = useBill();
  
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <BillUpload />;
      case 2:
        return <FriendsList />;
      case 3:
        return <ItemList />;
      case 4:
        return <Summary />;
      default:
        return <BillUpload />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <AppHeader />
      
      {state.processedBill && <StepIndicator />}
      
      <main>
        {renderStep()}
      </main>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <BillProvider>
      <BillSplitterContent />
    </BillProvider>
  );
};

export default Index;
