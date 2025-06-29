import { useState, useCallback } from 'react';
import { analyzeFood } from '@/utils/mockData';

interface AnalysisResult {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  confidence?: number;
  portions?: string;
  regional?: boolean;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (
    imageUri: string, 
    comment: string = '', 
    userLanguage: string = 'ru'
  ) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setAnalysisResult(null);

      console.log('🔍 Начинаем анализ изображения...');
      
      // Передаем комментарий и язык пользователя в analyzeFood
      const result = await analyzeFood(imageUri, comment, userLanguage);
      
      setAnalysisResult(result);
      console.log('✅ Анализ завершен успешно');
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка анализа изображения';
      console.error('❌ Ошибка анализа:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    analysisResult,
    error,
    analyzeImage,
    reset,
  };
}; 