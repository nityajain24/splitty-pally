
import React from 'react';
import { Info } from 'lucide-react';

const OcrHelperText: React.FC = () => {
  return (
    <div className="text-xs text-muted-foreground mt-4 text-center">
      <div className="flex items-center justify-center mb-1">
        <Info className="h-3 w-3 mr-1" />
        <p className="font-medium">About OCR Processing</p>
      </div>
      <p className="max-w-md mx-auto">
        OCR (Optical Character Recognition) analyzes your bill image to extract items and prices automatically. 
        For best results, use a clear, well-lit image. Processing requires a Mistral AI API key.
      </p>
    </div>
  );
};

export default OcrHelperText;
