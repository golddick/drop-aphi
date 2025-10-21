'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getBlogPost, getRelatedPosts } from '@/actions/blog/get.blog';
import Loader from '@/components/_component/Loader';
import Read from './Read';
import Header from '@/modules/landingPage/Home/component/header';

interface BlogPostPageProps {
  slug: string;
}

export default function BlogPostPage({ slug }: BlogPostPageProps) {
  // ✅ All hooks should be declared before any condition or return
  const [post, setPost] = useState<any | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch main blog post
        const postResponse = await getBlogPost(slug);
        console.log('postResponse:', postResponse);

        if (!postResponse.success || !postResponse.data) {
          setError('Post not found');
          return;
        }

        setPost(postResponse.data);

        // Fetch related posts if main post exists
        const relatedResponse = await getRelatedPosts(postResponse.data.id);
        if (relatedResponse.success && relatedResponse.data) {
          setRelatedPosts(relatedResponse.data);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Conditional UI rendering AFTER all hooks
  if (error) {
    return notFound();
  }

  if (loading || !post) {
    return <Loader />;
  }

  return (
    <div>
      <Header 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />
      <Read 
        post={post} 
        relatedPosts={relatedPosts} 
      />
    </div>
  );
}
