import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Hotel Booking DDD',
  description: 'Domain-Driven Design experiment - Unmanned hotel booking system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  Hotel Booking DDD
                </Link>
                <div className="flex gap-6 text-sm font-medium">
                  <Link href="/bookings" className="text-blue-600 hover:text-blue-800 transition-colors">
                    📅 Bokningar
                  </Link>
                  <Link href="/access" className="text-green-600 hover:text-green-800 transition-colors">
                    🔑 Access
                  </Link>
                  <Link href="/housekeeping" className="text-purple-600 hover:text-purple-800 transition-colors">
                    🧹 Städning
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
