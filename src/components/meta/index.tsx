import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
}

export const Meta: React.FC<MetaProps> = ({ title: pageTitle, description, canonicalPath }) => {
  const canonicalUrl = canonicalPath ? `${process.env.CANONICAL_URL_ORIGIN}${canonicalPath}` : undefined;

  return (
    <Helmet>
      {pageTitle && <title>{pageTitle}</title>}
      {description && <meta name="description" content={description} />}

      {pageTitle && <meta property="og:title" content={pageTitle} />}
      {description && <meta property="og:description" content={description} />}

      {pageTitle && <meta name="twitter:title" content={pageTitle} />}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
};
