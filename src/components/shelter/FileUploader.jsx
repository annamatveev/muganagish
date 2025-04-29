import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Camera } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { Progress } from "@/components/ui/progress";

export default function FileUploader({ value = [], onChange, maxFiles = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Check file size (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`הקבצים הבאים גדולים מדי (מעל 5MB): ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    // Check if we're exceeding max files
    if (value.length + files.length > maxFiles) {
      alert(`ניתן להעלות מקסימום ${maxFiles} תמונות`);
      return;
    }
    
    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(Math.round((i / files.length) * 100));
        
        // Upload file
        const { file_url } = await UploadFile({ file });
        
        // Update photos array
        onChange([...value, file_url]);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("אירעה שגיאה בהעלאת הקבצים. אנא נסו שוב.");
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
    }
  };
  
  const removePhoto = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };
  
  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">תמונות (אופציונלי)</Label>
        <span className="text-sm text-gray-500">
          {value.length}/{maxFiles} תמונות
        </span>
      </div>
      
      {uploading ? (
        <div className="p-4 border border-dashed rounded-lg bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">מעלה תמונות...</p>
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-xs text-gray-400">{progress}%</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div 
            className="p-4 border border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">לחצו להעלאת תמונות</p>
              <p className="text-xs text-gray-500">
                ניתן להעלות עד {maxFiles} תמונות (JPG, PNG, עד 5MB כל אחת)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {isMobile && (
            <div 
              className="p-4 border border-dashed rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
              onClick={() => cameraInputRef.current?.click()}
            >
              <div className="text-center">
                <Camera className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm font-medium text-blue-700 mb-1">צלמו תמונה מהמצלמה</p>
                <p className="text-xs text-blue-600">
                  צלמו את המקלט ישירות מהמכשיר שלכם
                </p>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {value.map((photoUrl, index) => (
            <div 
              key={index}
              className="relative rounded-lg overflow-hidden border aspect-square group"
            >
              <img 
                src={photoUrl} 
                alt={`תמונת מקלט ${index + 1}`} 
                className="object-cover w-full h-full"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 left-1 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}