import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import ImageForm from "../components/content/ImageForm";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "../App";

const ImageGenerator = () => {
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  
  const { data: previousImages = [], isLoading } = useQuery({
    queryKey: ["/api/images", { userId: currentUser.id }],
  });

  const handleGeneratedImage = (imageUrl: string) => {
    setGeneratedImageUrl(imageUrl);
  };

  const downloadImage = async () => {
    if (!generatedImageUrl) return;
    
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ImageForm onGeneratedImage={handleGeneratedImage} />
        </div>
        <div>
          <Card className="h-full">
            <div className="border-b px-6 py-3 flex justify-between items-center">
              <h3 className="font-medium">Image Preview</h3>
              {generatedImageUrl && (
                <Button size="sm" variant="outline" onClick={downloadImage}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
            </div>
            <CardContent className="p-6">
              {generatedImageUrl ? (
                <div className="flex items-center justify-center">
                  <img 
                    src={generatedImageUrl} 
                    alt="Generated image" 
                    className="max-h-[500px] rounded-lg shadow-md" 
                  />
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-lg">
                  <div>
                    <i className="ri-image-add-line text-5xl text-slate-300 mb-4 block"></i>
                    <h3 className="font-medium text-lg text-slate-800 mb-2">Image Preview</h3>
                    <p className="text-slate-500 text-sm">Fill out the form and generate an image to see it displayed here.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-medium">Previous Generated Images</h2>
        </div>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : previousImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {previousImages.slice(0, 6).map((image: any) => (
                <div key={image.id} className="border rounded-lg overflow-hidden">
                  <div className="h-40 bg-slate-100 relative">
                    {image.imageUrl && (
                      <img 
                        src={image.imageUrl} 
                        alt={image.title} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{image.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 truncate">{image.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="ri-gallery-line text-4xl text-slate-300 mb-3 block"></i>
              <p className="text-slate-500">No images generated yet. Create your first image!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageGenerator;
