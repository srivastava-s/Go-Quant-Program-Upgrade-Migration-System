export enum UpgradeStatus {
    Proposed = 'Proposed',
    Approved = 'Approved',
    TimelockActive = 'TimelockActive',
    VerificationFailed = 'VerificationFailed',
    Executed = 'Executed',
    Cancelled = 'Cancelled',
}

export interface UpgradeProposal {
    id: string;
    proposer: string;
    program: string;
    newBuffer: string;
    description: string;
    proposedAt: number;
    timelockUntil: number;
    approvals: string[];
    approvalThreshold: number;
    status: UpgradeStatus;
    executedAt: number | null;
    verifiedHash: string;
    verificationError?: string;
}

export interface MultisigConfig {
    members: string[];
    threshold: number;
    upgradeAuthority: string;
}

export interface FailedMigration {
    accountId: string;
    error: string;
}

export interface MigrationState {
    totalAccounts: number;
    migratedAccounts: number;
    isMigrating: boolean;
    failedMigrations: FailedMigration[];
    currentBatch: number;
    totalBatches: number;
    estimatedCompletionTime: number | null;
}