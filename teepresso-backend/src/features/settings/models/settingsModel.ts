import { registerDatabase } from '../../../config/jsonDb.js';

export interface SettingItem {
  key: string;
  value: any;
}

export const settingsDatabase: SettingItem[] = [
  { key: 'storefrontMode', value: 'FESTIVE' },
  { key: 'upiVpa', value: 'teepresso@upi' },
  { key: 'payeeName', value: 'Teepresso Enterprise' }
];

registerDatabase('settings', settingsDatabase);
