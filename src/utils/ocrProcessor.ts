
// This is a mock OCR processor that would normally integrate with Deepseek R1
// For the MVP, we'll simulate OCR results with this utility

import { BillItem, BillSummary } from "../context/BillContext";

// Mock function to simulate OCR processing
export const processBillImage = async (file: File): Promise<{ items: BillItem[], summary: BillSummary }> => {
  // In a real implementation, this would call an OCR API with the image
  // For the MVP, we'll simulate a processing delay and return mock data
  
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Example bill items data that would be extracted from OCR
      const mockItems: BillItem[] = [
        { id: "1", name: "Chicken Pasta", price: 15.99, assignedTo: null },
        { id: "2", name: "Caesar Salad", price: 9.99, assignedTo: null },
        { id: "3", name: "Garlic Bread", price: 4.99, assignedTo: null },
        { id: "4", name: "Margherita Pizza", price: 14.99, assignedTo: null },
        { id: "5", name: "Tiramisu", price: 7.99, assignedTo: null },
        { id: "6", name: "Coke", price: 2.99, assignedTo: null },
        { id: "7", name: "Sparkling Water", price: 3.99, assignedTo: null },
      ];
      
      // Calculate the subtotal
      const subtotal = mockItems.reduce((sum, item) => sum + item.price, 0);
      
      // Mock tax and tip values
      const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% tax
      const tip = parseFloat((subtotal * 0.15).toFixed(2)); // 15% tip
      
      // Create summary
      const mockSummary: BillSummary = {
        subtotal,
        tax,
        tip,
        total: parseFloat((subtotal + tax + tip).toFixed(2))
      };
      
      resolve({ items: mockItems, summary: mockSummary });
    }, 2000); // 2 second mock processing time
  });
};

// Function to extract text from an image (for future implementation)
export const extractTextFromImage = async (file: File): Promise<string> => {
  // This would normally use an OCR API
  // For now, just return a placeholder message
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Bill OCR processing completed.");
    }, 1000);
  });
};

// Parse the OCR text to extract items and prices (for future implementation)
export const parseOcrText = (text: string): { items: BillItem[], summary: BillSummary } => {
  // This would parse the OCR text to extract structured data
  // For the MVP, we'll just return mock data directly
  
  const mockItems: BillItem[] = [
    { id: "1", name: "Chicken Pasta", price: 15.99, assignedTo: null },
    { id: "2", name: "Caesar Salad", price: 9.99, assignedTo: null },
  ];
  
  const subtotal = mockItems.reduce((sum, item) => sum + item.price, 0);
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const tip = parseFloat((subtotal * 0.15).toFixed(2));
  
  const mockSummary: BillSummary = {
    subtotal,
    tax,
    tip,
    total: parseFloat((subtotal + tax + tip).toFixed(2))
  };
  
  return { items: mockItems, summary: mockSummary };
};
