import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getCurrentUser, generateAiContent } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  contentType: z.string({
    required_error: "Please select a content type",
  }),
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters",
  }),
  tone: z.string({
    required_error: "Please select a tone",
  }),
  additionalContext: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiGenerator() {
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    refetchOnWindowFocus: false,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentType: "Social Media Post",
      topic: "",
      tone: "Professional",
      additionalContext: "",
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: generateAiContent,
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setIsGenerating(false);
      toast({
        title: "Content generated successfully!",
        description: "Your AI-generated content is ready.",
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Failed to generate content",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    setIsGenerating(true);
    setGeneratedContent("");
    generateContentMutation.mutate(values);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI Content Generator</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="contentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Social Media Post">Social Media Post</SelectItem>
                        <SelectItem value="Blog Post">Blog Post</SelectItem>
                        <SelectItem value="Email Newsletter">Email Newsletter</SelectItem>
                        <SelectItem value="Ad Copy">Ad Copy</SelectItem>
                        <SelectItem value="Product Description">Product Description</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic/Keywords</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Black Friday sale, winter fashion"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tone</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="Informative">Informative</SelectItem>
                        <SelectItem value="Persuasive">Persuasive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Context (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional information or context"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isGenerating}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Content"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Content</h3>
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-sm text-gray-500">Creating your content with AI...</p>
            </div>
          ) : generatedContent ? (
            <div className="relative">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">{generatedContent}</div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(generatedContent)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </svg>
                  Copy
                </Button>
                <Button variant="outline">Save to Library</Button>
                <Button>Use Content</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Wand2 className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500">Your generated content will appear here</p>
              <p className="text-sm text-gray-400 mt-2">
                Fill out the form on the left and click "Generate Content"
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
