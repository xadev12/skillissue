# SkillIssue Backend - Security Audit & Future Improvements

## Current Deployment Status

**Date:** 2026-02-07
**Environment:** Devnet
**Backend:** Running on http://localhost:3001
**Health Check:** ✅ OK

---

## ⚠️ SECURITY ISSUE: Oracle Private Key in .env

### Current Risk
The oracle wallet private key is stored in:
- `backend/.env` file
- Loaded into environment variables
- Accessible to any process with env access
- **LLM has access to this key** (for development only)

### Risk Level
**MEDIUM** for devnet (test funds only)  
**CRITICAL** for mainnet (real funds at risk)

---

## Recommended Security Architecture

### Option 1: AWS KMS / Google Cloud KMS (Production)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Backend   │────▶│   AWS KMS   │────▶│  Sign Tx    │
│   (no key)  │     │  (HSM key)  │     │  (never     │
└─────────────┘     └─────────────┘     │  leaves KMS)│
                                        └─────────────┘
```
- Key never leaves HSM
- Backend requests signatures via API
- Audit trail for all signing operations

### Option 2: 1Password Secrets Automation (Recommended for MVP)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Backend   │────▶│  1Password  │────▶│  Load Key   │
│             │     │  Connect    │     │  (runtime)  │
└─────────────┘     └─────────────┘     └─────────────┘
```
- Key stored in 1Password vault
- Injected at runtime via 1Password Connect
- Key rotated easily
- No key in .env files

### Option 3: Separate Signing Service
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Backend   │────▶│   Signing   │────▶│  Key Store  │
│             │     │   Service   │     │  (encrypted)│
└─────────────┘     └─────────────┘     └─────────────┘
```
- Dedicated microservice for signing
- Backend never touches keys
- Keys encrypted at rest

---

## Immediate Actions for Mainnet

1. **Remove private key from .env**
2. **Use 1Password Connect** for runtime secret injection
3. **Implement AWS KMS** for signing
4. **Add audit logging** for all signing operations
5. **Use multisig** oracle (requires multiple signatures)

---

## Current 1Password Items

| Item | ID | Purpose |
|------|-----|---------|
| SkillIssue Program Keypair | teu6wzjgdyy25nsxu5tbezvwoi | Deployed program |
| SkillIssue Oracle Keypair | 5taatu6ezj6ys5vvezjpb4wqoi | Oracle operations |
| Privy API | d4op7ek7xbyqoqksqmimaztx2q | Agent wallets |
| Backend ENV | dc3lt64ixxwdwttzxuwh5bqihq | Full dev config |

---

## Devnet Only Disclaimer

This current setup is **ACCEPTABLE FOR DEVNET ONLY** because:
- No real funds at risk
- Easy to rotate keys
- Development velocity prioritized

**DO NOT USE THIS PATTERN FOR MAINNET.**

---

## Backend Status

```
🚀 SkillIssue API running on port 3001
📊 Database: localhost:5432
✅ Health: OK
✅ Solana Program: Deployed (8uifDvy...TFcr)
✅ Oracle: 7cqsgikcLzgmKC7vWM8gwKekApSABb7un7bm3Qo5g6SC
```

**All systems operational for devnet testing.**
