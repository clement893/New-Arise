/**
 * Blog RSS Feed Route
 * 
 * Generates RSS feed for blog posts.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Replace with actual blog posts API endpoint when available
  // const posts = await fetchBlogPosts({ status: 'published', limit: 50 });
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const siteName = process.env.NEXT_PUBLIC_APP_NAME || 'Blog';
  const siteDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Latest blog posts';
  
  // Placeholder RSS feed structure
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${baseUrl}/blog</link>
    <description>${siteDescription}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/rss" rel="self" type="application/rss+xml"/>
    <!-- Posts will be added here when API is integrated -->
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}


