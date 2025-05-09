import { useState } from 'react';
import { steganographyService, SteganographyResponse } from '../services/api';

export const useSteganography = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SteganographyResponse | null>(null);

  const hideToken = async (token: string, imageUri: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await steganographyService.hideToken(token, imageUri);
      setResult(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const revealToken = async (imageUri: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await steganographyService.revealToken(imageUri);
      setResult(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    result,
    hideToken,
    revealToken,
  };
}; 