import React from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';

// Next.js Link compatibility component
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
}

export function Link({ href, children, ...props }: LinkProps) {
  return (
    <RouterLink to={href} {...props}>
      {children}
    </RouterLink>
  );
}

export default Link;

// Next.js navigation hooks compatibility
export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    prefetch: () => {},
  };
}

export function usePathname(): string {
  const location = useLocation();
  return location.pathname;
}

export function useSearchParams(): URLSearchParams {
  const location = useLocation();
  return new URLSearchParams(location.search);
}

// Next.js Image compatibility component
export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  unoptimized?: boolean;
}

export function Image({ src, alt, width, height, ...props }: ImageProps) {
  // Omit Next-specific props to prevent standard DOM attribute warnings
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
