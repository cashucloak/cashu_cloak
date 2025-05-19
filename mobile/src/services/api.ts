import axios from 'axios';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { API_URL } from '@env';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SteganographyResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const steganographyService = {
  // Hide token in image
  hideToken: async (token: string, imageUri: string): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('file', {
        uri: imageUri,
        type: 'image/png',
        name: 'image.png',
      });

      // Use fetch for binary response
      const response = await fetch(`${API_URL}/steganography/hide`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const blob = await response.blob();
      const path = `${RNFS.DocumentDirectoryPath}/stego_image_${Date.now()}.jpg`;
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result?.toString().split(',')[1];
          if (base64data) {
            RNFS.writeFile(path, base64data, 'base64')
              .then(() => {
                // ts-expect-error: save signature is deprecated but still required for gallery save
                CameraRoll.save(path, { type: 'photo' })
                  .then((savedUri) => resolve(savedUri))
                  .catch(reject);
              })
              .catch(reject);
          } else {
            reject('Failed to read image data');
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error hiding token:', error);
      throw error;
    }
  },

  // Reveal token from image
  revealToken: async (imageUri: string, actualType: string, actualName: string): Promise<SteganographyResponse> => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: actualType,
        name: actualName || 'image.png',
      });

      const response = await api.post('/steganography/reveal', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      const err = error as any;
      console.error('Error revealing token:', JSON.stringify(err.response?.data || err, null, 2));
      throw error;
    }
  },
};

// Get Cashu wallet balance
export const getBalance = async () => {
  const response = await api.get('/balance');
  return response.data;
};

// Create a Lightning invoice to receive sats
export const createLightningInvoice = async (amount: number, mint?: string) => {
  const params: any = { amount };
  if (mint) params.mint = mint;
  const response = await api.post('/lightning/create_invoice', null, { params });
  return response.data;
};

// Send Cashu tokens
export const sendCashu = async (amount: number, recipient: string, mint?: string) => {
  const params: any = { amount };
  if (recipient) params.nostr = recipient;
  if (mint) params.mint = mint;
  const response = await api.post('/send', null, { params });
  return response.data;
};

// Request a mint quote (get Lightning invoice to mint tokens)
export const requestMintQuote = async (amount: number, unit: string = 'sat', description?: string, pubkey?: string) => {
  const body: any = { amount, unit };
  if (description) body.description = description;
  if (pubkey) body.pubkey = pubkey;
  const response = await api.post('/v1/mint/quote/bolt11', body);
  return response.data;
};

// Pay a Lightning invoice (melt)
export const payLightningInvoice = async (invoice: string) => {
  const response = await api.post('/melt/pay_invoice', { invoice });
  return response.data;
};

// Check Lightning invoice status
export const checkInvoiceStatus = async (payment_request: string, mint?: string) => {
  const params: any = { payment_request };
  if (mint) params.mint = mint;
  const response = await api.get('/lightning/invoice_state', { params });
  return response.data;
};

export const redeemCashuToken = async (token: string, mint?: string) => {
  let url = '/receive?token=' + encodeURIComponent(token);
  // If you want to support multiple mints, add mint param if needed
  if (mint) url += '&mint=' + encodeURIComponent(mint);
  const response = await api.post(url);
  return response.data;
};

export const receiveCashuToken = async (token: string) => {
  const response = await api.post(`/receive?token=${encodeURIComponent(token)}`);
  return response.data;
};