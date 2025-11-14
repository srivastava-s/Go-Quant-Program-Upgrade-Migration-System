import React from 'react';
import { MigrationState } from '../types';
import { GitBranchIcon, RefreshCwIcon, AlertTriangleIcon } from './icons';

interface MigrationDashboardProps {
  state: MigrationState;
  onStart: () => void;
  onRetry: () => void;
  isLoading: boolean;
}

const formatTime = (ms: number | null) => {
    if (ms === null) return 'N/A';
    const totalSeconds = Math.floor((ms - Date.now()) / 1000);
    if (totalSeconds <= 0) return 'Finishing...';

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
};

export const MigrationTracker: React.FC<MigrationDashboardProps> = ({ state, onStart, onRetry, isLoading }) => {
  const progress = state.totalAccounts > 0 ? ((state.migratedAccounts + state.failedMigrations.length) / state.totalAccounts) * 100 : 0;
  const isComplete = !state.isMigrating && (state.migratedAccounts + state.failedMigrations.length) >= state.totalAccounts;
  const hasFailures = state.failedMigrations.length > 0;

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 col-span-1 md:col-span-3">
      <div className="md:flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <GitBranchIcon className="w-6 h-6 mr-3 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Account State Migration Dashboard</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div><span className="text-gray-400 block">Progress</span><span className="font-bold text-lg text-gray-200">{progress.toFixed(2)}%</span></div>
            <div><span className="text-gray-400 block">Migrated</span><span className="font-bold text-lg text-green-400">{state.migratedAccounts.toLocaleString()}</span></div>
            <div><span className="text-gray-400 block">Batches</span><span className="font-bold text-lg text-gray-200">{state.currentBatch}/{state.totalBatches}</span></div>
            <div><span className="text-gray-400 block">ETA</span><span className="font-bold text-lg text-gray-200">{formatTime(state.estimatedCompletionTime)}</span></div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
          {isComplete && !hasFailures ? (
            <p className="text-sm text-green-400 font-medium text-right">Migration Complete</p>
          ) : (
            <button 
                onClick={onStart} 
                disabled={state.isMigrating}
                className="w-full md:w-auto px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-600/20"
            >
                {state.isMigrating ? 'Migrating...' : 'Start Migration'}
            </button>
          )}
        </div>
      </div>
      
      {hasFailures && (
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h4 className="font-semibold text-amber-400 flex items-center mb-2">
            <AlertTriangleIcon className="w-5 h-5 mr-2" /> 
            {state.failedMigrations.length} Failed Migrations
          </h4>
          <div className="bg-gray-900/50 p-3 rounded-md max-h-40 overflow-y-auto text-xs space-y-2">
            {state.failedMigrations.map((f, i) => (
              <div key={i} className="flex justify-between items-center font-mono">
                <span className="text-gray-400">{f.accountId}</span>
                <span className="text-red-400">{f.error}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <button 
                onClick={onRetry} 
                disabled={state.isMigrating || isLoading}
                className="flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-md hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-600/20"
            >
              {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-100"></div> : <><RefreshCwIcon className="w-4 h-4 mr-2"/>Retry Failed</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};