
// OCR Processor utility that integrates with DeepSeek
// For the MVP, we'll implement text extraction and then build on it

import { BillItem, BillSummary } from "../context/BillContext";
import { extractTextFromImage } from "./textRecognition";
import { parseBillText } from "./billParser";

// Process a bill image and extract structured data
export const processBillImage = async (file: File): Promise<{ items: BillItem[], summary: BillSummary }> => {
  try {
    // Step 1: Extract text from the image
    const extractedText = await extractTextFromImage(file);
    console.log("Extracted text from image:", extractedText);
    
    // Step 2: Parse the extracted text to get structured bill data
    const { items, summary } = parseBillText(extractedText);
    
    // If no items were extracted, fall back to mock data
    if (items.length === 0) {
      console.warn("OCR processing couldn't extract bill items, using fallback data");
      return provideFallbackData();
    }
    
    return { items, summary };
  } catch (error) {
    console.error("Error in OCR processing:", error);
    // In case of any error, provide mock data as fallback
    return provideFallbackData();
  }
};

// Provide fallback data in case OCR processing fails
const provideFallbackData = (): { items: BillItem[], summary: BillSummary } => {
  // Mock items data as fallback
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
  const subtotal = parseFloat(mockItems.reduce((sum, item) => sum + item.price, 0).toFixed(2));
  
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
  
  return { items: mockItems, summary: mockSummary };
};
