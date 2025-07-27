import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ListChecks, CircleCheck, Users } from 'lucide-react';
import { useBill } from '../context/BillContext';
import { getAssignmentPercentage, getUnassignedItemsTotal } from '../utils/billCalculator';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ItemList: React.FC = () => {
  const [processingItemId, setProcessingItemId] = useState<string | null>(null);
  const { state, dispatch } = useBill();
  const { toast } = useToast();
  
  const currentFriend = state.friends[state.currentFriendIndex];
  const isLastFriend = state.currentFriendIndex === state.friends.length - 1;
  
  const assignmentProgress = getAssignmentPercentage(state.items);
  const unassignedTotal = getUnassignedItemsTotal(state.items);
  
  const isItemAssignedToCurrentFriend = (item: { id: string, assignedTo?: string[] }) => {
    if (!item.assignedTo || !Array.isArray(item.assignedTo)) return false;
    return item.assignedTo.includes(currentFriend.id);
  };
  
  const isItemShared = (item: { assignedTo?: string[] }) => {
    return Array.isArray(item.assignedTo) && item.assignedTo.length > 1;
  };
  
  const getItemShareCount = (item: { assignedTo?: string[] }) => {
    if (!Array.isArray(item.assignedTo)) return 0;
    return item.assignedTo.length;
  };
  
  const handleToggleItem = (itemId: string) => {
    // Check if we're currently processing an item to prevent double-clicks
    if (processingItemId) return;
    
    setProcessingItemId(itemId);
    
    const item = state.items.find(item => item.id === itemId);
    if (!item) {
      setProcessingItemId(null);
      return;
    }

    // Check if item is assigned to current friend
    const isAssigned = isItemAssignedToCurrentFriend(item);
    
    if (isAssigned) {
      // If assigned, unassign it
      dispatch({
        type: "UNASSIGN_ITEM",
        payload: { itemId, friendId: currentFriend.id }
      });
    } else {
      // If not assigned, assign it
      dispatch({
        type: "ASSIGN_ITEM",
        payload: { itemId, friendId: currentFriend.id }
      });
    }
    
    // Clear the processing state after a brief timeout
    setTimeout(() => {
      setProcessingItemId(null);
    }, 100);
  };
  
  const handlePreviousFriend = () => {
    dispatch({ type: "PREVIOUS_FRIEND" });
  };
  
  const handleNextFriend = () => {
    dispatch({ type: "NEXT_FRIEND" });
    
    if (isLastFriend) {
      dispatch({ type: "CALCULATE_TOTALS" });
      dispatch({ type: "SET_STEP", payload: 4 });
    }
  };
  
  const handleFinishAssignment = () => {
    dispatch({ type: "CALCULATE_TOTALS" });
    dispatch({ type: "SET_STEP", payload: 4 });
  };
  
  const getSharedWithNames = (item: any) => {
    if (!Array.isArray(item.assignedTo)) return "";
    
    return state.friends
      .filter(f => item.assignedTo.includes(f.id) && f.id !== currentFriend.id)
      .map(f => f.name)
      .join(", ");
  };
  
  return (
    <div className="splitty-container animate-fade-in">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-splitty-teal" />
              Select Items
            </CardTitle>
            <div className="text-right">
              <p className="text-sm font-medium">Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={assignmentProgress} className="w-24 h-2" />
                <span className="text-xs">{assignmentProgress}%</span>
              </div>
            </div>
          </div>
          <CardDescription>
            {currentFriend ? (
              <>
                What did <span className="font-medium">{currentFriend.name}</span> have?
                <p className="mt-1 text-xs">Items can be shared between multiple people.</p>
              </>
            ) : (
              "Select items for each friend"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium">Remaining unassigned</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {state.items.filter(i => !Array.isArray(i.assignedTo) || i.assignedTo.length === 0).length} items
              </p>
            </div>
            <p className="text-lg font-bold">₹{unassignedTotal.toFixed(2)}</p>
          </div>
          
          <div className="space-y-2">
            {state.items.map((item) => {
              const isAssignedToCurrentFriend = isItemAssignedToCurrentFriend(item);
              const isShared = isItemShared(item);
              const shareCount = getItemShareCount(item);
              const sharedWithNames = getSharedWithNames(item);
              
              return (
                <div key={item.id} className={cn(
                  "border rounded-md p-3 transition-colors",
                  isAssignedToCurrentFriend ? "border-primary bg-primary/10" : "border-gray-200 dark:border-gray-800"
                )}>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isAssignedToCurrentFriend}
                        onChange={() => handleToggleItem(item.id)}
                        disabled={processingItemId !== null}
                        className="w-5 h-5 cursor-pointer"
                        id={`item-checkbox-${item.id}`}
                      />
                    </div>
                    
                    <div className="flex-1 cursor-pointer" onClick={() => handleToggleItem(item.id)}>
                      <label 
                        htmlFor={`item-checkbox-${item.id}`}
                        className="cursor-pointer font-medium"
                      >
                        {item.name}
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isShared && (
                        <Badge variant="outline" className="flex gap-1 items-center text-xs">
                          <Users className="h-3 w-3" />
                          Shared ({shareCount})
                        </Badge>
                      )}
                      
                      <div className="ml-2 text-right">
                        <span className="text-gray-500 mr-1">₹</span>
                        <span className="font-medium">
                          {isShared ? 
                            `${(item.price / shareCount).toFixed(2)} of ${item.price.toFixed(2)}` : 
                            item.price.toFixed(2)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {(isShared || (Array.isArray(item.assignedTo) && item.assignedTo.length > 0 && !isAssignedToCurrentFriend)) && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">
                      {isAssignedToCurrentFriend && isShared ?
                        `Sharing with: ${sharedWithNames}` : 
                        `Assigned to: ${getSharedWithNames(item)}`
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between items-center pt-4">
            {state.currentFriendIndex > 0 ? (
              <Button 
                variant="outline" 
                onClick={handlePreviousFriend}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous Friend
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => dispatch({ type: "SET_STEP", payload: 2 })}
              >
                Back to Friends
              </Button>
            )}
            
            {!isLastFriend ? (
              <Button 
                onClick={handleNextFriend}
                className="gap-1"
              >
                Next Friend
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleFinishAssignment}
                className="gap-1"
              >
                Finish
                <CircleCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemList;