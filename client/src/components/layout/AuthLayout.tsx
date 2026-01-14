import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-100 via-white to-teal-100 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🎮</span>
            <div>
              <h1 className="font-display font-bold text-3xl text-gradient">DuoPlay</h1>
              <p className="text-sm text-gray-500">Play Together, Anytime</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-sm text-gray-500">
        <p>Made with 💕 for families across distances</p>
      </footer>
    </div>
  );
}
