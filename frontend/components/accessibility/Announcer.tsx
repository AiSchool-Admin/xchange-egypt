'use client';

import React, { useEffect, useState } from 'react';

interface AnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

/**
 * Announcer - Screen reader announcement component
 * مكون إعلان قارئ الشاشة
 */
export default function Announcer({ message, priority = 'polite' }: AnnouncerProps) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Clear and reset to trigger screen reader
    setAnnouncement('');
    const timer = setTimeout(() => {
      setAnnouncement(message);
    }, 100);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
