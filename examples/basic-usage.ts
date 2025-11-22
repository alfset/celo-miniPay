
import { PaymentSDK, PaymentStatus } from '../src';

async function main() {
  console.log('='.repeat(60));
  console.log('PAYMENT SDK - BASIC USAGE EXAMPLE');
  console.log('='.repeat(60));
  const sdk = new PaymentSDK({
    network: 'alfajores',
  });

  console.log('\n✓ SDK initialized for Alfajores testnet');
  const unsubscribe = sdk.on((event) => {
    console.log(`\n[EVENT] ${event.type.toUpperCase()}`);
    if (event.data) {
      console.log('  Data:', JSON.stringify(event.data, null, 2).substring(0, 100) + '...');
    }
  });

  console.log('\n' + '─'.repeat(60));
  console.log('EXAMPLE 1: Generate QR Code');
  console.log('─'.repeat(60));
  
  const qrCode = sdk.generateQRData(
    '0x1234cafe567890abcdef',
    '5.00',
    'Coffee purchase'
  );
  console.log('Generated QR:', qrCode);
  console.log('\n' + '─'.repeat(60));
  console.log('EXAMPLE 2: Fetch Merchant Profile');
  console.log('─'.repeat(60));
  
  const profile = await sdk.getMerchantProfile('0x1234cafe567890abcdef');
  if (profile) {
    console.log('Merchant Name:', profile.name);
    console.log('Verified:', profile.verified ? '✓' : '✗');
    console.log('Farcaster:', profile.farcaster || 'N/A');
    console.log('Website:', profile.website || 'N/A');
  }

  console.log('\n' + '─'.repeat(60));
  console.log('EXAMPLE 3: Initiate Payment');
  console.log('─'.repeat(60));
  const paymentQR = 'celo:0x1234cafe567890abcdef?amount=5.00&currency=cUSD&memo=Coffee';
  console.log('Initiating payment from QR:', paymentQR);
  console.log('Processing...');
  const result = await sdk.initiatePayment({ qrData: paymentQR });
  console.log('\n' + '='.repeat(60));
  console.log('PAYMENT RESULT');
  console.log('='.repeat(60));
  console.log('Status:', result.status);
  if (result.status === PaymentStatus.SUCCESS) {
    console.log('\n✓ PAYMENT SUCCESSFUL!\n');
    console.log('Transaction Details:');
    console.log('  Hash:', result.transactionHash);
    console.log('  Block:', result.blockNumber);
    console.log('  Amount:', result.amount, result.currency);
    console.log('  Fee:', result.fee, result.currency);
    console.log('  Merchant:', result.merchant.profile?.name || result.merchant.address);
    
    if (result.receipt) {
      console.log('\nReceipt:');
      console.log('  Title:', result.receipt.title);
      console.log('  Date:', result.receipt.date);
      console.log('  Share Text:', result.receipt.shareText);
      console.log('  Explorer:', result.receipt.explorerUrl);
    }
  } else {
    console.log('\n✗ PAYMENT FAILED\n');
    console.log('Error:', result.error?.message);
    console.log('Code:', result.error?.code);
    if (result.error?.details) {
      console.log('Details:', result.error.details);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log('EXAMPLE 4: Estimate Transaction Fee');
  console.log('─'.repeat(60));
  const estimatedFee = await sdk.estimateFee('10.00');
  console.log('Estimated fee for 10.00 cUSD:', estimatedFee, 'cUSD');
  unsubscribe();
  console.log('\n' + '='.repeat(60));
  console.log('Example completed successfully!');
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
