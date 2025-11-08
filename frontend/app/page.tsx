import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Xchange
        </h1>
        <p className="text-2xl text-gray-600 mb-2">منصة Xchange للتجارة الإلكترونية</p>
        <p className="text-xl text-gray-600 mb-8">
          E-commerce Platform for Trading, Bartering, and Auctions
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/login"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
          >
            Register
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2">Barter Trading</h3>
            <p className="text-gray-600">
              Exchange items with smart matching and multi-party trades
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🔨</div>
            <h3 className="text-xl font-bold mb-2">Auctions</h3>
            <p className="text-gray-600">
              Forward and reverse auctions with real-time bidding
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Real-time Chat</h3>
            <p className="text-gray-600">
              Communicate instantly with other traders
            </p>
          </div>
        </div>

        <div className="mt-12 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            ✅ Backend is LIVE at:{' '}
            <a
              href="https://xchange-egypt-production.up.railway.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm underline"
            >
              https://xchange-egypt-production.up.railway.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
