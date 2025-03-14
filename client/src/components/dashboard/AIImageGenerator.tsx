import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generateImage, ImageGenerationOptions } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';

export default function AIImageGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ImageGenerationOptions>({
    prompt: '',
    style: 'Photorealistic',
    size: '1:1 (Square)'
  });
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  
  const imageMutation = useMutation({
    mutationFn: generateImage,
    onSuccess: (imageUrl) => {
      setGeneratedImageUrl(imageUrl);
      toast({
        title: "Image Generated",
        description: "Your AI image has been created successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt) {
      toast({
        title: "Validation Error",
        description: "Please enter an image description",
        variant: "destructive",
      });
      return;
    }
    
    imageMutation.mutate(formData);
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">AI Image Generator</h2>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Image Description</label>
            <textarea 
              id="prompt" 
              rows={3} 
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
              placeholder="Describe the image you want to generate..."
              value={formData.prompt}
              onChange={handleInputChange}
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700">Style</label>
            <select 
              id="style" 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={formData.style}
              onChange={handleInputChange}
            >
              <option>Photorealistic</option>
              <option>Cartoon</option>
              <option>3D Render</option>
              <option>Watercolor</option>
              <option>Minimalist</option>
            </select>
          </div>

          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size</label>
            <select 
              id="size" 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={formData.size}
              onChange={handleInputChange}
            >
              <option>1:1 (Square)</option>
              <option>4:5 (Instagram)</option>
              <option>9:16 (Stories)</option>
              <option>16:9 (Landscape)</option>
            </select>
          </div>

          <div className="pt-3">
            <button 
              type="submit" 
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
              disabled={imageMutation.isPending}
            >
              {imageMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <i className="ri-image-add-line mr-2"></i>
                  Generate Image
                </>
              )}
            </button>
          </div>
        </form>
        
        {generatedImageUrl && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Generated Image:</h3>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <img 
                src={generatedImageUrl} 
                alt="AI generated image" 
                className="w-full h-auto"
              />
            </div>
            <div className="mt-2 flex justify-end">
              <a 
                href={generatedImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:text-primary-500 focus:outline-none"
              >
                <i className="ri-download-line mr-1"></i> Download
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
