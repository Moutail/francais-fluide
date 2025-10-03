// src/components/editor/SmartEditor.tsx
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Lightbulb, Wand2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  GrammarCheckService,
  type GrammarError,
  type GrammarCheckResult,
} from '@/lib/grammar-check';

interface SmartEditorProps {
  initialValue?: string;
  placeholder?: string;
  onProgressUpdate?: (metrics: any) => void;
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

export const SmartEditor: React.FC<SmartEditorProps> = ({
  initialValue = '',
  placeholder = 'Commencez à écrire... Je vous aide à perfectionner votre français !',
  onProgressUpdate,
  mode = 'practice',
  realTimeCorrection = true,
  className,
}) => {
  const [text, setText] = useState(initialValue);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [grammarErrors, setGrammarErrors] = useState<GrammarError[]>([]);
  const [correctedText, setCorrectedText] = useState('');
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [serviceUsed, setServiceUsed] = useState('');

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setText(newText);

      if (onProgressUpdate) {
        const metrics: ProgressMetrics = {
          wordsWritten: newText.trim() ? newText.trim().split(/\s+/).length : 0,
          errorsDetected: grammarErrors.length,
          errorsCorrected: 0,
          accuracyRate:
            grammarErrors.length > 0 ? Math.max(0, 100 - grammarErrors.length * 10) : 100,
          streakCount: 3,
        };
        onProgressUpdate(metrics);
      }
    },
    [grammarErrors.length, onProgressUpdate]
  );

  const checkGrammar = useCallback(async () => {
    if (!text.trim()) return;

    setIsCheckingGrammar(true);
    try {
      const result = await GrammarCheckService.checkText(text);

      if (result.success && result.data) {
        setGrammarErrors(result.data.errors);
        setCorrectedText(result.data.correctedText);
        setShowCorrections(true);
        setIsFallbackMode((result.fallback ?? result.data?.fallback) || false);
        setServiceUsed(result.service || 'fallback');

        if (onProgressUpdate) {
          const metrics: ProgressMetrics = {
            wordsWritten: text.trim().split(/\s+/).length,
            errorsDetected: result.data.errors.length,
            errorsCorrected: 0,
            accuracyRate:
              result.data.errors.length > 0
                ? Math.max(0, 100 - result.data.errors.length * 10)
                : 100,
            streakCount: 3,
          };
          onProgressUpdate(metrics);
        }
      } else {
        console.error('Erreur correction grammaticale:', result.error);
      }
    } catch (error) {
      console.error('Erreur correction grammaticale:', error);
    } finally {
      setIsCheckingGrammar(false);
    }
  }, [onProgressUpdate, text]);

  const applyCorrection = (error: GrammarError) => {
    // Remplacer seulement la première occurrence de l'erreur
    const newText = text.replace(error.original, error.corrected);
    setText(newText);
    setGrammarErrors(prev => prev.filter(e => e !== error));

    // Mettre à jour les métriques
    if (onProgressUpdate) {
      const metrics: ProgressMetrics = {
        wordsWritten: newText.trim().split(/\s+/).length,
        errorsDetected: grammarErrors.length - 1,
        errorsCorrected: 1,
        accuracyRate: Math.max(0, 100 - (grammarErrors.length - 1) * 10),
        streakCount: 3,
      };
      onProgressUpdate(metrics);
    }
  };

  const applyAllCorrections = () => {
    setText(correctedText);
    setGrammarErrors([]);
    setShowCorrections(false);

    // Mettre à jour les métriques
    if (onProgressUpdate) {
      const metrics: ProgressMetrics = {
        wordsWritten: correctedText.trim().split(/\s+/).length,
        errorsDetected: 0,
        errorsCorrected: grammarErrors.length,
        accuracyRate: 100,
        streakCount: 3,
      };
      onProgressUpdate(metrics);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="min-h-[300px] w-full resize-none rounded-xl border-2 border-gray-200 p-3 text-base leading-relaxed transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 md:min-h-[400px] md:p-4 md:text-lg"
          style={{ fontFamily: 'inherit' }}
        />

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-2 top-2 flex items-center gap-1 text-blue-600 md:right-4 md:top-4 md:gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="size-3 rounded-full border-2 border-blue-600 border-t-transparent md:size-4"
            />
            <span className="text-xs font-medium md:text-sm">Analyse...</span>
          </motion.div>
        )}
      </div>

      {/* Bouton de correction grammaticale - Responsive */}
      <div className="mt-3 flex flex-col gap-2 md:mt-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={checkGrammar}
            disabled={!text.trim() || isCheckingGrammar}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:gap-2 md:px-4 md:text-base"
          >
            {isCheckingGrammar ? (
              <Loader2 className="size-3 animate-spin md:size-4" />
            ) : (
              <Wand2 className="size-3 md:size-4" />
            )}
            <span className="hidden sm:inline">{isCheckingGrammar ? 'Vérification...' : 'Vérifier la grammaire'}</span>
            <span className="sm:hidden">{isCheckingGrammar ? 'Vérif...' : 'Vérifier'}</span>
          </button>

          {serviceUsed && (
            <div
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                serviceUsed === 'openai'
                  ? 'bg-green-100 text-green-800'
                  : serviceUsed === 'anthropic'
                    ? 'bg-blue-100 text-blue-800'
                    : serviceUsed === 'languagetool'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              <AlertCircle className="size-3" />
              <span className="hidden sm:inline">
                {serviceUsed === 'openai'
                  ? 'GPT-4'
                  : serviceUsed === 'anthropic'
                    ? 'Claude'
                    : serviceUsed === 'languagetool'
                      ? 'LanguageTool'
                      : 'Mode basique'}
              </span>
              <span className="sm:hidden">
                {serviceUsed === 'openai'
                  ? 'GPT'
                  : serviceUsed === 'anthropic'
                    ? 'Claude'
                    : serviceUsed === 'languagetool'
                      ? 'LT'
                      : 'Basic'}
              </span>
            </div>
          )}
        </div>

        {grammarErrors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-red-600 md:text-sm">
              {grammarErrors.length} erreur{grammarErrors.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={applyAllCorrections}
              className="rounded bg-green-600 px-2 py-1 text-xs text-white transition-colors hover:bg-green-700 md:px-3 md:text-sm"
            >
              Corriger tout
            </button>
          </div>
        )}
      </div>

      {/* Indicateurs de performance - Responsive */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 md:mt-4 md:text-sm">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1">
            <CheckCircle className="size-3 text-green-500 md:size-4" />
            <span>{text.trim().split(/\s+/).length} mots</span>
          </div>
          <div className="flex items-center gap-1">
            <Lightbulb className="size-3 text-yellow-500 md:size-4" />
            <span className="hidden sm:inline">
              {grammarErrors.length > 0 ? Math.max(0, 100 - grammarErrors.length * 10) : 100}% de précision
            </span>
            <span className="sm:hidden">
              {grammarErrors.length > 0 ? Math.max(0, 100 - grammarErrors.length * 10) : 100}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <AlertCircle className="size-3 text-blue-500 md:size-4" />
          <span className="capitalize">{mode}</span>
        </div>
      </div>

      {/* Affichage des erreurs grammaticales - Responsive */}
      {showCorrections && grammarErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 space-y-2 md:mt-4 md:space-y-3"
        >
          <h4 className="flex items-center gap-1 text-sm font-medium text-gray-900 md:gap-2 md:text-base">
            <AlertCircle className="size-4 text-red-500 md:size-5" />
            Erreurs détectées ({grammarErrors.length})
          </h4>

          <div className="max-h-[400px] space-y-2 overflow-y-auto md:max-h-[500px]">
            {grammarErrors.map((error, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-lg border border-red-200 bg-red-50 p-2 md:p-3"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2 md:mb-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium md:px-2 md:py-1 ${GrammarCheckService.getErrorTypeColor(error.type)}`}
                      >
                        {error.type}
                      </span>
                    </div>
                    <div className="text-xs md:text-sm">
                      <span className="font-medium text-red-600">"{error.original}"</span>
                      <span className="mx-1 text-gray-500 md:mx-2">→</span>
                      <span className="font-medium text-green-600">"{error.corrected}"</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{error.explanation}</p>
                  </div>
                  <button
                    onClick={() => applyCorrection(error)}
                    className="shrink-0 self-start rounded bg-green-600 px-2 py-1 text-xs text-white transition-colors hover:bg-green-700 md:px-3"
                  >
                    Corriger
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Message de succès si aucune erreur - Responsive */}
      {showCorrections && grammarErrors.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 md:mt-4 md:p-4"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <CheckCircle className="size-4 text-green-600 md:size-5" />
            <div>
              <h4 className="text-sm font-medium text-green-900 md:text-base">Excellent !</h4>
              <p className="text-xs text-green-700 md:text-sm">
                Aucune erreur grammaticale détectée dans votre texte.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
