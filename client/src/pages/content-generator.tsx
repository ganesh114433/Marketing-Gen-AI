import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentForm from "../components/content/ContentForm";

const ContentGenerator = () => {
  const [generatedContent, setGeneratedContent] = useState<string>("");

  const handleGeneratedContent = (content: string) => {
    setGeneratedContent(content);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ContentForm onGeneratedContent={handleGeneratedContent} />
        </div>
        <div>
          <Card className="h-full">
            <Tabs defaultValue="preview">
              <div className="border-b px-6 py-3">
                <TabsList className="bg-slate-100">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                </TabsList>
              </div>
              <CardContent className="p-6">
                <TabsContent value="preview" className="mt-0">
                  {generatedContent ? (
                    <div className="prose max-w-none">
                      {generatedContent.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center p-8">
                      <div>
                        <i className="ri-ai-generate text-5xl text-slate-300 mb-4 block"></i>
                        <h3 className="font-medium text-lg text-slate-800 mb-2">Content Preview</h3>
                        <p className="text-slate-500 text-sm">Fill out the form and generate content to see it displayed here.</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="html" className="mt-0">
                  {generatedContent ? (
                    <pre className="p-4 bg-slate-100 rounded-lg overflow-auto text-xs text-slate-800 max-h-[600px]">
                      {generatedContent}
                    </pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center p-8">
                      <div>
                        <i className="ri-code-line text-5xl text-slate-300 mb-4 block"></i>
                        <h3 className="font-medium text-lg text-slate-800 mb-2">HTML View</h3>
                        <p className="text-slate-500 text-sm">Generate content first to see the HTML version.</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-medium mb-4">Content Generation Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Be Specific</h3>
              <p className="text-sm text-slate-600">The more specific your topic and keywords, the better the AI can generate relevant content.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Choose the Right Tone</h3>
              <p className="text-sm text-slate-600">Different platforms and audiences respond to different tones. Match your tone to your target audience.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Edit Before Publishing</h3>
              <p className="text-sm text-slate-600">Always review and edit AI-generated content to ensure it matches your brand voice and message.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentGenerator;
