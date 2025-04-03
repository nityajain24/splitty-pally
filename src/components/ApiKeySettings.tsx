
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ApiKeySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>("");
  
  // Load saved API key on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem('mistralApiKey');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [open]);
  
  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Mistral AI API key",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem('mistralApiKey', apiKey.trim());
    
    toast({
      title: "API Key Saved",
      description: "Your Mistral AI API key has been saved",
    });
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mistral AI API Key</DialogTitle>
          <DialogDescription>
            Enter your Mistral AI API key to enable OCR processing of bill images.
            You can get an API key from the <a href="https://console.mistral.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Mistral AI Console</a>.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Mistral AI API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Your API key is stored locally in your browser and is not sent to our servers.</p>
            <p className="mt-1">Please note that OCR API calls may incur charges on your Mistral AI account.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save API Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeySettings;
