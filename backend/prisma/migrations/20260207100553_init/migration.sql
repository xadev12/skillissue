-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('HUMAN', 'AGENT');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('SOL', 'USDC');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'LOCKED', 'SUBMITTED', 'COMPLETED', 'DISPUTED', 'REFUNDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('CODE', 'DESIGN', 'CONTENT', 'DATA', 'VERIFICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ProofType" AS ENUM ('MANUAL', 'CODE', 'CONTENT', 'PHYSICAL');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'COMMIT', 'REVEAL', 'RESOLVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "privyUserId" TEXT,
    "username" TEXT,
    "userType" "UserType" NOT NULL DEFAULT 'HUMAN',
    "reputationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "jobsPosted" INTEGER NOT NULL DEFAULT 0,
    "jobsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "disputeWins" INTEGER NOT NULL DEFAULT 0,
    "disputeLosses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "walletAddress" TEXT NOT NULL,
    "privyWalletId" TEXT NOT NULL,
    "capabilities" TEXT[],
    "webhookUrl" TEXT,
    "status" "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "reputationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "jobsPosted" INTEGER NOT NULL DEFAULT 0,
    "jobsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USDC',
    "jobId" TEXT,
    "transactionHash" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "posterId" TEXT,
    "workerId" TEXT,
    "posterAgentId" TEXT,
    "workerAgentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "category" "JobCategory" NOT NULL DEFAULT 'OTHER',
    "proofType" "ProofType" NOT NULL DEFAULT 'MANUAL',
    "locationLat" DOUBLE PRECISION,
    "locationLng" DOUBLE PRECISION,
    "locationRadius" INTEGER,
    "squadsVaultAddress" TEXT,
    "deliverableUrl" TEXT,
    "deliverableHash" TEXT,
    "proofData" JSONB,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "initiatedBy" TEXT NOT NULL,
    "commitDeadline" TIMESTAMP(3),
    "revealDeadline" TIMESTAMP(3),
    "winnerAddress" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JurorVote" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "jurorId" TEXT NOT NULL,
    "commitHash" TEXT,
    "vote" TEXT,
    "stakeAmount" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "isWinner" BOOLEAN,
    "reward" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revealedAt" TIMESTAMP(3),

    CONSTRAINT "JurorVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_privyUserId_key" ON "User"("privyUserId");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_reputationScore_idx" ON "User"("reputationScore");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_name_key" ON "Agent"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_walletAddress_key" ON "Agent"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_privyWalletId_key" ON "Agent"("privyWalletId");

-- CreateIndex
CREATE INDEX "Agent_walletAddress_idx" ON "Agent"("walletAddress");

-- CreateIndex
CREATE INDEX "Agent_status_idx" ON "Agent"("status");

-- CreateIndex
CREATE INDEX "Agent_reputationScore_idx" ON "Agent"("reputationScore");

-- CreateIndex
CREATE INDEX "Transaction_agentId_idx" ON "Transaction"("agentId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_transactionHash_idx" ON "Transaction"("transactionHash");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_posterId_idx" ON "Job"("posterId");

-- CreateIndex
CREATE INDEX "Job_workerId_idx" ON "Job"("workerId");

-- CreateIndex
CREATE INDEX "Job_posterAgentId_idx" ON "Job"("posterAgentId");

-- CreateIndex
CREATE INDEX "Job_workerAgentId_idx" ON "Job"("workerAgentId");

-- CreateIndex
CREATE INDEX "Job_category_idx" ON "Job"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_jobId_key" ON "Dispute"("jobId");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JurorVote_disputeId_jurorId_key" ON "JurorVote"("disputeId", "jurorId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_posterAgentId_fkey" FOREIGN KEY ("posterAgentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_workerAgentId_fkey" FOREIGN KEY ("workerAgentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurorVote" ADD CONSTRAINT "JurorVote_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurorVote" ADD CONSTRAINT "JurorVote_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurorVote" ADD CONSTRAINT "JurorVote_jurorId_fkey" FOREIGN KEY ("jurorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
