import React, { useState } from 'react';
import { useUpgradeSystem } from '../hooks/useUpgradeSystem';
import { UpgradeProposal } from '../types';
import { ProposalCard } from './ProposalCard';
import { ProposalDetailsModal } from './ProposalDetailsModal';
import { CreateProposalModal } from './CreateProposalModal';
import { MigrationTracker } from './MigrationTracker';
import { PlusCircleIcon, UsersIcon, AlertTriangleIcon, PlayCircleIcon, PauseCircleIcon } from './icons';

export const Dashboard: React.FC = () => {
  const { 
    proposals, 
    multisigConfig, 
    migrationState, 
    isSystemPaused,
    createProposal, 
    startMigration, 
    retryFailedMigrations,
    pauseSystem,
    resumeSystem,
    isLoading 
  } = useUpgradeSystem();
  const [selectedProposal, setSelectedProposal] = useState<UpgradeProposal | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const handlePauseToggle = () => {
    if(isSystemPaused) {
      resumeSystem();
    } else {
      if(window.confirm("Are you sure you want to pause all critical system operations? This is an emergency action.")) {
        pauseSystem();
      }
    }
  };

  const systemStatusLoading = isLoading['system_status'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-lg p-6 border ${isSystemPaused ? 'bg-red-900/30 border-red-500/50' : 'bg-gray-800/50 border-gray-700/50'}`}>
            <div className="flex items-center mb-2">
                <AlertTriangleIcon className={`w-6 h-6 mr-3 ${isSystemPaused ? 'text-red-400' : 'text-green-400'}`} />
                <h3 className="text-lg font-semibold text-white">System Status</h3>
            </div>
            <p className={`font-semibold text-xl ${isSystemPaused ? 'text-red-300' : 'text-green-300'}`}>
              {isSystemPaused ? 'Paused (Emergency Stop)' : 'Operational'}
            </p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handlePauseToggle} 
                disabled={systemStatusLoading}
                className={`flex items-center px-4 py-2 text-white text-sm font-semibold rounded-md transition-colors shadow-lg disabled:cursor-not-allowed ${
                  isSystemPaused 
                  ? 'bg-green-600 hover:bg-green-500 shadow-green-600/20 disabled:bg-gray-600' 
                  : 'bg-red-600 hover:bg-red-500 shadow-red-600/20 disabled:bg-gray-600'
                }`}
              >
                {systemStatusLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-100"></div> : (
                  isSystemPaused ? <><PlayCircleIcon className="w-5 h-5 mr-2"/>Resume System</> : <><PauseCircleIcon className="w-5 h-5 mr-2"/>Pause System</>
                )}
              </button>
            </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
            <div className="flex items-center mb-2">
                <UsersIcon className="w-6 h-6 mr-3 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Multisig Governance</h3>
            </div>
            <p className="text-gray-400">
                Approvals Required: <strong className="text-cyan-300">{multisigConfig.threshold} of {multisigConfig.members.length}</strong>
            </p>
            <p className="text-gray-400 text-sm mt-1">
                Authority: <span className="font-mono text-xs text-gray-500">{multisigConfig.upgradeAuthority}</span>
            </p>
        </div>
      </div>

      <MigrationTracker state={migrationState} onStart={startMigration} onRetry={retryFailedMigrations} isLoading={isLoading['retry_migration']} />

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">Upgrade Proposals</h2>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors duration-200 font-semibold text-sm shadow-lg shadow-indigo-600/20"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          New Proposal
        </button>
      </div>

      {proposals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {proposals.map(proposal => (
            <ProposalCard 
              key={proposal.id} 
              proposal={proposal} 
              onClick={() => setSelectedProposal(proposal)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
          <p className="text-gray-400">No upgrade proposals found.</p>
        </div>
      )}

      {selectedProposal && (
        <ProposalDetailsModal
          proposal={selectedProposal}
          isOpen={!!selectedProposal}
          onClose={() => setSelectedProposal(null)}
        />
      )}

      <CreateProposalModal 
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={createProposal}
        isLoading={isLoading['new_proposal'] || false}
      />
    </div>
  );
};