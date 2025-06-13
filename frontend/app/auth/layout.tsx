import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - VirtualBoss Trainer',
  description: 'Sign in to your VirtualBoss Trainer account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full max-w-md p-6">
        {children}
      </div>
    </div>
  );
}
