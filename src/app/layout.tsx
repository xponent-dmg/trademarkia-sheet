import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'CollabSheet',
  description: 'Collaborative spreadsheet application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-gray-900 bg-gray-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
