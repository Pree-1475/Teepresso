import React from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  unoptimized?: boolean;
}

export function Image({ src, alt, width, height, ...props }: ImageProps) {
  const { priority: _priority, unoptimized: _unoptimized, ...imgProps } = props;
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...imgProps}
    />
  );
}

export default Image;
