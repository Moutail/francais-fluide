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
          className="min-h-[200px] w-full resize-none rounded-xl border-2 border-gray-200 p-4 text-lg leading-relaxed transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          style={{ fontFamily: 'inherit' }}
        />

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-4 top-4 flex items-center gap-2 text-blue-600"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="size-4 rounded-full border-2 border-blue-600 border-t-transparent"
            />
            <span className="text-sm font-medium">Analyse...</span>
          </motion.div>
        )}
      </div>

      {/* Bouton de correction grammaticale */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={checkGrammar}
            disabled={!text.trim() || isCheckingGrammar}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCheckingGrammar ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wand2 className="size-4" />
            )}
            {isCheckingGrammar ? 'Vérification...' : 'Vérifier la grammaire'}
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
              {serviceUsed === 'openai'
                ? 'GPT-4'
                : serviceUsed === 'anthropic'
                  ? 'Claude'
                  : serviceUsed === 'languagetool'
                    ? 'LanguageTool'
                    : 'Mode basique'}
            </div>
          )}
        </div>

        {grammarErrors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-red-600">
              {grammarErrors.length} erreur{grammarErrors.length > 1 ? 's' : ''} détectée
              {grammarErrors.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={applyAllCorrections}
              className="rounded bg-green-600 px-3 py-1 text-sm text-white transition-colors hover:bg-green-700"
            >
              Corriger tout
            </button>
          </div>
        )}
      </div>

      {/* Indicateurs de performance */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <CheckCircle className="size-4 text-green-500" />
            <span>{text.trim().split(/\s+/).length} mots</span>
          </div>
          <div className="flex items-center gap-1">
            <Lightbulb className="size-4 text-yellow-500" />
            <span>
              {grammarErrors.length > 0 ? Math.max(0, 100 - grammarErrors.length * 10) : 100}% de
              précision
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <AlertCircle className="size-4 text-blue-500" />
          <span>Mode {mode}</span>
        </div>
      </div>

      {/* Affichage des erreurs grammaticales */}
      {showCorrections && grammarErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-3"
        >
          <h4 className="flex items-center gap-2 font-medium text-gray-900">
            <AlertCircle className="size-5 text-red-500" />
            Erreurs détectées ({grammarErrors.length})
          </h4>

          <div className="space-y-2">
            {grammarErrors.map((error, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-lg border border-red-200 bg-red-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${GrammarCheckService.getErrorTypeColor(error.type)}`}
                      >
                        {error.type}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-red-600">"{error.original}"</span>
                      <span className="mx-2 text-gray-500">→</span>
                      <span className="font-medium text-green-600">"{error.corrected}"</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{error.explanation}</p>
                  </div>
                  <button
                    onClick={() => applyCorrection(error)}
                    className="rounded bg-green-600 px-3 py-1 text-xs text-white transition-colors hover:bg-green-700"
                  >
                    Corriger
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Message de succès si aucune erreur */}
      {showCorrections && grammarErrors.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="size-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Excellent !</h4>
              <p className="text-sm text-green-700">
                Aucune erreur grammaticale détectée dans votre texte.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
