
import React from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Dashboard />
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Powered by Solana & Anchor</p>
      </footer>
    </div>
  );
};

export default App;
