'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Landing page — hero section with animated feature cards and CTA buttons.
 * Redirects authenticated users to dashboard.
 */
export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: 'Task Management',
      description: 'Create, organize, and track tasks with intuitive status workflows from To Do to Completed.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Secure Authentication',
      description: 'JWT-based authentication with BCrypt password hashing ensures your data stays protected.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Dashboard Analytics',
      description: 'Real-time summary cards give you instant insights into your task progress and productivity.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Fully Responsive',
      description: 'Beautiful on every device — mobile phones, tablets, and desktops with adaptive layouts.',
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen gradient-mesh">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-indigo-200 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                Full Stack Task Manager
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--color-text)] leading-tight tracking-tight">
                Organize Your Work
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  With Clarity & Focus
                </span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
                A modern task management application built with Next.js, Spring Boot, and PostgreSQL.
                Manage your tasks efficiently with a beautiful, intuitive interface.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white rounded-xl gradient-primary hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-[var(--color-text)] bg-white border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors shadow-sm"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)]">
              Everything you need to stay{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">productive</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Built with modern technologies and best practices for a seamless task management experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="relative group bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-[var(--color-text-muted)] mb-8">BUILT WITH</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-[var(--color-text-secondary)]">
            {['Next.js', 'Spring Boot', 'PostgreSQL', 'Tailwind CSS', 'JWT Auth', 'Docker'].map((tech) => (
              <span key={tech} className="text-sm font-semibold px-4 py-2 bg-white rounded-lg border border-[var(--color-border)] shadow-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            © 2024 OrganiaTasks — Organia Innovations Labs Internship Assessment
          </p>
        </div>
      </footer>
    </div>
  );
}
