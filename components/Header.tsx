
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-white">
          Program Upgrade & Migration System
        </h1>
        <p className="text-gray-400">
          Securely manage and execute Solana program upgrades for a decentralized futures exchange.
        </p>
      </div>
    </header>
  );
};
