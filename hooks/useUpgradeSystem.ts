
import { useState, useEffect, useCallback } from 'react';
import { UpgradeProposal, UpgradeStatus, MultisigConfig, MigrationState, FailedMigration } from '../types';

const MOCK_MULTISIG_CONFIG: MultisigConfig = {
  members: [
    '5s4f...hJGt', 'G1hT...K8sP', 'Bv2z...mN9q', 'Dk7R...pW3f', '9cWq...aX2y'
  ],
  threshold: 3,
  upgradeAuthority: 'AUth...tYp7',
};

const MOCK_PROPOSALS: UpgradeProposal[] = [
  {
    id: 'prop_169011',
    proposer: '5s4f...hJGt',
    program: 'perp...FU7E',
    newBuffer: 'buff...dG8K',
    description: 'v1.1.0: Add support for Pyth v3 price feeds and optimize liquidation engine.',
    proposedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    timelockUntil: 0,
    approvals: ['5s4f...hJGt', 'G1hT...K8sP', 'Bv2z...mN9q'],
    approvalThreshold: 3,
    status: UpgradeStatus.Executed,
    executedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    verifiedHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
  },
  {
    id: 'prop_169023',
    proposer: 'G1hT...K8sP',
    program: 'perp...FU7E',
    newBuffer: 'buff...xR9B',
    description: 'v1.1.1: Security patch for oracle price deviation checks.',
    proposedAt: Date.now() - 50 * 60 * 60 * 1000,
    timelockUntil: Date.now() + 2 * 60 * 60 * 1000, // Timelock starts when approved
    approvals: ['G1hT...K8sP', 'Bv2z...mN9q'],
    approvalThreshold: 3,
    status: UpgradeStatus.Approved,
    executedAt: null,
    verifiedHash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
  },
  {
    id: 'prop_169025',
    proposer: 'Dk7R...pW3f',
    program: 'perp...FU7E',
    newBuffer: 'buff...yS1C',
    description: 'v1.2.0: Introduce cross-collateral feature and new markets.',
    proposedAt: Date.now() - 4 * 60 * 60 * 1000,
    timelockUntil: 0,
    approvals: ['Dk7R...pW3f'],
    approvalThreshold: 3,
    status: UpgradeStatus.Proposed,
    executedAt: null,
    verifiedHash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
  },
    {
    id: 'prop_169004',
    proposer: '9cWq...aX2y',
    program: 'perp...FU7E',
    newBuffer: 'buff...zT5D',
    description: 'v1.0.5: Minor gas optimizations (Cancelled).',
    proposedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    timelockUntil: 0,
    approvals: ['9cWq...aX2y'],
    approvalThreshold: 3,
    status: UpgradeStatus.Cancelled,
    executedAt: null,
    verifiedHash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
  },
];

const BATCH_SIZE = 500;
const TOTAL_ACCOUNTS = 12560;

const MOCK_MIGRATION_STATE: MigrationState = {
  totalAccounts: TOTAL_ACCOUNTS,
  migratedAccounts: 0,
  isMigrating: false,
  failedMigrations: [],
  currentBatch: 0,
  totalBatches: Math.ceil(TOTAL_ACCOUNTS / BATCH_SIZE),
  estimatedCompletionTime: null,
}

const CURRENT_USER = '5s4f...hJGt'; // Mock current user is a multisig member

export const useUpgradeSystem = () => {
  const [proposals, setProposals] = useState<UpgradeProposal[]>(MOCK_PROPOSALS);
  const [multisigConfig] = useState<MultisigConfig>(MOCK_MULTISIG_CONFIG);
  const [migrationState, setMigrationState] = useState<MigrationState>(MOCK_MIGRATION_STATE);
  const [isSystemPaused, setSystemPaused] = useState<boolean>(false);
  const [currentUser] = useState<string>(CURRENT_USER);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const setActionLoading = (action: string, state: boolean) => {
    setIsLoading(prev => ({ ...prev, [action]: state }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProposals(prevProposals =>
        prevProposals.map(p => {
          if (p.status === UpgradeStatus.Approved && p.timelockUntil === 0) {
            return { ...p, timelockUntil: Date.now() + 48 * 60 * 60 * 1000, status: UpgradeStatus.TimelockActive };
          }
          return p;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const createProposal = useCallback((newBuffer: string, description: string) => {
    return new Promise<void>(resolve => {
        setActionLoading('new_proposal', true);
        setTimeout(() => {
            const newProposal: UpgradeProposal = {
                id: `prop_${Math.floor(Math.random() * 100000)}`,
                proposer: currentUser,
                program: 'perp...FU7E',
                newBuffer,
                description,
                proposedAt: Date.now(),
                timelockUntil: 0,
                approvals: [currentUser],
                approvalThreshold: multisigConfig.threshold,
                status: UpgradeStatus.Proposed,
                executedAt: null,
                // FIX: Replaced Node.js's `Buffer` with a browser-compatible method for generating a random hex string.
                verifiedHash: [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
            };
            setProposals(prev => [newProposal, ...prev]);
            setActionLoading('new_proposal', false);
            resolve();
        }, 1500);
    });
  }, [currentUser, multisigConfig.threshold]);

  const approveProposal = useCallback((proposalId: string) => {
    return new Promise<void>(resolve => {
        setActionLoading(proposalId, true);
        setTimeout(() => {
            setProposals(prev =>
                prev.map(p => {
                    if (p.id === proposalId && !p.approvals.includes(currentUser)) {
                        const newApprovals = [...p.approvals, currentUser];
                        let newStatus = p.status;
                        let newTimelock = p.timelockUntil;
                        if (newApprovals.length >= p.approvalThreshold) {
                            newStatus = UpgradeStatus.TimelockActive;
                            newTimelock = Date.now() + 48 * 60 * 60 * 1000;
                        }
                        return { ...p, approvals: newApprovals, status: newStatus, timelockUntil: newTimelock };
                    }
                    return p;
                })
            );
            setActionLoading(proposalId, false);
            resolve();
        }, 1000);
    });
  }, [currentUser]);

  const executeUpgrade = useCallback((proposalId: string) => {
    return new Promise<void>(resolve => {
        setActionLoading(proposalId, true);
        // Step 1: Verification (simulated)
        setTimeout(() => {
          const isVerified = Math.random() > 0.1; // 10% chance of failure
          if (isVerified) {
            // Step 2: Execution
            setTimeout(() => {
              setProposals(prev =>
                  prev.map(p =>
                      p.id === proposalId
                          ? { ...p, status: UpgradeStatus.Executed, executedAt: Date.now(), verificationError: undefined }
                          : p
                  )
              );
              setActionLoading(proposalId, false);
              resolve();
            }, 1500);
          } else {
            // Verification failed
            setProposals(prev =>
              prev.map(p =>
                p.id === proposalId
                  ? { ...p, status: UpgradeStatus.VerificationFailed, verificationError: "CRITICAL: On-chain program hash does not match verified hash." }
                  : p
              )
            );
            setActionLoading(proposalId, false);
            resolve();
          }
        }, 2000);
    });
  }, []);

  const cancelUpgrade = useCallback((proposalId: string) => {
    return new Promise<void>(resolve => {
        setActionLoading(proposalId, true);
        setTimeout(() => {
            setProposals(prev =>
                prev.map(p =>
                    p.id === proposalId
                        ? { ...p, status: UpgradeStatus.Cancelled }
                        : p
                )
            );
            setActionLoading(proposalId, false);
            resolve();
        }, 1000);
    });
  }, []);

  const startMigration = useCallback(() => {
    setMigrationState(prev => ({...prev, isMigrating: true, migratedAccounts: 0, currentBatch: 0, failedMigrations: [], estimatedCompletionTime: Date.now() + (prev.totalBatches * 500)}));
    let batch = 1;
    const interval = setInterval(() => {
        setMigrationState(prev => {
            const migratedInBatch = Math.min(BATCH_SIZE, prev.totalAccounts - prev.migratedAccounts);
            const failuresInBatch = Math.floor(Math.random() * (migratedInBatch * 0.02)); // 2% failure rate
            const successfulInBatch = migratedInBatch - failuresInBatch;
            
            const newFailed: FailedMigration[] = [...prev.failedMigrations];
            for (let i = 0; i < failuresInBatch; i++) {
                newFailed.push({ accountId: `acc_${Math.random().toString(36).substr(2, 9)}`, error: 'State-root mismatch' });
            }

            const newMigrated = prev.migratedAccounts + successfulInBatch;

            if (batch >= prev.totalBatches) {
                clearInterval(interval);
                return { ...prev, migratedAccounts: newMigrated, isMigrating: false, currentBatch: batch, failedMigrations: newFailed, estimatedCompletionTime: null };
            }
            batch++;
            return { ...prev, migratedAccounts: newMigrated, currentBatch: batch, failedMigrations: newFailed };
        });
    }, 500);
  }, []);

  const retryFailedMigrations = useCallback(() => {
    setActionLoading('retry_migration', true);
    const failuresToRetry = [...migrationState.failedMigrations];
    setMigrationState(prev => ({ ...prev, failedMigrations: [] }));

    setTimeout(() => {
      let successfullyRetried = 0;
      const stillFailing: FailedMigration[] = [];
      
      failuresToRetry.forEach(failure => {
        if(Math.random() > 0.3) { // 70% success rate on retry
          successfullyRetried++;
        } else {
          stillFailing.push({...failure, error: "State-root mismatch (retry failed)"});
        }
      });

      setMigrationState(prev => ({...prev, migratedAccounts: prev.migratedAccounts + successfullyRetried, failedMigrations: stillFailing}));
      setActionLoading('retry_migration', false);
    }, 2000);

  }, [migrationState.failedMigrations]);

  const pauseSystem = useCallback(() => {
    setActionLoading('system_status', true);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setSystemPaused(true);
        setActionLoading('system_status', false);
        resolve();
      }, 1000);
    });
  }, []);

  const resumeSystem = useCallback(() => {
    setActionLoading('system_status', true);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setSystemPaused(false);
        setActionLoading('system_status', false);
        resolve();
      }, 1000);
    });
  }, []);


  return {
    proposals,
    multisigConfig,
    migrationState,
    isSystemPaused,
    currentUser,
    isLoading,
    createProposal,
    approveProposal,
    executeUpgrade,
    cancelUpgrade,
    startMigration,
    retryFailedMigrations,
    pauseSystem,
    resumeSystem,
  };
};
