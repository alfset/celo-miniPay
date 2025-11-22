export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_MERCHANT = 'INVALID_MERCHANT'
}

export type PaymentErrorCode =
  | 'INSUFFICIENT_FUNDS'
  | 'USER_REJECTED'
  | 'TX_REVERTED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'INVALID_QR'
  | 'UNKNOWN';

export type Currency = 'cUSD';
export type NetworkType = 'mainnet' | 'alfajores';

export interface MerchantProfile {
  address: string;
  name: string;
  image: string;
  farcaster?: string;
  website?: string;
  verified: boolean;
}

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
  details?: string;
}

export interface PaymentReceipt {
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

export interface PaymentResult {
  status: PaymentStatus;
  transactionHash?: string;
  blockNumber?: number;
  timestamp?: number;
  merchant: {
    address: string;
    profile?: MerchantProfile;
  };
  amount: string;
  currency: Currency;
  fee?: string;
  receipt?: PaymentReceipt;
  error?: PaymentError;
  rawError?: any;
}

export interface PaymentRequest {
  qrData: string;
}

export interface SDKConfig {
  network: NetworkType;
  rpcUrl?: string;
  selfProtocolAddress?: string;
  timeout?: number;
}

export interface QRPaymentData {
  merchantAddress: string;
  amount: string;
  currency: Currency;
  memo?: string;
}

export interface SDKEvent {
  type: 'payment_initiated' | 'payment_pending' | 'payment_confirmed' | 'payment_failed';
  data: any;
  timestamp: number;
}

export type SDKEventCallback = (event: SDKEvent) => void;
