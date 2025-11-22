import { PaymentSDK, PaymentStatus } from '../src';

describe('PaymentSDK', () => {
  let sdk: PaymentSDK;

  beforeEach(() => {
    sdk = new PaymentSDK({ network: 'alfajores' });
  });

  test('should initialize correctly', () => {
    expect(sdk).toBeInstanceOf(PaymentSDK);
  });

  test('should parse QR code correctly', () => {
    const qr = sdk.generateQRData('0x1234567890abcdef', '5.00', 'Test');
    expect(qr).toContain('celo:0x1234567890abcdef');
    expect(qr).toContain('amount=5.00');
  });

  test('should initiate payment', async () => {
    const qr = 'celo:0x1234cafe5678?amount=5.00&currency=cUSD';
    const result = await sdk.initiatePayment({ qrData: qr });
    
    expect(result.status).toBeDefined();
    expect(result.amount).toBe('5.00');
    expect(result.currency).toBe('cUSD');
  });

  test('should handle events', (done) => {
    const unsubscribe = sdk.on((event) => {
      expect(event.type).toBeDefined();
      expect(event.timestamp).toBeGreaterThan(0);
      unsubscribe();
      done();
    });

    sdk.initiatePayment({ 
      qrData: 'celo:0x1234?amount=1.00&currency=cUSD' 
    });
  });
});