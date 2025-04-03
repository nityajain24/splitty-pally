
import React from 'react';
import { Upload, FileText, Image } from 'lucide-react';

interface DropZoneProps {
  file: File | null;
  previewUrl: string | null;
  onFileChange: (file: File) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ file, previewUrl, onFileChange }) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };
  
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  return (
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
  );
};

export default DropZone;
