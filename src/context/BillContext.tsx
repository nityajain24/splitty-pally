
import React, { createContext, useContext, useReducer, useEffect } from "react";

export type BillItem = {
  id: string;
  name: string;
  price: number;
  assignedTo: string | null;
};

export type Friend = {
  id: string;
  name: string;
  items: string[];
  total: number;
};

export type BillSummary = {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
};

type BillState = {
  items: BillItem[];
  friends: Friend[];
  summary: BillSummary;
  processedBill: boolean;
  currentStep: number;
  currentFriendIndex: number;
};

type BillAction =
  | { type: "SET_ITEMS"; payload: BillItem[] }
  | { type: "SET_FRIENDS"; payload: Friend[] }
  | { type: "SET_SUMMARY"; payload: BillSummary }
  | { type: "ADD_FRIEND"; payload: { name: string } }
  | { type: "REMOVE_FRIEND"; payload: { id: string } }
  | { type: "ASSIGN_ITEM"; payload: { itemId: string; friendId: string } }
  | { type: "UNASSIGN_ITEM"; payload: { itemId: string } }
  | { type: "CALCULATE_TOTALS" }
  | { type: "SET_PROCESSED_BILL"; payload: boolean }
  | { type: "SET_STEP"; payload: number }
  | { type: "NEXT_FRIEND" }
  | { type: "PREVIOUS_FRIEND" }
  | { type: "RESET_BILL" };

const initialState: BillState = {
  items: [],
  friends: [],
  summary: {
    subtotal: 0,
    tax: 0,
    tip: 0,
    total: 0,
  },
  processedBill: false,
  currentStep: 1,
  currentFriendIndex: 0,
};

function billReducer(state: BillState, action: BillAction): BillState {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload };
    
    case "SET_FRIENDS":
      return { ...state, friends: action.payload };
    
    case "SET_SUMMARY":
      return { ...state, summary: action.payload };
    
    case "ADD_FRIEND":
      const newFriend: Friend = {
        id: Date.now().toString(),
        name: action.payload.name,
        items: [],
        total: 0,
      };
      return { ...state, friends: [...state.friends, newFriend] };
    
    case "REMOVE_FRIEND": {
      // Unassign items assigned to this friend
      const itemsToUpdate = state.items.map(item => 
        item.assignedTo === action.payload.id 
          ? { ...item, assignedTo: null } 
          : item
      );
      
      return {
        ...state,
        friends: state.friends.filter(friend => friend.id !== action.payload.id),
        items: itemsToUpdate,
      };
    }
    
    case "ASSIGN_ITEM": {
      const { itemId, friendId } = action.payload;
      
      // Update the item assignment
      const updatedItems = state.items.map(item => 
        item.id === itemId ? { ...item, assignedTo: friendId } : item
      );
      
      // Update the friend's items list
      const updatedFriends = state.friends.map(friend => {
        if (friend.id === friendId) {
          return {
            ...friend,
            items: [...friend.items, itemId],
          };
        }
        // If the item was previously assigned to another friend, remove it
        if (friend.items.includes(itemId)) {
          return {
            ...friend,
            items: friend.items.filter(id => id !== itemId),
          };
        }
        return friend;
      });
      
      return {
        ...state,
        items: updatedItems,
        friends: updatedFriends,
      };
    }
    
    case "UNASSIGN_ITEM": {
      const { itemId } = action.payload;
      
      // Find which friend has this item
      const friendWithItem = state.friends.find(friend => 
        friend.items.includes(itemId)
      );
      
      // Update the item assignment
      const updatedItems = state.items.map(item => 
        item.id === itemId ? { ...item, assignedTo: null } : item
      );
      
      // Update the friend's items list if found
      const updatedFriends = friendWithItem 
        ? state.friends.map(friend => 
            friend.id === friendWithItem.id 
              ? { ...friend, items: friend.items.filter(id => id !== itemId) } 
              : friend
          )
        : state.friends;
      
      return {
        ...state,
        items: updatedItems,
        friends: updatedFriends,
      };
    }
    
    case "CALCULATE_TOTALS": {
      // Calculate the item subtotal for each friend
      const updatedFriends = state.friends.map(friend => {
        const friendItems = state.items.filter(item => 
          friend.items.includes(item.id)
        );
        
        const itemsTotal = friendItems.reduce((sum, item) => sum + item.price, 0);
        
        // Calculate shared costs (tax & tip) per person
        const numFriends = state.friends.length;
        const sharedTax = numFriends > 0 ? state.summary.tax / numFriends : 0;
        const sharedTip = numFriends > 0 ? state.summary.tip / numFriends : 0;
        
        // Total = items + share of tax + share of tip
        const total = itemsTotal + sharedTax + sharedTip;
        
        return {
          ...friend,
          total: parseFloat(total.toFixed(2)),
        };
      });
      
      return {
        ...state,
        friends: updatedFriends,
      };
    }
    
    case "SET_PROCESSED_BILL":
      return { ...state, processedBill: action.payload };
    
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    
    case "NEXT_FRIEND":
      return { 
        ...state, 
        currentFriendIndex: Math.min(state.currentFriendIndex + 1, state.friends.length - 1) 
      };
    
    case "PREVIOUS_FRIEND":
      return { 
        ...state, 
        currentFriendIndex: Math.max(state.currentFriendIndex - 1, 0) 
      };
    
    case "RESET_BILL":
      return initialState;
    
    default:
      return state;
  }
}

type BillContextType = {
  state: BillState;
  dispatch: React.Dispatch<BillAction>;
};

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(billReducer, initialState);
  
  // Auto-save state to localStorage
  useEffect(() => {
    localStorage.setItem("billSplitterState", JSON.stringify(state));
  }, [state]);
  
  // Load saved state on initialization
  useEffect(() => {
    const savedState = localStorage.getItem("billSplitterState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Set individual pieces to avoid type issues
        dispatch({ type: "SET_ITEMS", payload: parsedState.items || [] });
        dispatch({ type: "SET_FRIENDS", payload: parsedState.friends || [] });
        dispatch({ type: "SET_SUMMARY", payload: parsedState.summary || initialState.summary });
        dispatch({ type: "SET_PROCESSED_BILL", payload: parsedState.processedBill || false });
        dispatch({ type: "SET_STEP", payload: parsedState.currentStep || 1 });
      } catch (err) {
        console.error("Error loading saved state:", err);
      }
    }
  }, []);
  
  return (
    <BillContext.Provider value={{ state, dispatch }}>
      {children}
    </BillContext.Provider>
  );
};

export const useBill = () => {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error("useBill must be used within a BillProvider");
  }
  return context;
};
