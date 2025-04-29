
// Text recognition utility for OCR processing
// This interfaces with Mistral AI to extract text from images

/**
 * Extracts text from an image using Mistral AI's OCR
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - The extracted text
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    // Convert image to base64 for API processing
    const base64Image = await fileToBase64(imageFile);
    
    // Process the image with Mistral AI OCR
    const extractedText = await processMistralOcr(base64Image, imageFile.type);
    return extractedText;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to process image with OCR");
  }
}

/**
 * Converts a file to base64 encoding
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Process an image with Mistral AI OCR
 * In production, this should call the actual Mistral API with your API key
 */
async function processMistralOcr(base64Image: string, mimeType: string): Promise<string> {
  try {
    // In production, replace this with actual API call:
    // const response = await fetch('https://api.mistral.ai/v1/ocr/process', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${MISTRAL_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'mistral-ocr-latest',
    //     document: {
    //       type: 'image_url',
    //       image_url: `data:${mimeType};base64,${base64Image}`
    //     }
    //   }),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Mistral API error: ${response.statusText}`);
    // }
    // 
    // const data = await response.json();
    // return data.text;
    
    // For the demo, we'll simulate a response to avoid needing API keys
    console.log("Processing image with Mistral AI OCR simulation...");
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a simulated bill text for demonstration
    return generateSampleBillText();
  } catch (error) {
    console.error("Error calling Mistral OCR API:", error);
    throw error;
  }
}

/**
 * Generate a sample bill text for demonstration purposes
 * This simulates what the Mistral OCR would return
 */
function generateSampleBillText(): string {
  // Generate a realistic bill with current date and time
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();
  const orderNumber = Math.floor(10000 + Math.random() * 90000);
  
  return `
# RESTAURANT RECEIPT

**Spice Garden Restaurant**
123 Park Avenue, Mumbai
Tel: +91 22 2345 6789
GST No: 27AABCS1234Z1Z5

Date: ${formattedDate}
Time: ${formattedTime}
Order #: ${orderNumber}
Server: Rahul

## ITEMS

| Item | Qty | Price |
|------|-----|-------|
| Butter Chicken | 1 | ₹450.00 |
| Garlic Naan | 2 | ₹120.00 |
| Paneer Tikka | 1 | ₹350.00 |
| Dal Makhani | 1 | ₹280.00 |
| Veg Biryani | 1 | ₹320.00 |
| Gulab Jamun | 2 | ₹180.00 |
| Masala Chai | 2 | ₹100.00 |

## SUMMARY

Subtotal: ₹1800.00
CGST (2.5%): ₹45.00
SGST (2.5%): ₹45.00
Tip Suggestion (10%): ₹180.00

**Total Amount: ₹1890.00**

Thank you for dining with us!
Please visit again.
`;
}

/**
 * In a production app, this would call the actual Mistral API with your API key
 * Example implementation:
 */
/*
async function callMistralOcrApi(base64Image: string, mimeType: string): Promise<string> {
  const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
  
  if (!MISTRAL_API_KEY) {
    throw new Error("Mistral API key is not configured");
  }

  const response = await fetch('https://api.mistral.ai/v1/ocr/process', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        image_url: `data:${mimeType};base64,${base64Image}`
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.text;
}
*/
