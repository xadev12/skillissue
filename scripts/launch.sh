#!/bin/bash
# SkillIssue Launch Checklist
# Run this to get from demo to real product

set -e

echo "🚀 SkillIssue Launch Prep"
echo "=========================="
echo ""

# 1. Check Solana CLI
echo "1. Checking Solana CLI..."
if ! command -v solana &> /dev/null; then
    echo "   ❌ Solana CLI not found. Install: https://docs.solanalabs.com/cli/install"
    exit 1
fi
solana --version
echo ""

# 2. Check Anchor
echo "2. Checking Anchor..."
if ! command -v anchor &> /dev/null; then
    echo "   ❌ Anchor not found. Install: avm install 0.30.1"
    exit 1
fi
anchor --version
echo ""

# 3. Set devnet
echo "3. Setting Solana to devnet..."
solana config set --url devnet
echo ""

# 4. Check wallet balance
echo "4. Checking deployer wallet..."
ADDRESS=$(solana address)
echo "   Address: $ADDRESS"
BALANCE=$(solana balance)
echo "   Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "   ⚠️  Low balance. Airdropping 2 SOL..."
    solana airdrop 2
fi
echo ""

# 5. Build program
echo "5. Building Solana program..."
cd programs/escrow
anchor build
PROGRAM_ID=$(solana address -k target/deploy/skill_issue_escrow-keypair.json)
echo "   Program ID: $PROGRAM_ID"
cd ../..
echo ""

# 6. Deploy program
echo "6. Deploying to devnet..."
echo "   ⚠️  This costs ~2-3 SOL from your wallet"
read -p "   Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd programs/escrow
    anchor deploy --provider.cluster devnet
    cd ../..
    echo "   ✅ Program deployed"
else
    echo "   ⏭️  Skipped deployment"
fi
echo ""

# 7. Update .env files
echo "7. Environment variables needed:"
echo ""
echo "   # Backend .env"
echo "   DATABASE_URL=postgresql://user:pass@localhost:5432/skillissue"
echo "   SOLANA_RPC_URL=https://api.devnet.solana.com"
echo "   ORACLE_WALLET_PRIVATE_KEY=<base64-encoded-keypair>"
echo "   PLATFORM_WALLET=$ADDRESS"
echo "   PRIVY_APP_ID=<from-privy-dashboard>"
echo "   PRIVY_APP_SECRET=<from-privy-dashboard>"
echo ""
echo "   # Frontend .env.local"
echo "   NEXT_PUBLIC_API_URL=http://localhost:3001"
echo "   NEXT_PUBLIC_PRIVY_APP_ID=<from-privy-dashboard>"
echo ""

# 8. Database migration
echo "8. Database setup..."
echo "   cd backend"
echo "   npx prisma migrate dev --name init"
echo "   npx prisma generate"
echo ""

# 9. Install dependencies
echo "9. Installing dependencies..."
echo "   cd backend && npm install"
echo "   cd app && npm install"
echo ""

# 10. Start services
echo "10. Start services:"
echo ""
echo "    Terminal 1: cd backend && npm run dev"
echo "    Terminal 2: cd app && npm run dev"
echo ""
echo "=========================="
echo "After setup, test with:"
echo "  npm run demo:onboard"
echo ""
