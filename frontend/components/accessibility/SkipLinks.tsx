'use client';

import React from 'react';

interface SkipLink {
  href: string;
  label: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'تخطي إلى المحتوى الرئيسي' },
  { href: '#main-navigation', label: 'تخطي إلى التنقل' },
  { href: '#search-input', label: 'تخطي إلى البحث' },
];

interface SkipLinksProps {
  links?: SkipLink[];
}

export default function SkipLinks({ links = defaultLinks }: SkipLinksProps) {
  return (
    <div className="skip-links">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
