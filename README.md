# Payment SDK MVP - Documentation Package
---
## Version: 1.0 MVP
## Date: November 19, 2025
## Milestone: Research, and plan implemenation


---
Table of Contents
---
1. Executive Summary
2. System Architecture
3. Payment Flow Diagrams
4. SDK Module Specifications
5. Smart Contract Architecture (Self Protocol)
6. Data Models & Payment Status Return
7. API Specifications
8. Security Architecture
9. Implementation Roadmap

---
## 1. Executive Summary
---
### 1.1 Project Overview

Payment SDK is a fully decentralized, mobile-first payment system built on Celo that enables instant peer-to-merchant payments using:

• Farcaster – Social layer for merchant discovery and trust
• Self Protocol – On-chain merchant registration and identity verification (no third-party services)

### 1.2 MVP Scope

In Scope:
- Instant payments via QR code or merchant selection
- On-chain merchant registration & verification via Self Protocol
- Display verified merchant name, logo, and Farcaster handle
- Direct cUSD transfers (no escrow, no facilitator)
- Mobile-optimized UI components
- Transaction receipts & sharing

### 1.3 Success Criteria
- End-to-end payment in < 8 seconds
- Gas fee < $0.01 per transaction
- 99.9% success rate on Celo Mainnet
- Zero external dependencies (no oracles, no APIs)
- 100% on-chain merchant identity via Self Protocol

---

---
## 3. Payment Flow Diagrams
---
### 3.1 Standard Payment Flow (Only Flow in MVP)

START
  ↓
User Scans QR Code OR Selects Merchant via Farcaster
  ↓
SDK Parses QR → merchant address + amount
  ↓
Query Self Protocol → Fetch Merchant Profile
  ↓
Not registered → Show "Unverified Merchant" warning (user can proceed)
  ↓
Registered → Show verified name + logo + @farcaster
  ↓
User confirms payment
  ↓
MiniPay signs (biometric/PIN)
  ↓
SDK submits cUSD.transfer()
  ↓
Wait 3–5s → Confirmed
  ↓
Show receipt + share option
  ↓
END

---
## 4. SDK Module Specifications
---
Module              | Responsibility
--------------------|-----------------------------------------------------
PaymentModule       | QR encode/decode, tx building, fee estimation
MerchantModule      | Query & cache Self Protocol profiles
WalletModule        | MiniPay sendTransaction integration
ProfileModule       | Render verified merchant metadata
ReceiptModule       | Generate shareable receipts
EventBus            | Internal state & UI events

Usage Example:
import { PaymentSDK } from '@payment-sdk/core';

const sdk = new PaymentSDK({ network: 'mainnet' });

const result = await sdk.initiatePayment({
  qrData: 'celo:0xMerchant...?amount=5.00&currency=cUSD'
});

---
## 5. Smart Contract Architecture (Self Protocol)
---
Contract             | Purpose                                      | Standard
---------------------|----------------------------------------------|---------------
SelfRegistry.sol     | Core registry of verified identities         | Self Protocol
SelfProfile.sol      | name, image, farcaster, url, etc.            | ERC-5573

Key View Function:
function getProfile(address merchant) external view returns (
  string memory name,
  string memory image,      // IPFS URI
  string memory farcaster,
  string memory url,
  bool verified
)

---
## 6. Data Models & Payment Status Return

### 6.1 MerchantProfile
interface MerchantProfile {
  address: string;
  name: string;
  image: string;         
  farcaster?: string;
  website?: string;
  verified: boolean;
}

---

### 6.2 PaymentResult – Full Return Object
interface PaymentResult {
  status: PaymentStatus;
  transactionHash?: string;
  blockNumber?: number;
  timestamp?: number;
  merchant: { address: string; profile?: MerchantProfile };
  amount: string;
  currency: 'cUSD';
  fee?: string;
  receipt?: PaymentReceipt;
  error?: PaymentError;
  rawError?: any;
}

---

## 6.3 PaymentStatus Enum
Status                | Meaning                          | Can Retry?
----------------------|----------------------------------|-----------
SUCCESS               | Confirmed on-chain               | No
PENDING               | Submitted, waiting confirmation  | No
FAILED                | Reverted or dropped              | Yes
REJECTED              | User denied signing              | Yes
CANCELLED             | User cancelled before signing    | Yes
INSUFFICIENT_FUNDS    | Not enough balance               | No
NETWORK_ERROR         | RPC / connectivity issue         | Yes
INVALID_MERCHANT      | Malformed or blacklisted address | No

---

### 6.4 PaymentError Detail

### **Definition**
```ts
interface PaymentError {
  code:
    | 'INSUFFICIENT_FUNDS'
    | 'USER_REJECTED'
    | 'TX_REVERTED'
    | 'TIMEOUT'
    | 'NETWORK_ERROR'
    | 'INVALID_QR'
    | 'UNKNOWN';
  message: string;
  details?: string;
}

6.5 PaymentReceipt (Shareable)
interface PaymentReceipt {
  title: string;
  amount: string;
  merchantName: string;
  merchantFarcaster?: string;
  date: string;
  txHash: string;
  explorerUrl: string;
  shareText: string;
  qrImage?: string;
}

6.6 Example: SUCCESS
{
  "status": "SUCCESS",
  "transactionHash": "0xabc123...",
  "blockNumber": 28591234,
  "timestamp": 1737277800,
  "merchant": { "address": "0xMerchant...", "profile": { ... } },
  "amount": "5.00",
  "currency": "cUSD",
  "fee": "0.0007",
  "receipt": { ... }
}

6.6 Example: INSUFFICIENT_FUNDS
{
  "status": "INSUFFICIENT_FUNDS",
  "merchant": { "address": "0xMerchant..." },
  "amount": "5.00",
  "currency": "cUSD",
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Balance only 2.10 cUSD",
    "details": "Required: 5.01 cUSD (incl. fee)"
  }
}



