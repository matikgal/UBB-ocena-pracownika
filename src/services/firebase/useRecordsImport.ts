import { useState } from 'react';
import { importAllRecords } from './recordsService';
import { toast } from 'sonner';

export function useRecordsImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ added: number, skipped: number } | null>(null);

  const importRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const importResult = await importAllRecords();
      setResult(importResult);
      
      toast.success(`Import zakończony: dodano ${importResult.added} rekordów, pominięto ${importResult.skipped} rekordów`);
      
      return importResult;
    } catch (err) {
      console.error('Error importing records:', err);
      const errorMessage = 'Nie udało się zaimportować rekordów';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    importRecords,
    loading,
    error,
    result
  };
}