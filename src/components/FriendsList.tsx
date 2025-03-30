
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserPlus, User, X } from 'lucide-react';
import { useBill } from '../context/BillContext';
import { useToast } from '@/components/ui/use-toast';

const FriendsList: React.FC = () => {
  const { state, dispatch } = useBill();
  const { toast } = useToast();
  const [newFriendName, setNewFriendName] = useState('');
  
  const handleAddFriend = () => {
    if (!newFriendName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a friend's name",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ 
      type: "ADD_FRIEND", 
      payload: { name: newFriendName.trim() } 
    });
    
    setNewFriendName('');
    
    toast({
      title: "Friend added",
      description: `${newFriendName.trim()} has been added to the bill`,
    });
  };
  
  const handleRemoveFriend = (id: string, name: string) => {
    dispatch({ type: "REMOVE_FRIEND", payload: { id } });
    
    toast({
      title: "Friend removed",
      description: `${name} has been removed from the bill`,
    });
  };
  
  const handleContinue = () => {
    if (state.friends.length === 0) {
      toast({
        title: "No friends added",
        description: "Please add at least one friend to continue",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: "SET_STEP", payload: 3 });
  };
  
  return (
    <div className="splitty-container animate-fade-in">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-splitty-teal" />
            Who's Splitting This Bill?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              placeholder="Enter friend's name" 
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
              className="flex-1 text-foreground dark:text-foreground dark:bg-background"
            />
            <Button onClick={handleAddFriend} className="flex-none">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          </div>
          
          {state.friends.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Friends ({state.friends.length})</h3>
              <div className="space-y-2">
                {state.friends.map((friend) => (
                  <div 
                    key={friend.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-splitty-gray" />
                      <span>{friend.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend.id, friend.name)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <User className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p>No friends added yet</p>
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => dispatch({ type: "SET_STEP", payload: 1 })}
            >
              Back
            </Button>
            <Button onClick={handleContinue}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendsList;
