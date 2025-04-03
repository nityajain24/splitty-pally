
import React, { useState } from 'react';
import { Receipt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBill } from '../context/BillContext';
import { processBillImage } from '../utils/ocrProcessor';
import { useToast } from '@/hooks/use-toast';
import DropZone from './bill-upload/DropZone';
import ActionButtons from './bill-upload/ActionButtons';
import OcrHelperText from './bill-upload/OcrHelperText';

const BillUpload: React.FC = () => {
  const { dispatch } = useBill();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleFileChange = (selectedFile: File) => {
    console.log("File selected:", selectedFile.name, selectedFile.type, selectedFile.size);
    setFile(selectedFile);
    
    // Create preview for images
    if (selectedFile.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a bill image to upload",
        variant: "destructive",
      });
      return;
    }
    
    // Check if file is an image
    if (!file.type.includes('image')) {
      toast({
        title: "Unsupported file type",
        description: "Please select an image file (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      console.log("Starting bill processing workflow");
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsUploading(false);
      setIsProcessing(true);
      
      toast({
        title: "Processing bill with OCR",
        description: "This might take a moment...",
      });
      
      // Process the bill with OCR
      console.log("Calling processBillImage");
      const { items, summary } = await processBillImage(file);
      console.log("Processing complete, got items:", items.length);
      
      // Update the bill state
      dispatch({ type: "SET_ITEMS", payload: items });
      dispatch({ type: "SET_SUMMARY", payload: summary });
      dispatch({ type: "SET_PROCESSED_BILL", payload: true });
      dispatch({ type: "SET_STEP", payload: 2 });
      
      toast({
        title: "Bill processed successfully",
        description: `Found ${items.length} items on your bill`,
      });
    } catch (error) {
      console.error("Error processing bill:", error);
      toast({
        title: "Processing failed",
        description: "There was an error processing your bill. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
      setIsProcessing(false);
    }
  };
  
  const handleDemoData = async () => {
    setIsProcessing(true);
    
    try {
      console.log("Loading demo data");
      // Create an empty file to trigger the demo data path
      const demoFile = new File([], "demo.jpg", { type: "image/jpeg" });
      
      // Use the mock data
      const { items, summary } = await processBillImage(demoFile);
      
      // Update the bill state
      dispatch({ type: "SET_ITEMS", payload: items });
      dispatch({ type: "SET_SUMMARY", payload: summary });
      dispatch({ type: "SET_PROCESSED_BILL", payload: true });
      dispatch({ type: "SET_STEP", payload: 2 });
      
      toast({
        title: "Demo data loaded",
        description: `Loaded ${items.length} sample items`,
      });
    } catch (error) {
      console.error("Error loading demo data:", error);
      toast({
        title: "Loading failed",
        description: "There was an error loading the demo data",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="splitty-container animate-fade-in">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Receipt className="h-6 w-6 text-splitty-teal" />
            Upload Your Bill
          </CardTitle>
          <CardDescription>
            Upload a picture of your bill to get started with splitting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DropZone 
            file={file} 
            previewUrl={previewUrl}
            onFileChange={handleFileChange}
          />
          
          <ActionButtons 
            file={file}
            isUploading={isUploading}
            isProcessing={isProcessing}
            onUpload={handleUpload}
            onDemoData={handleDemoData}
          />
          
          <OcrHelperText />
        </CardContent>
      </Card>
    </div>
  );
};

export default BillUpload;
