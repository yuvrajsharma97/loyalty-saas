"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";

const Logo = () => (
  <Link href="/" className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-[#014421] rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-sm">L</span>
    </div>
    <span className="font-bold text-xl text-gray-900 dark:text-white">
      LoyaltyOS
    </span>
  </Link>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-[#014421] dark:hover:text-[#D0D8C3] transition-colors">
                {link.name}
              </a>
            ))}
            <Button href="/auth/login" size="md">
              Login
            </Button>
            <Button href="/auth/register" size="md">
              Get started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#014421] dark:hover:text-[#D0D8C3] transition-colors"
                  onClick={() => setIsOpen(false)}>
                  {link.name}
                </a>
              ))}
              <Button
                href="/auth/login"
                variant="ghost"
                onClick={() => setIsOpen(false)}>
                Login
              </Button>
              <Button href="/auth/register" onClick={() => setIsOpen(false)}>
                Get started
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
