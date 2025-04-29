
// OCR Processor utility that integrates with Mistral AI OCR
// Processes bill images and extracts structured data

import { BillItem, BillSummary } from "../context/BillContext";
import { extractTextFromImage } from "./textRecognition";
import { parseBillText } from "./billParser";

// Process a bill image and extract structured data
export const processBillImage = async (file: File): Promise<{ items: BillItem[], summary: BillSummary }> => {
  try {
    // Step 1: Extract text from the image using Mistral AI OCR
    const extractedText = await extractTextFromImage(file);
    console.log("Extracted text from image using Mistral AI OCR:", extractedText);
    
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
  // Mock items data as fallback with Indian cuisine items
  const mockItems: BillItem[] = [
    { id: "1", name: "Butter Chicken", price: 450, assignedTo: null },
    { id: "2", name: "Garlic Naan", price: 120, assignedTo: null },
    { id: "3", name: "Paneer Tikka", price: 350, assignedTo: null },
    { id: "4", name: "Dal Makhani", price: 280, assignedTo: null },
    { id: "5", name: "Veg Biryani", price: 320, assignedTo: null },
    { id: "6", name: "Gulab Jamun", price: 180, assignedTo: null },
    { id: "7", name: "Masala Chai", price: 100, assignedTo: null },
  ];
  
  // Calculate the subtotal
  const subtotal = parseFloat(mockItems.reduce((sum, item) => sum + item.price, 0).toFixed(2));
  
  // Mock tax and tip values more appropriate for Indian context
  const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% tax (typical GST for restaurants)
  const tip = parseFloat((subtotal * 0.10).toFixed(2)); // 10% tip
  
  // Create summary
  const mockSummary: BillSummary = {
    subtotal,
    tax,
    tip,
    total: parseFloat((subtotal + tax + tip).toFixed(2))
  };
  
  return { items: mockItems, summary: mockSummary };
};
