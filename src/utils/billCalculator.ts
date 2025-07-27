
import { BillItem, Friend, BillSummary } from "../context/BillContext";

// Calculate each friend's total including their share of tax and tip
export const calculateFriendTotals = (
  items: BillItem[],
  friends: Friend[],
  summary: BillSummary
): Friend[] => {
  if (friends.length === 0) return [];

  // Calculate shared costs per person
  const sharedTaxPerPerson = summary.tax / friends.length;
  const sharedTipPerPerson = summary.tip / friends.length;
  
  // Calculate each friend's total
  return friends.map(friend => {
    let itemsTotal = 0;
    
    // Go through all items and calculate this friend's share
    items.forEach(item => {
      if (!item.assignedTo) return;
      
      const assignedTo = Array.isArray(item.assignedTo) 
        ? item.assignedTo 
        : [item.assignedTo];
      
      if (assignedTo.includes(friend.id)) {
        // If shared, divide the price by the number of people sharing it
        const sharers = assignedTo.length;
        const sharedPrice = item.price / sharers;
        itemsTotal += sharedPrice;
      }
    });
    
    // Total = items + share of tax + share of tip
    const total = itemsTotal + sharedTaxPerPerson + sharedTipPerPerson;
    
    return {
      ...friend,
      total: parseFloat(total.toFixed(2))
    };
  });
};

// Check if all items have been assigned
export const areAllItemsAssigned = (items: BillItem[]): boolean => {
  return items.every(item => item.assignedTo !== null);
};

// Calculate unassigned items total
export const getUnassignedItemsTotal = (items: BillItem[]): number => {
  const unassignedItems = items.filter(item => item.assignedTo.length === 0);
  return parseFloat(unassignedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2));
};

// Calculate what percentage of the bill has been assigned
export const getAssignmentPercentage = (items: BillItem[]): number => {
  if (items.length === 0) return 0;
  
  const assignedItems = items.filter(item => item.assignedTo.length > 0);
  return Math.round((assignedItems.length / items.length) * 100);
};

export function isItemAssignedToCurrentFriend(item: BillItem, currentFriendId: string): boolean {
  return Array.isArray(item.assignedTo) && item.assignedTo.includes(currentFriendId);
};

export function getItemShareCount(item: BillItem): number {
  if (!item.assignedTo) {
      return 0;
  }
  if (Array.isArray(item.assignedTo)) {
      return item.assignedTo.length;
  }
    return 1;
}

// Generate payment details with split amounts
export const generatePaymentSummary = (friends: Friend[], summary: BillSummary): string => {
  if (friends.length === 0) return "No friends added to split bill with.";
  
  let paymentText = `Total Bill: ₹${summary.total.toFixed(2)}\n`;
  paymentText += `Split ${friends.length} ways\n\n`;
  
  friends.forEach(friend => {
    paymentText += `${friend.name}: ₹${friend.total.toFixed(2)}\n`;
  });
  
  return paymentText;
};

// Generate a simple UPI payment link (placeholder function)
export const generateUpiLink = (name: string, amount: number): string => {
  // In a real implementation, this would generate a proper UPI link
  // For the MVP, we'll return a mock link
  const encodedName = encodeURIComponent(name);
  return `upi://pay?pa=example@upi&pn=${encodedName}&am=${amount.toFixed(2)}&cu=INR&tn=BillSplit`;
};
