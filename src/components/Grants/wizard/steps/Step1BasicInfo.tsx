'use client';

import { useState } from 'react';
import { useGrantWizard } from '@/contexts/GrantWizardContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Upload, FileText, File, X, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Step1BasicInfo() {
  const { grantData, updateGrantData } = useGrantWizard();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      
      // Simulate upload process
      setUploadStatus('uploading');
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          // Store document reference in grant data
          updateGrantData({
            documents: [...(grantData.documents || []), 
              ...newFiles.map(file => ({ name: file.name, size: file.size, type: file.type, uploadedAt: new Date().toISOString() }))
            ]
          });
        }
      }, 300);
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    
    // Update grant data
    const documents = [...(grantData.documents || [])];
    documents.splice(index, 1);
    updateGrantData({ documents });
  };
  
  return (
    <div className="space-y-8">
      {/* Document Upload Section */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
        <div className="text-center mb-4">
          <Upload className="mx-auto h-10 w-10 text-blue-500 mb-2" />
          <h3 className="text-lg font-semibold">Upload Grant Documents</h3>
          <p className="text-gray-500 text-sm">Upload RFP documents, guidelines, and requirements</p>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <label className="cursor-pointer">
            <div className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md flex items-center transition-colors">
              <FileText className="mr-2 h-5 w-5" />
              <span>Browse Files</span>
            </div>
            <input 
              type="file" 
              className="hidden" 
              multiple 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" 
              onChange={handleFileChange} 
            />
          </label>
        </div>
        
        {uploadStatus === 'uploading' && (
          <div className="mb-4">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">Uploading... {uploadProgress}%</p>
          </div>
        )}
        
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Uploaded Files:</h4>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border text-sm">
                <div className="flex items-center">
                  <File className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="text-gray-400 text-xs ml-2">({Math.round(file.size / 1024)} KB)</span>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-bold flex items-center text-gray-800 mb-2">
          <FileText className="mr-2 h-5 w-5 text-blue-500" />
          Grant Information
        </h2>
        <p className="text-gray-500 text-sm mb-4">Enter the basic details about the grant.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grantName" className="text-gray-700 flex items-center">
              Grant Name <span className="text-red-500 ml-1">*</span>
              {grantData.name && <Check className="h-4 w-4 text-green-500 ml-2" />}
            </Label>
            <Input
              id="grantName"
              placeholder="Enter grant name"
              value={grantData.name || ''}
              onChange={(e) => updateGrantData({ name: e.target.value })}
              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fundingSource">Funding Source *</Label>
            <Input
              id="fundingSource"
              placeholder="E.g., Federal, State, Private Foundation"
              value={grantData.fundingSource || ''}
              onChange={(e) => updateGrantData({ fundingSource: e.target.value })}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Provide a brief description of the grant"
            value={grantData.description || ''}
            onChange={(e) => updateGrantData({ description: e.target.value })}
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !grantData.startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {grantData.startDate ? (
                    format(new Date(grantData.startDate), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={grantData.startDate ? new Date(grantData.startDate) : undefined}
                  onSelect={(date) =>
                    updateGrantData({ startDate: date?.toISOString().split('T')[0] })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !grantData.endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {grantData.endDate ? (
                    format(new Date(grantData.endDate), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={grantData.endDate ? new Date(grantData.endDate) : undefined}
                  onSelect={(date) =>
                    updateGrantData({ endDate: date?.toISOString().split('T')[0] })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
