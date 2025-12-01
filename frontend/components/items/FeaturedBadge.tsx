'use client';

import React from 'react';

type FeaturedTier = 'gold' | 'silver' | 'bronze' | null;

interface FeaturedBadgeProps {
  tier: FeaturedTier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TIER_STYLES = {
  gold: {
    gradient: 'from-amber-500 via-yellow-400 to-amber-500',
    text: 'text-amber-900',
    label: 'ذهبي',
    icon: '👑',
    glow: 'shadow-amber-500/50',
  },
  silver: {
    gradient: 'from-gray-400 via-gray-300 to-gray-400',
    text: 'text-gray-800',
    label: 'فضي',
    icon: '⭐',
    glow: 'shadow-gray-400/50',
  },
  bronze: {
    gradient: 'from-orange-600 via-amber-700 to-orange-600',
    text: 'text-orange-100',
    label: 'برونزي',
    icon: '🌟',
    glow: 'shadow-orange-500/50',
  },
};

const SIZE_STYLES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export default function FeaturedBadge({ tier, size = 'md', className = '' }: FeaturedBadgeProps) {
  if (!tier) return null;

  const style = TIER_STYLES[tier];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <div
      className={`inline-flex items-center gap-1 bg-gradient-to-r ${style.gradient} ${style.text} ${sizeStyle} rounded-full font-bold shadow-lg ${style.glow} ${className}`}
    >
      <span>{style.icon}</span>
      <span>مميز {style.label}</span>
    </div>
  );
}

// Compact version for cards
export function FeaturedIndicator({ tier }: { tier: FeaturedTier }) {
  if (!tier) return null;

  const style = TIER_STYLES[tier];

  return (
    <div className={`absolute top-2 left-2 w-8 h-8 rounded-full bg-gradient-to-r ${style.gradient} flex items-center justify-center shadow-lg ${style.glow} animate-pulse`}>
      <span className="text-lg">{style.icon}</span>
    </div>
  );
}

// Premium ribbon for item cards
export function PremiumRibbon({ tier }: { tier: FeaturedTier }) {
  if (!tier) return null;

  const style = TIER_STYLES[tier];

  return (
    <div className="absolute -top-1 -right-1 overflow-hidden w-24 h-24">
      <div className={`absolute top-6 -right-8 w-32 text-center py-1 rotate-45 bg-gradient-to-r ${style.gradient} ${style.text} text-xs font-bold shadow-md`}>
        {style.icon} مميز
      </div>
    </div>
  );
}
