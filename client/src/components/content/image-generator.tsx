import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getCurrentUser, generateMarketingImage } from "@/lib/api";
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
import { Image, Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters",
  }),
  style: z.string({
    required_error: "Please select an image style",
  }),
  industry: z.string({
    required_error: "Please select an industry",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ImageGenerator() {
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
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
      topic: "",
      style: "Realistic",
      industry: "E-commerce",
    },
  });

  const generateImageMutation = useMutation({
    mutationFn: generateMarketingImage,
    onSuccess: (data) => {
      setGeneratedImage(data.imageUrl);
      setGeneratedPrompt(data.prompt);
      setIsGenerating(false);
      toast({
        title: "Image generated successfully!",
        description: "Your AI-generated image is ready.",
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Failed to generate image",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    setIsGenerating(true);
    setGeneratedImage("");
    setGeneratedPrompt("");
    generateImageMutation.mutate(values);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI Image Generator</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Topic/Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Describe what you want in the image"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visual Style</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Realistic">Realistic</SelectItem>
                        <SelectItem value="Minimalist">Minimalist</SelectItem>
                        <SelectItem value="Cartoon">Cartoon</SelectItem>
                        <SelectItem value="3D Render">3D Render</SelectItem>
                        <SelectItem value="Watercolor">Watercolor</SelectItem>
                        <SelectItem value="Flat Design">Flat Design</SelectItem>
                        <SelectItem value="Retro">Retro</SelectItem>
                        <SelectItem value="Neon">Neon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Food">Food & Beverage</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Travel">Travel & Hospitality</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isGenerating}
              >
                <Image className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Image"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Image</h3>
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-sm text-gray-500">Creating your image with AI...</p>
            </div>
          ) : generatedImage ? (
            <div className="space-y-4">
              <div className="rounded-md overflow-hidden border border-gray-200">
                <img src={generatedImage} alt="AI Generated Marketing Image" className="w-full object-cover" />
              </div>
              
              {generatedPrompt && (
                <div className="relative">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Prompt Used:</h4>
                    <p className="text-sm text-gray-500">{generatedPrompt}</p>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => window.open(generatedImage, '_blank')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button>
                  Use Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Image className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500">Your generated image will appear here</p>
              <p className="text-sm text-gray-400 mt-2">
                Fill out the form on the left and click "Generate Image"
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
