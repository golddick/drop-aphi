


'use client';

import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { getBlogPost, getRelatedPosts } from '@/actions/blog/get.blog';
import Loader from '@/components/_component/Loader';
import Read from '../Read';


interface BlogPostPageProps {

    slug: string;

}

interface PostData {
  id: string;
  title: string;
  content: string;
  // ... other post fields
}

export default function BlogPostPage({ slug }: BlogPostPageProps) {
  const router = useRouter();
  const [post, setPost] = useState<any | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch main blog post
        const postResponse = await getBlogPost(slug);
        
        if (!postResponse.success || !postResponse.data) {
          setError('Post not found');
          return;
        }
        
        setPost(postResponse.data);
        
        // Fetch related posts if main post exists
        if (postResponse.data) {
          const relatedResponse = await getRelatedPosts(postResponse.data.id);
          if (relatedResponse.success && relatedResponse.data) {
            setRelatedPosts(relatedResponse.data);
          }
        }
      } catch (err) {
        setError('Failed to load post');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (error) {
    return notFound();
  }

  if (loading || !post) {
    return <Loader />;
  }

  return (
    <div>
      <Read 
        post={post} 
        relatedPosts={relatedPosts} 
      />
    </div>
  );
}