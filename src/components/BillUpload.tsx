
import React, { useState } from 'react';
import { Upload, Receipt, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBill } from '../context/BillContext';
import { processBillImage } from '../utils/ocrProcessor';
import { useToast } from '@/hooks/use-toast';

const BillUpload: React.FC = () => {
  const { dispatch } = useBill();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
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
    }
  };
  
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // Create preview for images
      if (droppedFile.type.includes('image')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(droppedFile);
      } else {
        setPreviewUrl(null);
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
    
    setIsUploading(true);
    
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsUploading(false);
      setIsProcessing(true);
      
      toast({
        title: "Processing bill with OCR",
        description: "This might take a moment...",
      });
      
      // Process the bill with OCR
      const { items, summary } = await processBillImage(file);
      
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
        description: "There was an error processing your bill",
        variant: "destructive",
      });
      setIsUploading(false);
      setIsProcessing(false);
    }
  };
  
  const handleDemoData = async () => {
    setIsProcessing(true);
    
    try {
      // Use the mock data directly
      const { items, summary } = await processBillImage(new File([], "demo"));
      
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
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('bill-upload')?.click()}
          >
            <input 
              type="file" 
              id="bill-upload" 
              className="hidden" 
              onChange={handleFileChange}
              accept="image/*,application/pdf"
            />
            
            {previewUrl ? (
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 mb-4 relative overflow-hidden rounded-md shadow-md">
                  <img 
                    src={previewUrl} 
                    alt="Bill preview" 
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-sm font-medium mb-1">Click to replace</p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto mb-2 text-splitty-gray" />
                <p className="text-lg font-medium mb-1">Drop your bill here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG, and PDF</p>
              </>
            )}
            
            {file && !previewUrl && (
              <div className="mt-4 p-2 bg-accent/50 rounded-md flex items-center">
                {file.type.includes('image') ? (
                  <Image className="h-4 w-4 mr-2 text-splitty-teal" />
                ) : (
                  <FileText className="h-4 w-4 mr-2 text-splitty-teal" />
                )}
                <span className="text-sm truncate">{file.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading || isProcessing}
              className="flex-1"
            >
              {isUploading ? "Uploading..." : isProcessing ? "Processing with OCR..." : "Process Bill"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDemoData}
              disabled={isUploading || isProcessing}
              className="flex-1"
            >
              Try Demo Data
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 text-center">
            <p>OCR processing uses image recognition to extract bill details automatically</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillUpload;
