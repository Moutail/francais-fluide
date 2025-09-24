// src/components/editor/SmartEditorOptimized.tsx
import React, { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Lightbulb, TrendingUp, Sparkles } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { useLanguageTool } from '@/hooks/useLanguageTool';
import { useDebounce } from '@/hooks/useDebounce';
import { LanguageToolStatus } from './LanguageToolStatus';
import { cn } from '@/lib/utils/cn';
import type { GrammarError, Suggestion, CorrectionResult } from '@/types/grammar';

interface SmartEditorProps {
  initialValue?: string;
  placeholder?: string;
  onProgressUpdate?: (metrics: ProgressMetrics) => void;
  mode?: 'practice' | 'exam' | 'creative';
  realTimeCorrection?: boolean;
  className?: string;
}

interface ProgressMetrics {
  wordsWritten: number;
  errorsDetected: number;
  errorsCorrected: number;
  accuracyRate: number;
  streakCount: number;
}

interface HighlightedError {
  id: string;
  start: number;
  end: number;
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
  severity: 'critical' | 'warning' | 'suggestion';
  message: string;
  suggestions: string[];
}

// Mémorisation des composants enfants pour éviter les re-renders
const PerformanceIndicator = memo<{
  isAnalyzing: boolean;
  perfectStreak: number;
  accuracyRate: number;
}>(({ isAnalyzing, perfectStreak, accuracyRate }) => (
  <motion.div 
    className="absolute top-2 right-2 flex items-center gap-2"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {isAnalyzing ? (
      <div className="flex items-center gap-2 text-gray-500">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>
        <span className="text-xs">Analyse...</span>
      </div>
    ) : (
      <div className="flex items-center gap-3">
        {perfectStreak > 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full"
          >
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="text-xs font-semibold text-green-700">
              {perfectStreak} parfait{perfectStreak > 1 ? 's' : ''}!
            </span>
          </motion.div>
        )}
        
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full",
          accuracyRate >= 90 ? "bg-green-100" :
          accuracyRate >= 70 ? "bg-yellow-100" : "bg-red-100"
        )}>
          <span className="text-xs font-semibold">
            {accuracyRate}% précision
          </span>
        </div>
      </div>
    )}
  </motion.div>
));

PerformanceIndicator.displayName = 'PerformanceIndicator';

const SuggestionsPanel = memo<{
  showSuggestions: boolean;
  selectedError: HighlightedError | null;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  onApplySuggestion: (suggestion: string) => void;
  onClose: () => void;
}>(({ showSuggestions, selectedError, editorRef, onApplySuggestion, onClose }) => (
  <AnimatePresence>
    {showSuggestions && selectedError && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm"
        style={{
          top: `${editorRef.current?.offsetHeight || 0}px`,
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <div className="flex items-start gap-2 mb-3">
          <AlertCircle className={cn(
            "w-5 h-5 mt-0.5",
            selectedError.severity === 'critical' ? "text-red-500" :
            selectedError.severity === 'warning' ? "text-yellow-500" : "text-blue-500"
          )} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {selectedError.message}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Suggestions :
          </p>
          {selectedError.suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onApplySuggestion(suggestion)}
              className="w-full text-left px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-md transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">
                  {suggestion}
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </motion.button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Ignorer
        </button>
      </motion.div>
    )}
  </AnimatePresence>
));

SuggestionsPanel.displayName = 'SuggestionsPanel';

// Couleurs mémorisées pour éviter les recalculs
const ERROR_COLORS = {
  critical: 'bg-red-200 border-red-500',
  warning: 'bg-yellow-200 border-yellow-500',
  suggestion: 'bg-blue-200 border-blue-500'
};

// Fonctions utilitaires pour mapper les types d'erreurs LanguageTool
const getErrorType = (categoryId: string): 'spelling' | 'grammar' | 'punctuation' | 'style' => {
  switch (categoryId) {
    case 'TYPOS':
      return 'spelling';
    case 'GRAMMAR':
      return 'grammar';
    case 'STYLE':
      return 'style';
    case 'PUNCTUATION':
      return 'punctuation';
    default:
      return 'grammar';
  }
};

const getErrorSeverity = (issueType: string): 'critical' | 'warning' | 'suggestion' => {
  switch (issueType) {
    case 'misspelling':
    case 'grammar':
      return 'critical';
    case 'style':
    case 'typography':
      return 'warning';
    default:
      return 'suggestion';
  }
}; as const;

export const SmartEditorOptimized: React.FC<SmartEditorProps> = memo(({
  initialValue = '',
  placeholder = 'Commencez à écrire... Je vous aide à perfectionner votre français !',
  onProgressUpdate,
  mode = 'practice',
  realTimeCorrection = true,
  className
}) => {
  const [text, setText] = useState(initialValue);
  const [errors, setErrors] = useState<HighlightedError[]>([]);
  const [selectedError, setSelectedError] = useState<HighlightedError | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [metrics, setMetrics] = useState<ProgressMetrics>({
    wordsWritten: 0,
    errorsDetected: 0,
    errorsCorrected: 0,
    accuracyRate: 100,
    streakCount: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [perfectStreak, setPerfectStreak] = useState(0);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const debouncedText = useDebounce(text, 1000);
  const { checkGrammarDebounced, isChecking, isReady, isAvailable } = useLanguageTool();

  // Mémorisation des callbacks pour éviter les re-renders
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Réinitialiser la sélection d'erreur lors de la modification
    if (selectedError) {
      const errorStillExists = errors.some(err => 
        err.start <= e.target.selectionStart && 
        err.end >= e.target.selectionStart
      );
      if (!errorStillExists) {
        setSelectedError(null);
        setShowSuggestions(false);
      }
    }
  }, [selectedError, errors]);

  const applySuggestion = useCallback((suggestion: string) => {
    if (!selectedError) return;

    const before = text.slice(0, selectedError.start);
    const after = text.slice(selectedError.end);
    const newText = before + suggestion + after;
    
    setText(newText);
    setErrors(prev => prev.filter(e => e.id !== selectedError.id));
    setSelectedError(null);
    setShowSuggestions(false);
    
    // Animation de succès
    setMetrics(prev => ({
      ...prev,
      errorsCorrected: prev.errorsCorrected + 1
    }));
  }, [selectedError, text]);

  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  const handleErrorClick = useCallback((error: HighlightedError) => {
    setSelectedError(error);
    setShowSuggestions(true);
  }, []);

  // Analyse du texte avec LanguageTool - optimisé
  useEffect(() => {
    if (!realTimeCorrection || debouncedText.length < 3 || !isReady) return;

    const analyzeText = async () => {
      setIsAnalyzing(true);
      try {
        const result = await checkGrammarDebounced(debouncedText);
        
        if (result.metrics.totalErrors === 0 && debouncedText.split(' ').length > 5) {
          setPerfectStreak(prev => prev + 1);
        }

        const newErrors = result.errors.map((error, index) => ({
          id: `lt-${index}-${error.rule?.id || index}`,
          start: error.offset,
          end: error.offset + error.length,
          type: getErrorType(error.rule?.category?.id || 'GRAMMAR'),
          severity: getErrorSeverity(error.rule?.issueType || 'grammar'),
          message: error.message,
          suggestions: error.replacements?.slice(0, 3).map(r => r.value) || []
        }));

        setErrors(newErrors);

        // Mise à jour des métriques
        const wordCount = debouncedText.split(/\s+/).filter(w => w.length > 0).length;
        const accuracy = result.metrics.accuracy;
        
        const newMetrics = {
          wordsWritten: wordCount,
          errorsDetected: result.metrics.totalErrors,
          errorsCorrected: metrics.errorsCorrected,
          accuracyRate: Math.round(accuracy),
          streakCount: perfectStreak
        };
        
        setMetrics(newMetrics);
        onProgressUpdate?.(newMetrics);
      } catch (error) {
        console.error('Erreur lors de l\'analyse:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeText();
  }, [debouncedText, realTimeCorrection, checkGrammar, metrics.errorsCorrected, perfectStreak, onProgressUpdate]);

  // Rendu des erreurs avec overlays - optimisé avec useMemo
  const renderHighlights = useMemo(() => {
    if (!text || errors.length === 0) return null;

    return errors.map(error => {
      const errorText = text.slice(error.start, error.end);
      const beforeText = text.slice(0, error.start);
      const lines = beforeText.split('\n');
      const lastLine = lines[lines.length - 1];
      
      const color = ERROR_COLORS[error.severity];

      return (
        <motion.span
          key={error.id}
          className={cn(
            'absolute border-b-2 cursor-pointer transition-all',
            color,
            selectedError?.id === error.id && 'ring-2 ring-offset-1'
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0.6, scale: 1 }}
          whileHover={{ opacity: 0.8 }}
          onClick={() => handleErrorClick(error)}
          style={{
            left: `${lastLine.length}ch`,
            top: `${lines.length - 1}em`,
            width: `${errorText.length}ch`
          }}
        />
      );
    });
  }, [text, errors, selectedError?.id, handleErrorClick]);

  // Mémorisation des valeurs calculées
  const statusBarContent = useMemo(() => ({
    wordCount: metrics.wordsWritten,
    errorCount: errors.length,
    modeLabel: mode === 'practice' ? 'Entraînement' : mode === 'exam' ? 'Examen' : 'Créatif'
  }), [metrics.wordsWritten, errors.length, mode]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <LanguageToolStatus 
            isAvailable={isAvailable}
            isChecking={isChecking}
          />
          <PerformanceIndicator 
            isAnalyzing={isAnalyzing}
            perfectStreak={perfectStreak}
            accuracyRate={metrics.accuracyRate}
          />
        </div>
        
        <div className="relative">
          <TextareaAutosize
            ref={editorRef}
            value={text}
            onChange={handleTextChange}
            placeholder={placeholder}
            className="w-full p-4 pt-12 resize-none outline-none font-sans text-gray-900 leading-relaxed"
            minRows={8}
            maxRows={20}
            style={{ 
              background: 'transparent',
              caretColor: '#3B82F6'
            }}
          />
          
          {/* Overlay pour les highlights */}
          <div 
            ref={overlayRef}
            className="absolute inset-0 pointer-events-none p-4 pt-12"
            style={{ 
              font: 'inherit',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
          >
            {renderHighlights}
          </div>
        </div>

        {/* Barre de statut */}
        <motion.div 
          className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>{statusBarContent.wordCount} mots</span>
              {statusBarContent.errorCount > 0 && (
                <span className="text-orange-600 font-medium">
                  {statusBarContent.errorCount} suggestion{statusBarContent.errorCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Lightbulb className="w-3 h-3" />
              <span>Mode {statusBarContent.modeLabel}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <SuggestionsPanel 
        showSuggestions={showSuggestions}
        selectedError={selectedError}
        editorRef={editorRef}
        onApplySuggestion={applySuggestion}
        onClose={closeSuggestions}
      />
    </div>
  );
});

SmartEditorOptimized.displayName = 'SmartEditorOptimized';
