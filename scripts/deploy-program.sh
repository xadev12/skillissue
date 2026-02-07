#!/bin/bash
# Deploy SkillIssue Program to Solana Devnet
# Run this after getting SOL from faucet.solana.com

set -e

echo "🚀 SkillIssue Program Deployment"
echo "================================="
echo ""

# Check for SOL balance
echo "Checking SOL balance..."
export PATH="/Users/devl/.local/share/solana/install/releases/stable-90098d261e2be2f898769d9ee35141597f1a2234/solana-release/bin:$PATH"

BALANCE=$(solana balance 2>/dev/null | awk '{print $1}')
echo "Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 3" | bc -l) )); then
    echo ""
    echo "❌ Insufficient SOL balance ($BALANCE SOL)"
    echo ""
    echo "Get SOL from one of these faucets:"
    echo "  1. https://faucet.solana.com/"
    echo "  2. https://solfaucet.com/"
    echo "  3. Discord: https://discord.gg/solana"
    echo ""
    echo "Then run: solana airdrop 3"
    echo ""
    exit 1
fi

echo ""
echo "✅ Balance sufficient ($BALANCE SOL)"
echo ""

# Navigate to program directory
cd /Users/devl/clawd/hackathon/skillissue/programs/escrow

# Deploy the program
echo "Deploying program..."
solana program deploy \
    target/sbpf-solana-solana/release/skill_issue_escrow.so \
    --keypair target/deploy/skill_issue_escrow-keypair.json \
    --program-id target/deploy/skill_issue_escrow-keypair.json

echo ""
echo "✅ Program deployed successfully!"
echo ""
echo "Program ID: $(solana-keygen pubkey target/deploy/skill_issue_escrow-keypair.json)"
echo ""
echo "Next steps:"
echo "  1. Update Anchor.toml with deployed program ID"
echo "  2. Update backend .env with program ID"
echo "  3. Restart backend"
echo "  4. Test with: npm run demo:onboard"
echo ""
