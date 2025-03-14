import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "../../App";
import { formatDistanceToNow } from "date-fns";

interface RecentContentProps {
  userId: number;
}

const RecentContent: React.FC<RecentContentProps> = ({ userId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/content", { userId }],
  });

  // Get recent content
  const getRecentContent = () => {
    if (!data || !Array.isArray(data)) return [];
    
    return data
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3); // Get only the 3 most recent
  };

  const recentContent = getRecentContent();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog':
        return { text: 'Blog Post', color: 'bg-primary bg-opacity-10 text-primary' };
      case 'social':
        return { text: 'Social Media', color: 'bg-secondary bg-opacity-10 text-secondary' };
      case 'email':
        return { text: 'Email', color: 'bg-accent bg-opacity-10 text-accent' };
      default:
        return { text: type, color: 'bg-slate-200 text-slate-600' };
    }
  };

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/5"></div>
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-red-600">Error loading recent content: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg font-heading">Recent Content</h3>
          <Button variant="link" className="text-primary p-0 h-auto">View All</Button>
        </div>
        
        {/* Content items */}
        <div className="space-y-4">
          {recentContent.length > 0 ? (
            recentContent.map(content => {
              const typeInfo = getTypeLabel(content.type);
              
              return (
                <div key={content.id} className="p-3 rounded-lg hover:bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-800">{content.title}</h4>
                    <span className="text-xs text-slate-500">{getTimeAgo(content.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{content.content}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.color}`}>{typeInfo.text}</span>
                    {content.wordCount && (
                      <span className="text-xs text-slate-500">{content.wordCount} words</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-500">
              <p>No content created yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentContent;
