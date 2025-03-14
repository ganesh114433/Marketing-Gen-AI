import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const GenerationShortcuts = () => {
  const shortcuts = [
    {
      title: "Social Media Post",
      description: "Generate posts for any platform",
      icon: "ri-chat-4-line",
      color: "primary",
      path: "/content-generator?type=social"
    },
    {
      title: "Blog Article",
      description: "Full articles with SEO optimization",
      icon: "ri-newspaper-line",
      color: "secondary",
      path: "/content-generator?type=blog"
    },
    {
      title: "Email Campaign",
      description: "Newsletters, promos & follow-ups",
      icon: "ri-mail-line",
      color: "accent",
      path: "/content-generator?type=email"
    },
    {
      title: "AI Image",
      description: "Generate images from descriptions",
      icon: "ri-image-add-line",
      color: "success",
      path: "/image-generator"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          gradient: "from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15",
          iconBg: "bg-primary bg-opacity-10 text-primary"
        };
      case 'secondary':
        return {
          gradient: "from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/15",
          iconBg: "bg-secondary bg-opacity-10 text-secondary"
        };
      case 'accent':
        return {
          gradient: "from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/15",
          iconBg: "bg-accent bg-opacity-10 text-accent"
        };
      case 'success':
        return {
          gradient: "from-success/5 to-success/10 hover:from-success/10 hover:to-success/15",
          iconBg: "bg-success bg-opacity-10 text-success"
        };
      default:
        return {
          gradient: "from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200",
          iconBg: "bg-slate-200 text-slate-600"
        };
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg font-heading">Quick Create</h3>
          <Button variant="link" className="text-primary p-0 h-auto">See Templates</Button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {shortcuts.map((shortcut, index) => {
            const colorClasses = getColorClasses(shortcut.color);
            
            return (
              <Link key={index} href={shortcut.path}>
                <Button
                  variant="outline"
                  className={`p-4 rounded-lg border border-slate-200 bg-gradient-to-r ${colorClasses.gradient} text-left flex items-center w-full justify-start h-auto`}
                >
                  <div className={`h-10 w-10 rounded-full ${colorClasses.iconBg} flex items-center justify-center mr-3`}>
                    <i className={shortcut.icon}></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{shortcut.title}</h4>
                    <p className="text-xs text-slate-500">{shortcut.description}</p>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default GenerationShortcuts;
