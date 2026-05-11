import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Organia Task Manager — Modern Task Management',
  description: 'A full-stack task management application built with Next.js, Spring Boot, and PostgreSQL. Manage your tasks efficiently with a beautiful, responsive interface.',
  keywords: ['task management', 'productivity', 'next.js', 'spring boot', 'organia'],
};

/**
 * Root layout — wraps all pages with Inter font and AuthProvider context.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
