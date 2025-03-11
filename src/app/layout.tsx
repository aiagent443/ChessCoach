import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from 'react';

const inter = Inter({ subsets: ["latin"] });

interface LayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "ChessCoach - Your Personal Chess Training Platform",
  description: "Improve your chess game with AI-powered analysis and personalized coaching",
};

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-gray-800 text-white p-4">
            <nav className="container mx-auto flex justify-between">
              <div className="text-lg font-bold">ChessCoach</div>
              <ul className="flex space-x-4">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li><a href="/analysis" className="hover:underline">Analysis</a></li>
                <li><a href="/profile" className="hover:underline">Profile</a></li>
              </ul>
            </nav>
          </header>

          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>

          <footer className="bg-gray-800 text-white p-4">
            <div className="container mx-auto text-center">
              &copy; 2023 ChessCoach. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
} 