/**
 * @deprecated Use escrow.ts for new code
 * This file re-exports from escrow.ts for backward compatibility
 */

export {
  createJobEscrow,
  releaseEscrow,
  initiateDispute,
  depositToEscrow,
} from './escrow';

// Legacy type exports for compatibility
export type { CreateEscrowParams, ReleaseEscrowParams } from './escrow';
