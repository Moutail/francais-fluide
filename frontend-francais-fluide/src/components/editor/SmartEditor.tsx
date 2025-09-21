// src/components/editor/SmartEditor.tsx
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

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
  className
}) => {
  const [text, setText] = useState(initialValue);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    if (onProgressUpdate) {
      const metrics: ProgressMetrics = {
        wordsWritten: newText.trim().split(/\s+/).length,
        errorsDetected: 0,
        errorsCorrected: 0,
        accuracyRate: 95,
        streakCount: 3
      };
      onProgressUpdate(metrics);
    }
  }, [onProgressUpdate]);

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="w-full min-h-[200px] p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none text-lg leading-relaxed"
          style={{ fontFamily: 'inherit' }}
        />
        
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 flex items-center gap-2 text-blue-600"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
            />
            <span className="text-sm font-medium">Analyse...</span>
          </motion.div>
        )}
      </div>

      {/* Indicateurs de performance */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{text.trim().split(/\s+/).length} mots</span>
          </div>
          <div className="flex items-center gap-1">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span>95% de précision</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          <span>Mode {mode}</span>
        </div>
      </div>

      {/* Suggestions simulées */}
      {text.length > 10 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
        >
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Suggestions
          </h4>
          <p className="text-blue-800 text-sm">
            Votre texte semble correct ! Continuez à écrire pour obtenir plus de suggestions personnalisées.
          </p>
        </motion.div>
      )}
    </div>
  );
};