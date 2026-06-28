import React from 'react';

const Logo = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20'
  };

  return (
    <picture>
      <source srcSet="/assets/skytech-logo.webp" type="image/webp" />
      <img
        src="/assets/skytech-logo.png"
        alt="SkyTech - Aqlli Texnologiya"
        className={`${sizes[size]} w-auto object-contain ${className}`}
        loading="eager"
        width="200"
        height="80"
      />
    </picture>
  );
};

export default Logo;
