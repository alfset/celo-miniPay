import { PaymentSDK, PaymentStatus } from '../src';

async function demonstrateErrorHandling() {
  const sdk = new PaymentSDK({ network: 'alfajores' });

  console.log('Testing error scenarios...\n');
  console.log('1. Invalid QR Code:');
  const result1 = await sdk.initiatePayment({ qrData: 'invalid-qr-format' });
  console.log('  Status:', result1.status);
  console.log('  Error:', result1.error?.message);
  console.log('');
  console.log('2. Malformed Address:');
  const result2 = await sdk.initiatePayment({ 
    qrData: 'celo:invalid-address?amount=5.00&currency=cUSD' 
  });
  console.log('  Status:', result2.status);
  console.log('  Error:', result2.error?.message);
  console.log('');
  console.log('3. Unverified Merchant:');
  const profile = await sdk.getMerchantProfile('0xUnverifiedMerchant123');
  console.log('  Verified:', profile?.verified);
  console.log('  Name:', profile?.name);
  console.log('');
}

demonstrateErrorHandling().catch(console.error);