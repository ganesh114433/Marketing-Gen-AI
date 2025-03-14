import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generateContent, ContentGenerationOptions } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';

export default function AIContentGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContentGenerationOptions>({
    contentType: 'Blog Post',
    topic: '',
    tone: 'Professional',
    length: 'Medium (200-300 words)'
  });
  const [generatedContent, setGeneratedContent] = useState<string>('');
  
  const contentMutation = useMutation({
    mutationFn: generateContent,
    onSuccess: (content) => {
      setGeneratedContent(content);
      toast({
        title: "Content Generated",
        description: "Your AI content has been created successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic) {
      toast({
        title: "Validation Error",
        description: "Please enter a topic or keywords",
        variant: "destructive",
      });
      return;
    }
    
    contentMutation.mutate(formData);
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">AI Content Generator</h2>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">Content Type</label>
            <select 
              id="contentType" 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={formData.contentType}
              onChange={handleInputChange}
            >
              <option>Blog Post</option>
              <option>Social Media Post</option>
              <option>Ad Copy</option>
              <option>Email</option>
              <option>Product Description</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic/Keywords</label>
            <input 
              type="text" 
              id="topic" 
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
              placeholder="e.g. summer fashion, discount offer"
              value={formData.topic}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700">Tone</label>
            <select 
              id="tone" 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={formData.tone}
              onChange={handleInputChange}
            >
              <option>Professional</option>
              <option>Casual</option>
              <option>Enthusiastic</option>
              <option>Informative</option>
              <option>Persuasive</option>
            </select>
          </div>

          <div>
            <label htmlFor="length" className="block text-sm font-medium text-gray-700">Content Length</label>
            <select 
              id="length" 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={formData.length}
              onChange={handleInputChange}
            >
              <option>Short (50-100 words)</option>
              <option>Medium (200-300 words)</option>
              <option>Long (500+ words)</option>
            </select>
          </div>

          <div className="pt-3">
            <button 
              type="submit" 
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={contentMutation.isPending}
            >
              {contentMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <i className="ri-magic-line mr-2"></i>
                  Generate Content
                </>
              )}
            </button>
          </div>
        </form>
        
        {generatedContent && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Generated Content:</h3>
            <div className="text-sm text-gray-600 max-h-48 overflow-y-auto">
              {generatedContent.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-2">{paragraph}</p>
              ))}
            </div>
            <div className="mt-2 flex justify-end">
              <button 
                className="text-xs text-primary-600 hover:text-primary-500 focus:outline-none"
                onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                  toast({
                    title: "Copied",
                    description: "Content copied to clipboard",
                    variant: "default",
                  });
                }}
              >
                <i className="ri-clipboard-line mr-1"></i> Copy to clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
