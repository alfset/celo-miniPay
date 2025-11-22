
import { MerchantProfile, SDKConfig } from '../types';
import { EventBus } from './EventBus';

export class MerchantModule {
  private cache: Map<string, MerchantProfile> = new Map();

  constructor(
    private config: Required<SDKConfig>,
    private eventBus: EventBus
  ) {}

  async getProfile(address: string): Promise<MerchantProfile | null> {
    if (this.cache.has(address)) {
      return this.cache.get(address)!;
    }
    try {
      const profile = await this.fetchFromSelfProtocol(address);
      if (profile) {
        this.cache.set(address, profile);
      }
      return profile;
    } catch (error) {
      console.error('Error fetching merchant profile:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  private async fetchFromSelfProtocol(address: string): Promise<MerchantProfile | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (address.toLowerCase().includes('cafe')) {
      return {
        address,
        name: 'Celo Cafe',
        image: 'ipfs://QmXxxx...',
        farcaster: '@celocafe',
        website: 'https://celocafe.example',
        verified: true
      };
    }
    return {
      address,
      name: 'Unknown Merchant',
      image: '',
      verified: false
    };
  }
}
