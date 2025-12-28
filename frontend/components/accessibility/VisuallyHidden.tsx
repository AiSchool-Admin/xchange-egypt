'use client';

import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * VisuallyHidden - Hides content visually but keeps it accessible to screen readers
 * يخفي المحتوى بصرياً مع إبقائه متاحاً لقارئات الشاشة
 */
export default function VisuallyHidden({
  children,
  as: Component = 'span',
}: VisuallyHiddenProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}
