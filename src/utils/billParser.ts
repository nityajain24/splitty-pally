
import { BillItem, BillSummary } from "../context/BillContext";

/**
 * Parse OCR text to extract bill items and summary
 * @param {string} ocrText - The text extracted from the bill image
 * @returns {{ items: BillItem[], summary: BillSummary }} - Structured bill data
 */
export function parseBillText(ocrText: string): { items: BillItem[], summary: BillSummary } {
  try {
    // Parse the markdown text from Mistral OCR
    const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract items (look for table data or list of items)
    const billItems: BillItem[] = [];
    
    // Try to find a table with a pattern like "| Item | Qty | Price |"
    const tableHeaderIndex = lines.findIndex(line => 
      line.includes('|') && 
      (line.toLowerCase().includes('item') || line.toLowerCase().includes('dish')) && 
      line.toLowerCase().includes('price')
    );
    
    if (tableHeaderIndex > -1) {
      // We found a table, parse it
      let currentIndex = tableHeaderIndex + 2; // Skip header separator line
      
      while (currentIndex < lines.length && lines[currentIndex].includes('|')) {
        const itemLine = lines[currentIndex];
        const columns = itemLine.split('|').map(col => col.trim()).filter(col => col.length > 0);
        
        if (columns.length >= 2) {
          // Last column should be price
          const name = columns[0];
          const priceText = columns[columns.length - 1];
          const priceMatch = priceText.match(/₹(\d+(?:\.\d+)?)/);
          
          if (priceMatch) {
            billItems.push({
              id: `item-${billItems.length + 1}`,
              name: name,
              price: parseFloat(priceMatch[1]),
              assignedTo: null
            });
          }
        }
        
        currentIndex++;
      }
    } else {
      // Fallback: Look for patterns that match an item name followed by a price
      const pricePattern = /(.+?)\s+₹(\d+(?:\.\d+)?)/;
      
      for (const line of lines) {
        const match = line.match(pricePattern);
        if (match && !line.toLowerCase().includes('total') && 
            !line.toLowerCase().includes('subtotal') && 
            !line.toLowerCase().includes('tax') && 
            !line.toLowerCase().includes('tip')) {
          
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
      const subtotalMatch = line.match(/subtotal:?\s*₹(\d+(?:\.\d+)?)/i);
      if (subtotalMatch) {
        subtotal = parseFloat(subtotalMatch[1]);
        continue;
      }
      
      // Look for combined tax (GST, CGST+SGST, etc.)
      const taxMatches = [
        line.match(/(?:tax|gst|cgst|sgst|igst).*?:?\s*₹(\d+(?:\.\d+)?)/i),
        line.match(/(?:tax|gst|cgst|sgst|igst).*?\(.*?\).*?:?\s*₹(\d+(?:\.\d+)?)/i)
      ];
      
      for (const taxMatch of taxMatches) {
        if (taxMatch) {
          tax += parseFloat(taxMatch[1]);
        }
      }
      
      const tipMatch = line.match(/(?:tip|gratuity).*?:?\s*₹(\d+(?:\.\d+)?)/i);
      if (tipMatch) {
        tip = parseFloat(tipMatch[1]);
        continue;
      }
      
      const totalMatch = line.match(/total.*?:?\s*₹(\d+(?:\.\d+)?)/i);
      if (totalMatch) {
        total = parseFloat(totalMatch[1]);
        continue;
      }
    }
    
    // If we couldn't extract the summary values, calculate them from items
    if (subtotal === 0 && billItems.length > 0) {
      subtotal = parseFloat(billItems.reduce((sum, item) => sum + item.price, 0).toFixed(2));
      
      // If we have total but no tax/tip, calculate the difference
      if (total > 0 && subtotal > 0 && tax === 0 && tip === 0) {
        const difference = total - subtotal;
        // Assume the difference is split between tax and tip
        tax = parseFloat((difference * 0.6).toFixed(2)); // 60% of difference as tax
        tip = parseFloat((difference * 0.4).toFixed(2)); // 40% of difference as tip
      } else {
        // Estimate tax and tip if not found
        tax = parseFloat((subtotal * 0.05).toFixed(2)); // Assume 5% tax
        tip = parseFloat((subtotal * 0.10).toFixed(2)); // Assume 10% tip
        total = parseFloat((subtotal + tax + tip).toFixed(2));
      }
    }
    
    // If we have subtotal but no total, calculate it
    if (subtotal > 0 && total === 0) {
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
