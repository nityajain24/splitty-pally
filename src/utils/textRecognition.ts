
// Text recognition utility for OCR processing
// This interfaces with DeepSeek to extract text from images

/**
 * Extracts text from an image using DeepSeek's API
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - The extracted text
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    // Convert image to base64 for API processing
    const base64Image = await fileToBase64(imageFile);
    
    // In a production app, this would call the DeepSeek API
    // For now, we'll simulate a response for the MVP
    const extractedText = await simulateOcrProcessing(base64Image);
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
 * Simulates OCR processing for the MVP
 * In a production app, this would be replaced with an actual DeepSeek API call
 */
async function simulateOcrProcessing(base64Image: string): Promise<string> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Sample OCR text output that resembles a restaurant bill
  return `
RESTAURANT NAME
123 Main Street, City
Phone: 555-123-4567
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Order #: 12345

ITEMS                    PRICE
---------------------------------
Chicken Pasta            ₹15.99
Caesar Salad             ₹9.99
Garlic Bread             ₹4.99
Margherita Pizza         ₹14.99
Tiramisu                 ₹7.99
Coke                     ₹2.99
Sparkling Water          ₹3.99

---------------------------------
Subtotal:                ₹60.93
Tax (8%):                ₹4.87
Tip (15%):               ₹9.14
---------------------------------
Total:                   ₹74.94

Thank you for dining with us!
`;
}

/**
 * In a production app, this would call the DeepSeek API with the image
 * For reference, this is how a real integration might look:
 */
/*
async function callDeepSeekOcrApi(base64Image: string): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/ocr', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image,
      options: {
        language: 'auto',
        details: true,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.text;
}
*/
