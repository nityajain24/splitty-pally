
import { BillItem, BillSummary } from "../context/BillContext";

/**
* Parse OCR text to extract bill items and summary
* @param {string} ocrText - The text extracted from the bill image
* @returns {{ items: BillItem[], summary: BillSummary }} - Structured bill data
*/
export function parseBillText(ocrText: string): { items: BillItem[], summary: BillSummary } {
    try {

        const extractOrderDetails = (markdown) => {
            const lines = markdown.split('\n').filter(line => line.startsWith('|'));
            const orderLines = lines.slice(2); // Skip header and separator
          
            const orders = orderLines.map(line => {                
                const cols = line.split('|').map(col => col.trim()).filter(col => col.length > 0);
                const [ , dish, qty, rate] = cols;
                return { dish, qty: parseInt(qty) , rate: parseFloat(rate) }
            });            
          
            return orders;
          };
        console.log("Parsing bill text:", ocrText);
        // Parse the markdown text from Mistral OCR
        const markdown = ocrText;
        const lines = markdown.split('\n').map(line => line.trim());
        


        // Extract items (look for table data)
        const billItems: BillItem[] = [];
        const orders = extractOrderDetails(markdown);

        orders.forEach((order, index) => {
            if (!isNaN(order.qty) && !isNaN(order.rate)) {
                billItems.push({
                    id: `item-${index + 1}`,
                    name: order.dish,
                    price: order.rate,
                    assignedTo: null
                });
            }
        });


        console.log("Extracted items:", billItems);


        // Extract summary information
        let subtotal = 0;
        let tax = 0;
        let tip = 0;
        let total = 0;

        // Look for summary entries
        for (const line of lines) {
            // Look for combined tax (COST, SOST)
            const taxMatches = [
                line.match(/(?:COST|SOST).*?:?\s*(\d+(?:\.\d+)?)/i)
            ];

            for (const taxMatch of taxMatches) {
                if (taxMatch) {
                    tax += parseFloat(taxMatch[1]);
                    console.log("Found tax component:", parseFloat(taxMatch[1]));
                }
            }
            const totalMatch = line.match(/Total.*?:?\s*(\d+(?:\.\d+)?)/i);
            if (totalMatch) {
                total = parseFloat(totalMatch[1]);
                console.log("Found total:", total);
                continue;
            }
        }


        const summary: BillSummary = {
            subtotal,
            tax,
            tip,
            total
        };

        console.log("Final bill summary:", summary);

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
