
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, DollarSign, CircleDollarSign, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBill } from '../context/BillContext';

const BillDisplay: React.FC = () => {
  const { state, dispatch } = useBill();
  
  const handleAddFriends = () => {
    dispatch({ type: "SET_STEP", payload: 2 });
  };
  
  return (
    <div className="splitty-container animate-fade-in">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Receipt className="h-6 w-6 text-splitty-teal" />
            Your Bill Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Subtotal</h3>
                  <DollarSign className="h-4 w-4 text-splitty-gray" />
                </div>
                <p className="text-2xl font-semibold">${state.summary.subtotal.toFixed(2)}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Tax</h3>
                  <CircleDollarSign className="h-4 w-4 text-splitty-gray" />
                </div>
                <p className="text-2xl font-semibold">${state.summary.tax.toFixed(2)}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Tip</h3>
                  <PiggyBank className="h-4 w-4 text-splitty-gray" />
                </div>
                <p className="text-2xl font-semibold">${state.summary.tip.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-primary/10 p-4 rounded-md flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Total</h3>
              <p className="text-sm text-gray-500">{state.items.length} items</p>
            </div>
            <p className="text-2xl font-bold">${state.summary.total.toFixed(2)}</p>
          </div>
          
          <div className="border rounded-md divide-y">
            <h3 className="p-3 text-sm font-medium bg-gray-50">Items on your bill</h3>
            
            {state.items.map((item) => (
              <div key={item.id} className="p-3 flex justify-between hover:bg-gray-50">
                <span>{item.name}</span>
                <span className="font-medium">${item.price.toFixed(2)}</span>
              </div>
            ))}
            
            {state.items.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No items found on your bill
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleAddFriends}>
              Next: Add Friends
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillDisplay;
