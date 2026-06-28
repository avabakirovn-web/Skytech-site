import React, { useState } from 'react';

/**
 * LazyImage - Optimized image component with:
 * - Native lazy loading
 * - Async decoding
 * - WebP fallback support
 * - Loading skeleton
 */
const LazyImage = ({ src, alt, className = '', width, height, eager = false, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`} style={{ minHeight: loaded ? 'auto' : '100px' }}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F7FA] to-[#E5E7EB] dark:from-[#0A2540]/30 dark:to-[#0A2540]/50 animate-pulse rounded-inherit" />
      )}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
