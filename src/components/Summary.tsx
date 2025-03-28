
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CreditCard, Download, User, DollarSign, QrCode, Check } from 'lucide-react';
import { useBill } from '../context/BillContext';
import { useToast } from '@/components/ui/use-toast';
import { generateUpiLink } from '../utils/billCalculator';

const Summary: React.FC = () => {
  const { state, dispatch } = useBill();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const handleCopyPaymentDetails = (friendId: string, amount: number) => {
    navigator.clipboard.writeText(`Amount to pay: $${amount.toFixed(2)}`);
    
    setCopiedId(friendId);
    setTimeout(() => setCopiedId(null), 2000);
    
    toast({
      title: "Copied to clipboard",
      description: "Payment details copied to clipboard",
    });
  };
  
  const generateQRCode = (friendId: string, name: string, amount: number) => {
    // In a real implementation, this would generate a proper QR code
    // For the MVP, we'll show a toast
    toast({
      title: "QR Code Generated",
      description: `Created payment QR code for ${name}: $${amount.toFixed(2)}`,
    });
    
    // Would normally generate an actual UPI link or payment link
    const upiLink = generateUpiLink(name, amount);
    console.log("Generated UPI link:", upiLink);
  };
  
  const handleNewBill = () => {
    if (window.confirm("Start a new bill? This will clear the current bill data.")) {
      dispatch({ type: "RESET_BILL" });
    }
  };
  
  // Calculate individual share of tax and tip
  const sharedTaxPerPerson = state.friends.length > 0 ? state.summary.tax / state.friends.length : 0;
  const sharedTipPerPerson = state.friends.length > 0 ? state.summary.tip / state.friends.length : 0;
  
  return (
    <div className="splitty-container animate-fade-in">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-splitty-teal" />
            Bill Summary
          </CardTitle>
          <CardDescription>
            Here's how the bill breaks down for everyone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/10 p-4 rounded-md flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Total Bill</h3>
              <p className="text-sm text-gray-500">Split {state.friends.length} ways</p>
            </div>
            <p className="text-2xl font-bold">${state.summary.total.toFixed(2)}</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-md font-medium">Everyone Pays</h3>
            
            {state.friends.map((friend) => {
              // Get items specifically for this friend
              const friendItems = state.items.filter(item => item.assignedTo === friend.id);
              const itemsTotal = friendItems.reduce((sum, item) => sum + item.price, 0);
              
              return (
                <Card key={friend.id} className="shadow-sm overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-splitty-teal" />
                      <h4 className="font-medium">{friend.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-splitty-teal" />
                      <span className="text-lg font-bold">{friend.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span>${itemsTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Share:</span>
                      <span>${sharedTaxPerPerson.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tip Share:</span>
                      <span>${sharedTipPerPerson.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-2 border-t mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>${friend.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 pb-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-xs gap-1"
                      onClick={() => handleCopyPaymentDetails(friend.id, friend.total)}
                    >
                      {copiedId === friend.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copiedId === friend.id ? "Copied" : "Copy amount"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-xs gap-1"
                      onClick={() => generateQRCode(friend.id, friend.name, friend.total)}
                    >
                      <QrCode className="h-3 w-3" />
                      Payment QR
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => dispatch({ type: "SET_STEP", payload: 3 })}
            >
              Back to Items
            </Button>
            <Button 
              onClick={handleNewBill}
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              New Bill
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Summary;
