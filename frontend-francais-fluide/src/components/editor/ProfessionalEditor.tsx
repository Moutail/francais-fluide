// src/components/editor/ProfessionalEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Zap, 
  FileText, 
  Save,
  Download,
  Upload
} from 'lucide-react';

interface ProfessionalEditorProps {
  initialValue?: string;
  placeholder?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
  className?: string;
}

export const ProfessionalEditor: React.FC<ProfessionalEditorProps> = ({
  initialValue = '',
  placeholder = 'Commencez à écrire votre texte...',
  onContentChange,
  onSave,
  className
}) => {
  const [content, setContent] = useState(initialValue);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (value: string) => {
    setContent(value);
    onContentChange?.(value);
    
    // Simuler l'analyse en temps réel
    if (value.length > 0) {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        // Simuler des erreurs et suggestions
        setErrors([
          { id: 1, message: 'Accord du participe passé', position: 15, type: 'grammar' },
          { id: 2, message: 'Ponctuation manquante', position: 45, type: 'punctuation' }
        ]);
        setSuggestions([
          { id: 1, message: 'Considérez utiliser "qui" au lieu de "que"', position: 25, type: 'style' }
        ]);
      }, 1000);
    } else {
      setErrors([]);
      setSuggestions([]);
    }
  };

  const handleSave = () => {
    onSave?.(content);
  };

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = content.length;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Éditeur de texte intelligent</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Zone d'édition */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-64 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-sans text-gray-900 leading-relaxed"
              />
              
              {/* Indicateur d'analyse */}
              {isAnalyzing && (
                <div className="absolute top-2 right-2 flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Analyse en cours...
                </div>
              )}
            </div>

            {/* Statistiques */}
            <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
              <div className="flex items-center gap-4">
                <span>{wordCount} mots</span>
                <span>{characterCount} caractères</span>
              </div>
              <div className="flex items-center gap-2">
                {errors.length > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.length} erreur{errors.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Info className="w-4 h-4" />
                    <span>{suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                {errors.length === 0 && suggestions.length === 0 && content.length > 0 && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Aucune erreur détectée</span>
                  </div>
                )}
              </div>
            </div>

            {/* Suggestions et erreurs */}
            {(errors.length > 0 || suggestions.length > 0) && (
              <div className="space-y-2">
                {errors.map((error) => (
                  <div key={error.id} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{error.message}</p>
                      <p className="text-xs text-red-600">Position {error.position}</p>
                    </div>
                  </div>
                ))}
                
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">{suggestion.message}</p>
                      <p className="text-xs text-blue-600">Position {suggestion.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
