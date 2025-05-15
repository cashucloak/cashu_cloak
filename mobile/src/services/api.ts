import axios from 'axios';

const API_URL = 'http://10.0.2.2:4448'; // Android emulator localhost address for wallet API

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
  hideToken: async (token: string, imageUri: string): Promise<SteganographyResponse> => {
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      const response = await api.post('/steganography/hide', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error hiding token:', error);
      throw error;
    }
  },

  // Reveal token from image
  revealToken: async (imageUri: string): Promise<SteganographyResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      const response = await api.post('/steganography/reveal', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error revealing token:', error);
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
  // First get a melt quote
  const quoteRes = await api.post('/v1/melt/quote/bolt11', { request: invoice, unit: 'sat' });
  const quote = quoteRes.data.quote;
  
  // Then actually pay
  const response = await api.post('/v1/melt/bolt11', { 
    quote: quote,
    inputs: [], // The wallet will handle this
    outputs: [] // The wallet will handle this
  });
  return response.data;
}; 

// Check Lightning invoice status
export const checkInvoiceStatus = async (payment_request: string, mint?: string) => {
  const params: any = { payment_request };
  if (mint) params.mint = mint;
  const response = await api.get('/lightning/invoice_state', { params });
  return response.data;
};