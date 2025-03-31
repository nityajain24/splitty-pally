
import { BillItem, BillSummary } from "../context/BillContext";

/**
 * Parse OCR text to extract bill items and summary
 * @param {string} ocrText - The text extracted from the bill image
 * @returns {{ items: BillItem[], summary: BillSummary }} - Structured bill data
 */
export function parseBillText(ocrText: string): { items: BillItem[], summary: BillSummary } {
  try {
    const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract items section (between "ITEMS" and the first line with dashes after items)
    const itemsStartIndex = lines.findIndex(line => line.includes("ITEMS") && line.includes("PRICE"));
    let itemsEndIndex = -1;
    
    if (itemsStartIndex > -1) {
      // Find the next separator line after the items section
      for (let i = itemsStartIndex + 1; i < lines.length; i++) {
        if (lines[i].includes("-----")) {
          itemsEndIndex = i;
          break;
        }
      }
    }
    
    // If we couldn't find the exact markers, try a more generic approach
    const billItems: BillItem[] = [];
    
    // If we found the items section with clear markers
    if (itemsStartIndex > -1 && itemsEndIndex > -1) {
      // Process items between markers
      for (let i = itemsStartIndex + 2; i < itemsEndIndex; i++) {
        const itemLine = lines[i];
        const itemMatch = itemLine.match(/(.+?)\s+₹(\d+\.\d+)/);
        
        if (itemMatch) {
          const [, name, priceStr] = itemMatch;
          billItems.push({
            id: `item-${billItems.length + 1}`,
            name: name.trim(),
            price: parseFloat(priceStr),
            assignedTo: null
          });
        }
      }
    } else {
      // Fallback: Look for patterns that match an item name followed by a price
      const pricePattern = /(.+?)\s+₹(\d+\.\d+)/;
      
      for (const line of lines) {
        const match = line.match(pricePattern);
        if (match && !line.toLowerCase().includes("total") && 
            !line.toLowerCase().includes("subtotal") && 
            !line.toLowerCase().includes("tax") && 
            !line.toLowerCase().includes("tip")) {
          
          billItems.push({
            id: `item-${billItems.length + 1}`,
            name: match[1].trim(),
            price: parseFloat(match[2]),
            assignedTo: null
          });
        }
      }
    }
    
    // Extract summary information
    let subtotal = 0;
    let tax = 0;
    let tip = 0;
    let total = 0;
    
    // Look for summary entries
    for (const line of lines) {
      const subtotalMatch = line.match(/subtotal:?\s*₹(\d+\.\d+)/i);
      if (subtotalMatch) {
        subtotal = parseFloat(subtotalMatch[1]);
      }
      
      const taxMatch = line.match(/tax.*?:?\s*₹(\d+\.\d+)/i);
      if (taxMatch) {
        tax = parseFloat(taxMatch[1]);
      }
      
      const tipMatch = line.match(/tip.*?:?\s*₹(\d+\.\d+)/i);
      if (tipMatch) {
        tip = parseFloat(tipMatch[1]);
      }
      
      const totalMatch = line.match(/total:?\s*₹(\d+\.\d+)/i);
      if (totalMatch) {
        total = parseFloat(totalMatch[1]);
      }
    }
    
    // If we couldn't extract the summary values, calculate them from items
    if (subtotal === 0 && billItems.length > 0) {
      subtotal = parseFloat(billItems.reduce((sum, item) => sum + item.price, 0).toFixed(2));
      // Estimate tax and tip if not found
      tax = parseFloat((subtotal * 0.08).toFixed(2)); // Assume 8% tax
      tip = parseFloat((subtotal * 0.15).toFixed(2)); // Assume 15% tip
      total = parseFloat((subtotal + tax + tip).toFixed(2));
    }
    
    const summary: BillSummary = {
      subtotal,
      tax,
      tip,
      total
    };
    
    return { items: billItems, summary };
  } catch (error) {
    console.error("Error parsing bill text:", error);
    // Return a minimal valid structure if parsing fails
    return {
      items: [],
      summary: {
        subtotal: 0,
        tax: 0,
        tip: 0,
        total: 0
      }
    };
  }
}
