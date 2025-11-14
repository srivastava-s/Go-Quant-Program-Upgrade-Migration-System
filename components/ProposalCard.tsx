import React from 'react';
import { UpgradeProposal, UpgradeStatus } from '../types';
import { ClockIcon, CheckCircleIcon, XCircleIcon, FileTextIcon, UsersIcon, ChevronRightIcon, ShieldOffIcon } from './icons';

interface ProposalCardProps {
  proposal: UpgradeProposal;
  onClick: () => void;
}

const statusStyles: { [key in UpgradeStatus]: { text: string; bg: string; icon: React.ReactNode } } = {
  [UpgradeStatus.Proposed]: { text: 'text-blue-300', bg: 'bg-blue-900/50', icon: <FileTextIcon className="w-4 h-4 mr-2" /> },
  [UpgradeStatus.Approved]: { text: 'text-yellow-300', bg: 'bg-yellow-900/50', icon: <UsersIcon className="w-4 h-4 mr-2" /> },
  [UpgradeStatus.TimelockActive]: { text: 'text-purple-300', bg: 'bg-purple-900/50', icon: <ClockIcon className="w-4 h-4 mr-2" /> },
  [UpgradeStatus.VerificationFailed]: { text: 'text-red-300', bg: 'bg-red-900/50', icon: <ShieldOffIcon className="w-4 h-4 mr-2" /> },
  [UpgradeStatus.Executed]: { text: 'text-green-300', bg: 'bg-green-900/50', icon: <CheckCircleIcon className="w-4 h-4 mr-2" /> },
  [UpgradeStatus.Cancelled]: { text: 'text-red-300', bg: 'bg-red-900/50', icon: <XCircleIcon className="w-4 h-4 mr-2" /> },
};


export const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onClick }) => {
  const { text, bg, icon } = statusStyles[proposal.status];
  const formattedDate = new Date(proposal.proposedAt).toLocaleString();

  return (
    <button 
      onClick={onClick}
      className="w-full text-left p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/80 hover:border-gray-600/70 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${text} ${bg}`}>
              {icon}
              {proposal.status}
            </span>
            <span className="ml-3 text-sm text-gray-400 font-mono">{proposal.id}</span>
          </div>
          <p className="text-md font-medium text-gray-100 truncate">{proposal.description}</p>
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <span>Proposed by <span className="font-mono">{proposal.proposer}</span> on {formattedDate}</span>
            <span className="mx-2">|</span>
            <span>Approvals: <span className="font-semibold text-gray-400">{proposal.approvals.length}/{proposal.approvalThreshold}</span></span>
          </div>
        </div>
        <div className="ml-4">
            <ChevronRightIcon className="w-6 h-6 text-gray-500 group-hover:text-gray-300 transition-colors" />
        </div>
      </div>
    </button>
  );
};