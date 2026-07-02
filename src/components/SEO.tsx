import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  name?: string;
  type?: string;
  image?: string;
  url?: string;
}

export function SEO({ title, description, name = "تحدي المعرفة", type = "website", image, url }: SEOProps) {
  const siteUrl = "https://tahadi-almaarifa.com"; // Placeholder URL
  const currentUrl = url ? `${siteUrl}${url}` : siteUrl;
  const defaultImage = `${siteUrl}/icon.png`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title} | {name}</title>
      <meta name='description' content={description} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph tags */}
      <meta property="og:title" content={`${title} | ${name}`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | ${name}`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
}
