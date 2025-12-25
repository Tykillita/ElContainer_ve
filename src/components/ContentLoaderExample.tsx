import React, { useState, useEffect } from 'react';
import { PageSkeletonLoader, SkeletonLoader } from './LoadingAnimation';

interface ContentData {
  id: number;
  title: string;
  description: string;
  image: string;
}

const ContentLoaderExample: React.FC = () => {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate fetching content
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData: ContentData = {
        id: 1,
        title: 'Premium Car Wash Service',
        description: 'Experience our premium car wash service with eco-friendly products and professional care for your vehicle.',
        image: 'https://placehold.co/400x200'
      };
      
      setContent(mockData);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Content Loading Example</h1>
      
      {loading ? (
        // Show skeleton loader while content is loading
        <div className="bg-white/5 rounded-xl p-6">
          <SkeletonLoader lines={5} avatar={true} />
        </div>
      ) : (
        // Show actual content when loaded
        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            <div>
              <h2 className="text-xl font-semibold text-white">{content?.title}</h2>
              <p className="text-white/70 mt-2">{content?.description}</p>
              <div className="mt-4">
                <img 
                  src={content?.image} 
                  alt={content?.title} 
                  className="rounded-lg w-full max-w-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Page Section Loading</h2>
        
        {loading ? (
          // Show page skeleton for entire section
          <PageSkeletonLoader items={2} header={false} footer={false} />
        ) : (
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-medium text-white">Service Details</h3>
              <p className="text-white/70 mt-1">Premium service with attention to detail</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-medium text-white">Booking Information</h3>
              <p className="text-white/70 mt-1">Available 24/7 with flexible scheduling</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentLoaderExample;