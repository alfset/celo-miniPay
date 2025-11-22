import {
  PaymentResult,
  PaymentRequest,
  SDKConfig,
  PaymentStatus,
  QRPaymentData,
  MerchantProfile,
  SDKEvent,
  SDKEventCallback
} from '../types';
import { PaymentModule } from '../modules/PaymentModule';
import { MerchantModule } from '../modules/MerchantModule';
import { EventBus } from '../modules/EventBus';

/**
 * Payment SDK Core
 * Main entry point for the Payment SDK
 */
export class PaymentSDK {
  private config: Required<SDKConfig>;
  private paymentModule: PaymentModule;
  private merchantModule: MerchantModule;
  private eventBus: EventBus;

  constructor(config: SDKConfig) {
    this.config = {
      network: config.network,
      rpcUrl: config.rpcUrl || this.getDefaultRpcUrl(config.network),
      selfProtocolAddress: config.selfProtocolAddress || this.getDefaultSelfProtocolAddress(config.network),
      timeout: config.timeout || 30000
    };

    this.eventBus = new EventBus();
    this.paymentModule = new PaymentModule(this.config, this.eventBus);
    this.merchantModule = new MerchantModule(this.config, this.eventBus);
  }

  /**
   * Initiate a payment from QR code data
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      this.emitEvent('payment_initiated', { qrData: request.qrData });

      // Step 1: Parse QR code
      const paymentData = this.paymentModule.parseQRCode(request.qrData);

      // Step 2: Fetch merchant profile from Self Protocol
      const merchantProfile = await this.merchantModule.getProfile(paymentData.merchantAddress);

      // Step 3: Execute payment
      const result = await this.paymentModule.executePayment(paymentData, merchantProfile);

      // Step 4: Emit event based on result
      if (result.status === PaymentStatus.SUCCESS) {
        this.emitEvent('payment_confirmed', result);
      } else {
        this.emitEvent('payment_failed', result);
      }

      return result;
    } catch (error) {
      const failureResult: PaymentResult = {
        status: PaymentStatus.FAILED,
        merchant: { address: '' },
        amount: '0',
        currency: 'cUSD',
        error: {
          code: 'UNKNOWN',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
        rawError: error
      };

      this.emitEvent('payment_failed', failureResult);
      return failureResult;
    }
  }

  /**
   * Get merchant profile directly
   */
  async getMerchantProfile(address: string): Promise<MerchantProfile | null> {
    return this.merchantModule.getProfile(address);
  }

  /**
   * Subscribe to SDK events
   */
  on(callback: SDKEventCallback): () => void {
    return this.eventBus.subscribe(callback);
  }

  /**
   * Generate QR code data for a merchant
   */
  generateQRData(merchantAddress: string, amount: string, memo?: string): string {
    return this.paymentModule.generateQRData(merchantAddress, amount, memo);
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(amount: string): Promise<string> {
    return this.paymentModule.estimateFee(amount);
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<SDKConfig>> {
    return { ...this.config };
  }

  private getDefaultRpcUrl(network: 'mainnet' | 'alfajores'): string {
    return network === 'mainnet'
      ? 'https://forno.celo.org'
      : 'https://alfajores-forno.celo-testnet.org';
  }

  private getDefaultSelfProtocolAddress(network: 'mainnet' | 'alfajores'): string {
    // These would be the actual deployed Self Protocol addresses
    return network === 'mainnet'
      ? '0x0000000000000000000000000000000000000000' // Replace with actual
      : '0x0000000000000000000000000000000000000000'; // Replace with actual
  }

  private emitEvent(type: SDKEvent['type'], data: any): void {
    this.eventBus.emit({
      type,
      data,
      timestamp: Date.now()
    });
  }
}

// Export singleton factory
let sdkInstance: PaymentSDK | null = null;

export function createPaymentSDK(config: SDKConfig): PaymentSDK {
  sdkInstance = new PaymentSDK(config);
  return sdkInstance;
}

export function getPaymentSDK(): PaymentSDK | null {
  return sdkInstance;
}
