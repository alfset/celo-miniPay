import {
  PaymentResult,
  PaymentStatus,
  QRPaymentData,
  MerchantProfile,
  SDKConfig
} from '../types';
import { EventBus } from './EventBus';

export class PaymentModule {
  constructor(
    private config: Required<SDKConfig>,
    private eventBus: EventBus
  ) {}

  parseQRCode(qrData: string): QRPaymentData {
    try {
      const url = new URL(qrData.replace('celo:', 'celo://'));
      const merchantAddress = url.hostname;
      const amount = url.searchParams.get('amount') || '0';
      const currency = (url.searchParams.get('currency') || 'cUSD') as 'cUSD';
      const memo = url.searchParams.get('memo') || undefined;

      if (!merchantAddress || !merchantAddress.startsWith('0x')) {
        throw new Error('Invalid merchant address in QR code');
      }

      return { merchantAddress, amount, currency, memo };
    } catch (error) {
      throw new Error('Invalid QR code format');
    }
  }

  generateQRData(merchantAddress: string, amount: string, memo?: string): string {
    let qr = `celo:${merchantAddress}?amount=${amount}&currency=cUSD`;
    if (memo) qr += `&memo=${encodeURIComponent(memo)}`;
    return qr;
  }

  async executePayment(
    paymentData: QRPaymentData,
    merchantProfile: MerchantProfile | null
  ): Promise<PaymentResult> {
    this.eventBus.emit({
      type: 'payment_pending',
      data: { paymentData, merchantProfile },
      timestamp: Date.now()
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockTxHash = '0x' + Math.random().toString(16).substring(2, 66);
    return {
      status: PaymentStatus.SUCCESS,
      transactionHash: mockTxHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 28000000,
      timestamp: Math.floor(Date.now() / 1000),
      merchant: {
        address: paymentData.merchantAddress,
        profile: merchantProfile || undefined
      },
      amount: paymentData.amount,
      currency: 'cUSD',
      fee: '0.0007',
      receipt: {
        title: 'Payment Receipt',
        amount: `${paymentData.amount} cUSD`,
        merchantName: merchantProfile?.name || paymentData.merchantAddress,
        merchantFarcaster: merchantProfile?.farcaster,
        date: new Date().toISOString(),
        txHash: mockTxHash,
        explorerUrl: `https://explorer.celo.org/tx/${mockTxHash}`,
        shareText: `Paid ${paymentData.amount} cUSD to ${merchantProfile?.name || 'merchant'}`
      }
    };
  }

  async estimateFee(amount: string): Promise<string> {
    return '0.0007';
  }
}