
// OCR Processor utility that integrates with Mistral AI OCR
// Processes bill images and extracts structured data

import { BillItem, BillSummary } from "../context/BillContext";
import { extractTextFromImage } from "./textRecognition";
import { parseBillText } from "./billParser";

// Process a bill image and extract structured data
export const processBillImage = async (file: File): Promise<{ items: BillItem[], summary: BillSummary }> => {
    const mistral_api_endpoint = "https://api.mistral.ai/v1/ocr";
    const MISTRAL_API_KEY = "NapDBMy7WBDVGjaUYgVGrGHnfj19oyu2"; //Hardcoded API KEY
  console.log("Processing bill image:", file.name, file.type, file.size);
  
  try {
    // For demo data, we'll shortcut to fallback data if file is small/empty
    
    
    // Step 1: Extract text from the image using Mistral AI OCR
    console.log("Extracting text from image...");
      let extractedText: string = "";
    try {
        const reader = new FileReader();
        const base64Image = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error('Failed to convert image to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        const requestBody = JSON.stringify({
            model: "mistral-ocr-latest",
            document: {
                type: "image_url",
                image_url: `data:${file.type};base64,${base64Image}`
            }
        });
        const mistralResponse = await fetch(mistral_api_endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MISTRAL_API_KEY}`, // Hardcoded API key
                'Content-Type': 'application/json'
            },
            body: requestBody
        });
        if (!mistralResponse.ok) {
            throw new Error(`HTTP error! status: ${mistralResponse.status}`);
        }
        const responseData = await mistralResponse.json();

        extractedText = responseData.pages[0].markdown;
    const chat_api_endpoint = "https://api.mistral.ai/v1/chat/completions";
    const chatPrompt = `Here is a restaurant bill in Markdown format:
\`\`\`
${extractedText}
\`\`\`
Please extract all order items into JSON.For each item:
- Use the 'Rate' and 'Value' fields to calculate the quantity: Quantity = round(Value ÷ Rate)
- Skip any rows without item data
- Preserve item names and rates
- Round all float values to two decimal places
Also extract metadata replace the single quotes with double quotes give back JS dictionary:
- bill number
- date
- time
- table number
- subtotal
- CGST
- SGST
- total = subtotal + CGST + SGST.
Follow this structure:
{
  "bill_number": "",
  "date": "",
  "time": "",
  "table_number": "",
  "orders": [
    {
      "name": "",
      "quantity": INT,
      "rate": FLOAT
    }
  ],
  "subtotal": FLOAT,
  "cgst": FLOAT,
  "sgst": FLOAT,
  "total": FLOAT
}`;
        const chatRequestBody = JSON.stringify({
            model: "mistral-small",
            messages: [
                {
                    "role": "user",
                    "content": chatPrompt
                }
            ],
            temperature: 0.7
        });
        const chatResponse = await fetch(chat_api_endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MISTRAL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: chatRequestBody
        });
        if (!chatResponse.ok) {
            throw new Error(`HTTP error from chat! status: ${chatResponse.status}`);
        }
        const chatResponseData = await chatResponse.json();

    const responseContent = chatResponseData.choices[0].message.content;

    const jsonStartIndex = responseContent.indexOf('{');
    const jsonEndIndex = responseContent.lastIndexOf('}');
    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      console.error("Could not find JSON in response content");
      return { items: [], summary: { subtotal: 0, tax: 0, tip: 0, total: 0 } };
    }

    const jsonString = responseContent.substring(jsonStartIndex, jsonEndIndex + 1);
    const parsedResponse = JSON.parse(jsonString);
    const billItems: BillItem[] = parsedResponse.orders.map((order: any) => ({
      name: order.name,
      quantity: order.quantity,
      price: order.rate,
    }));
    const billSummary: BillSummary = {
      subtotal: parsedResponse.subtotal,
      tax: parsedResponse.cgst + parsedResponse.sgst,
      tip: 0, // Assuming tip is not included in the response
      total: parsedResponse.total,
    };

    console.log("Successfully parsed JSON:", parsedResponse);
    
    return { items: billItems, summary: billSummary };



        
    } catch (error) {
        console.error("Error calling Mistral AI OCR:", error);
        return { items: [], summary: { subtotal: 0, tax: 0, tip: 0, total: 0 } };
    }
    
    console.log("Text extraction complete, length:", extractedText.length);
    // Step 2: Parse the extracted text to get structured bill data
    console.log("Parsing bill text...");
    const { items, summary } = parseBillText(extractedText);
    console.log("Parsing complete, found", items.length, "items");
    
    // If no items were extracted, fall back to mock data
    if (items.length === 0) {
      console.warn("OCR processing couldn't extract bill items");
      
    }
    
    return { items, summary };
  } catch (error) {
    console.error("Error in OCR processing:", error);
    // In case of any error, provide mock data as fallback
    return { items: [], summary: { subtotal: 0, tax: 0, tip: 0, total: 0 } };
  }
};


