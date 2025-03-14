import { useQuery } from '@tanstack/react-query';
import { Content } from '@shared/schema';

interface ContentItemProps {
  content: Content;
}

function ContentItem({ content }: ContentItemProps) {
  let iconClass = "ri-article-line";
  let iconBgClass = "bg-primary-100";
  let iconColor = "text-primary-600";
  let badgeClass = "bg-blue-100 text-blue-800";
  let statusClass = "bg-yellow-100 text-yellow-800";
  
  if (content.contentType === "social") {
    iconClass = "ri-image-line";
    iconBgClass = "bg-secondary-100";
    iconColor = "text-secondary-600";
    badgeClass = "bg-pink-100 text-pink-800";
  } else if (content.contentType === "email") {
    iconClass = "ri-mail-line";
    iconBgClass = "bg-accent-100";
    iconColor = "text-accent-600";
    badgeClass = "bg-green-100 text-green-800";
  }
  
  if (content.status === "ready") {
    statusClass = "bg-green-100 text-green-800";
  } else if (content.status === "scheduled") {
    statusClass = "bg-gray-100 text-gray-800";
  }
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-10 w-10 rounded ${iconBgClass} flex items-center justify-center`}>
            <i className={`${iconClass} ${iconColor}`}></i>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{content.title}</div>
            <div className="text-sm text-gray-500">{content.description}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
          {content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {content.scheduledFor ? formatDate(content.scheduledFor) : 'Not scheduled'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
          {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
        <button className="text-gray-600 hover:text-gray-900">View</button>
      </td>
    </tr>
  );
}

export default function UpcomingContentList() {
  const { data: contents, isLoading } = useQuery<Content[]>({
    queryKey: ['/api/contents'],
    queryFn: async () => {
      const response = await fetch('/api/contents?userId=1');
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      return response.json();
    }
  });
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Content</h2>
          <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse flex space-x-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              contents?.map((content) => (
                <ContentItem key={content.id} content={content} />
              ))
            )}
            
            {!isLoading && (!contents || contents.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No upcoming content found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
