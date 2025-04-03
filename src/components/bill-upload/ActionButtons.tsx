
import React from 'react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  isUploading: boolean;
  isProcessing: boolean;
  file: File | null;
  onUpload: () => void;
  onDemoData: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  isUploading, 
  isProcessing, 
  file, 
  onUpload, 
  onDemoData 
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button 
        onClick={onUpload} 
        disabled={!file || isUploading || isProcessing}
        className="flex-1"
      >
        {isUploading ? "Uploading..." : isProcessing ? "Processing with OCR..." : "Process Bill"}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onDemoData}
        disabled={isUploading || isProcessing}
        className="flex-1"
      >
        Try Demo Data
      </Button>
    </div>
  );
};

export default ActionButtons;
