import React, { useState, useEffect, useMemo } from 'react';
import { useUpgradeSystem } from '../hooks/useUpgradeSystem';
import { UpgradeProposal, UpgradeStatus } from '../types';
import { ClockIcon, CheckCircleIcon, UsersIcon, XCircleIcon, AlertTriangleIcon, ShieldOffIcon } from './icons';

interface ProposalDetailsModalProps {
  proposal: UpgradeProposal;
  isOpen: boolean;
  onClose: () => void;
}

const CountdownTimer: React.FC<{ targetDate: number }> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = targetDate - Date.now();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex space-x-4 text-center">
        <div><span className="text-3xl font-bold text-purple-300">{String(timeLeft.days).padStart(2,'0')}</span><span className="block text-xs text-gray-400">Days</span></div>
        <div><span className="text-3xl font-bold text-purple-300">{String(timeLeft.hours).padStart(2,'0')}</span><span className="block text-xs text-gray-400">Hours</span></div>
        <div><span className="text-3xl font-bold text-purple-300">{String(timeLeft.minutes).padStart(2,'0')}</span><span className="block text-xs text-gray-400">Minutes</span></div>
        <div><span className="text-3xl font-bold text-purple-300">{String(timeLeft.seconds).padStart(2,'0')}</span><span className="block text-xs text-gray-400">Seconds</span></div>
    </div>
  );
};

export const ProposalDetailsModal: React.FC<ProposalDetailsModalProps> = ({ proposal, isOpen, onClose }) => {
  const { multisigConfig, currentUser, approveProposal, executeUpgrade, cancelUpgrade, isLoading } = useUpgradeSystem();

  const currentProposal = useUpgradeSystem().proposals.find(p => p.id === proposal.id) || proposal;
  
  const hasApproved = useMemo(() => currentProposal.approvals.includes(currentUser), [currentProposal.approvals, currentUser]);
  const canApprove = useMemo(() => currentProposal.status === UpgradeStatus.Proposed && !hasApproved, [currentProposal.status, hasApproved]);
  const canExecute = useMemo(() => currentProposal.status === UpgradeStatus.TimelockActive && Date.now() > currentProposal.timelockUntil, [currentProposal.status, currentProposal.timelockUntil]);
  const canCancel = useMemo(() => [UpgradeStatus.Proposed, UpgradeStatus.Approved, UpgradeStatus.TimelockActive].includes(currentProposal.status), [currentProposal.status]);
  const isVerificationFailed = currentProposal.status === UpgradeStatus.VerificationFailed;

  if (!isOpen) return null;

  const handleAction = async (action: (id: string) => Promise<void>) => {
    await action(currentProposal.id);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700/50 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{currentProposal.description}</h2>
          <p className="text-sm text-gray-400 font-mono mt-1">{currentProposal.id}</p>
        </div>
        <div className="p-6 space-y-6">
            {currentProposal.status === UpgradeStatus.TimelockActive && (
                <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-purple-300 mb-2">Timelock Active</h4>
                    <CountdownTimer targetDate={currentProposal.timelockUntil} />
                </div>
            )}
            {isVerificationFailed && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-left flex items-start">
                    <ShieldOffIcon className="w-8 h-8 mr-4 text-red-400 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-red-300">Verification Failed</h4>
                        <p className="text-sm text-red-200 mt-1">{currentProposal.verificationError}</p>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-900/50 p-3 rounded-md">
                    <span className="text-gray-400 block">Program ID</span>
                    <span className="font-mono text-gray-200 text-xs">{currentProposal.program}</span>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-md">
                    <span className="text-gray-400 block">New Buffer Account</span>
                    <span className="font-mono text-gray-200 text-xs">{currentProposal.newBuffer}</span>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-md col-span-1 md:col-span-2">
                    <span className="text-gray-400 block">Verified Program Hash</span>
                    <span className="font-mono text-gray-200 text-xs break-all">{currentProposal.verifiedHash}</span>
                </div>
                 <div className="bg-gray-900/50 p-3 rounded-md">
                    <span className="text-gray-400 block">Proposer</span>
                    <span className="font-mono text-gray-200 text-xs">{currentProposal.proposer}</span>
                </div>
                 <div className="bg-gray-900/50 p-3 rounded-md">
                    <span className="text-gray-400 block">Proposed At</span>
                    <span className="text-gray-200">{new Date(currentProposal.proposedAt).toLocaleString()}</span>
                </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center"><UsersIcon className="w-5 h-5 mr-2 text-cyan-400" />Approvals ({currentProposal.approvals.length}/{currentProposal.approvalThreshold})</h4>
              <div className="bg-gray-900/50 p-3 rounded-md space-y-2">
                {multisigConfig.members.map(member => {
                  const isApproved = currentProposal.approvals.includes(member);
                  return (
                    <div key={member} className="flex items-center justify-between">
                      <span className="font-mono text-xs text-gray-400">{member}</span>
                      {isApproved ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClockIcon className="w-5 h-5 text-gray-600" />}
                    </div>
                  )
                })}
              </div>
            </div>
        </div>
        <div className="p-6 bg-gray-900/50 rounded-b-xl flex items-center justify-end space-x-3">
          {isLoading[currentProposal.id] && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-100"></div>}
          
          {canApprove && <button onClick={() => handleAction(approveProposal)} disabled={isLoading[currentProposal.id]} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors font-semibold text-sm disabled:bg-gray-600">Approve</button>}
          
          {canExecute && <button onClick={() => handleAction(executeUpgrade)} disabled={isLoading[currentProposal.id]} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors font-semibold text-sm disabled:bg-gray-600">Execute Upgrade</button>}
          
          {(canCancel || isVerificationFailed) && <button onClick={() => handleAction(cancelUpgrade)} disabled={isLoading[currentProposal.id]} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors font-semibold text-sm disabled:bg-gray-600"><AlertTriangleIcon className="w-4 h-4 mr-2"/>Cancel</button>}

          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition-colors font-semibold text-sm">Close</button>
        </div>
      </div>
    </div>
  );
};