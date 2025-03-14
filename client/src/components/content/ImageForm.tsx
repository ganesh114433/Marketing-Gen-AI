import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser } from "../../App";
import { ImageGenerationRequest } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters long"),
  style: z.enum(["realistic", "artistic", "cartoon", "3d", "abstract"]).optional(),
  size: z.enum(["small", "medium", "large"]).optional(),
});

interface ImageFormProps {
  onGeneratedImage?: (imageUrl: string) => void;
}

const ImageForm: React.FC<ImageFormProps> = ({ onGeneratedImage }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      prompt: "",
      style: "realistic",
      size: "medium",
    },
  });
  
  const generateImageMutation = useMutation({
    mutationFn: async (data: ImageGenerationRequest) => {
      const response = await apiRequest("POST", "/api/images/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Image Generated",
        description: "Your image has been generated successfully.",
      });
      
      if (onGeneratedImage) {
        onGeneratedImage(data.imageUrl);
      }
      
      // Save the image entry
      saveImageMutation.mutate({
        title: form.getValues().title,
        prompt: form.getValues().prompt,
        imageUrl: data.imageUrl,
        status: "generated",
        userId: currentUser.id,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: `Failed to generate image: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const saveImageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/images", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: `Failed to save image: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const { title, ...imageRequest } = data;
    generateImageMutation.mutate(imageRequest);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Image</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for your image" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what you want to see in the image" 
                      className="min-h-[100px] resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="artistic">Artistic</SelectItem>
                        <SelectItem value="cartoon">Cartoon</SelectItem>
                        <SelectItem value="3d">3D</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={generateImageMutation.isPending}
            >
              {generateImageMutation.isPending ? "Generating..." : "Generate Image"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ImageForm;
