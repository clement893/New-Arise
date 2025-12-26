/**
 * Blog Sitemap Route
 * 
 * Generates XML sitemap for blog posts.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Replace with actual blog posts API endpoint when available
  // const posts = await fetchBlogPosts({ status: 'published' });
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Placeholder sitemap structure
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Blog posts will be added here when API is integrated -->
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

