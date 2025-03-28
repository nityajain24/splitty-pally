
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, DollarSign, ArrowLeft, ArrowRight, ListChecks, CircleCheck, Users } from 'lucide-react';
import { useBill } from '../context/BillContext';
import { areAllItemsAssigned, getAssignmentPercentage, getUnassignedItemsTotal } from '../utils/billCalculator';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const ItemList: React.FC = () => {
  const { state, dispatch } = useBill();
  const { toast } = useToast();
  
  const currentFriend = state.friends[state.currentFriendIndex];
  const isLastFriend = state.currentFriendIndex === state.friends.length - 1;
  
  const assignmentProgress = getAssignmentPercentage(state.items);
  const unassignedTotal = getUnassignedItemsTotal(state.items);
  
  const isItemAssignedToCurrentFriend = (item: { assignedTo: string[] | string | null }) => {
    if (!item.assignedTo) return false;
    if (Array.isArray(item.assignedTo)) {
      return item.assignedTo.includes(currentFriend.id);
    }
    return item.assignedTo === currentFriend.id;
  };
  
  const isItemShared = (item: { assignedTo: string[] | string | null }) => {
    return item.assignedTo && Array.isArray(item.assignedTo) && item.assignedTo.length > 1;
  };
  
  const getItemShareCount = (item: { assignedTo: string[] | string | null }) => {
    if (!item.assignedTo) return 0;
    return Array.isArray(item.assignedTo) ? item.assignedTo.length : 1;
  };
  
  const handleToggleItem = (itemId: string) => {
    const item = state.items.find(item => item.id === itemId);
    
    if (!item) return;
    
    if (isItemAssignedToCurrentFriend(item)) {
      // If already assigned to current friend, unassign only from this friend
      dispatch({
        type: "UNASSIGN_ITEM",
        payload: { itemId, friendId: currentFriend.id }
      });
    } else {
      // If not assigned to current friend, assign it
      dispatch({
        type: "ASSIGN_ITEM",
        payload: { itemId, friendId: currentFriend.id }
      });
    }
  };
  
  const handlePreviousFriend = () => {
    dispatch({ type: "PREVIOUS_FRIEND" });
  };
  
  const handleNextFriend = () => {
    dispatch({ type: "NEXT_FRIEND" });
    
    if (isLastFriend) {
      // If this is the last friend, proceed to summary
      dispatch({ type: "CALCULATE_TOTALS" });
      dispatch({ type: "SET_STEP", payload: 4 });
    }
  };
  
  const handleFinishAssignment = () => {
    dispatch({ type: "CALCULATE_TOTALS" });
    dispatch({ type: "SET_STEP", payload: 4 });
  };
  
  const getSharedWithNames = (item: any) => {
    if (!item.assignedTo || !Array.isArray(item.assignedTo)) return "";
    
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
          <div className="bg-blue-50 p-3 rounded-md flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium">Remaining unassigned</p>
              <p className="text-xs text-gray-500">
                {state.items.filter(i => !i.assignedTo).length} items
              </p>
            </div>
            <p className="text-lg font-bold">${unassignedTotal.toFixed(2)}</p>
          </div>
          
          <div className="space-y-2">
            {state.items.map((item) => {
              const isAssignedToCurrentFriend = isItemAssignedToCurrentFriend(item);
              const isShared = isItemShared(item);
              const shareCount = getItemShareCount(item);
              const sharedWithNames = getSharedWithNames(item);
              
              return (
                <div 
                  key={item.id}
                  className={`bill-item cursor-pointer ${
                    isAssignedToCurrentFriend ? 'selected border-primary bg-primary/10' : 
                    item.assignedTo ? 'border-gray-300' : ''
                  }`}
                  onClick={() => handleToggleItem(item.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full w-5 h-5 flex items-center justify-center ${
                        isAssignedToCurrentFriend ? 'bg-primary text-white' : 'border border-gray-300'
                      }`}>
                        {isAssignedToCurrentFriend && <Check className="h-3 w-3" />}
                      </div>
                      <span>{item.name}</span>
                      
                      {isShared && (
                        <Badge variant="outline" className="flex gap-1 items-center text-xs">
                          <Users className="h-3 w-3" />
                          Shared ({shareCount})
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {isShared ? 
                          `${(item.price / shareCount).toFixed(2)} of ${item.price.toFixed(2)}` : 
                          item.price.toFixed(2)
                        }
                      </span>
                    </div>
                  </div>
                  
                  {isShared && (
                    <div className="text-xs text-gray-500 mt-1 pl-8">
                      {isAssignedToCurrentFriend ? 
                        `Sharing with: ${sharedWithNames}` : 
                        `Assigned to: ${getSharedWithNames(item)}`
                      }
                    </div>
                  )}
                  {!isShared && item.assignedTo && !isAssignedToCurrentFriend && (
                    <div className="text-xs text-gray-500 mt-1 pl-8">
                      Assigned to: {state.friends.find(f => 
                        f.id === (Array.isArray(item.assignedTo) ? item.assignedTo[0] : item.assignedTo)
                      )?.name}
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
