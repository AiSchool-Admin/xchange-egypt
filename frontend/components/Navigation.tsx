'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show navigation on login/register pages
  const hideNavRoutes = ['/login', '/register'];
  if (hideNavRoutes.includes(pathname)) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { href: '/items', label: 'Marketplace', icon: '🛒' },
    { href: '/auctions', label: 'Auctions', icon: '🔨' },
    { href: '/barter', label: 'Barter', icon: '🔄' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🔄</span>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Xchange
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isActive(link.href)
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    pathname === '/dashboard'
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/transactions"
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    pathname === '/transactions'
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  My Orders
                </Link>
                <Link
                  href="/auctions/my-bids"
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    pathname === '/auctions/my-bids'
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  My Bids
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.fullName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-medium transition ${
                    isActive(link.href)
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg font-medium transition ${
                      pathname === '/dashboard'
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/transactions"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg font-medium transition ${
                      pathname === '/transactions'
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/auctions/my-bids"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg font-medium transition ${
                      pathname === '/auctions/my-bids'
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    My Bids
                  </Link>
                  <div className="px-4 py-2 text-sm text-gray-600">
                    Signed in as <span className="font-medium">{user.fullName}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
