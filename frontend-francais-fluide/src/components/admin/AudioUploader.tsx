// src/components/admin/AudioUploader.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Music, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioUploaderProps {
  onUploadSuccess: (audioUrl: string, duration: number) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export default function AudioUploader({
  onUploadSuccess,
  onUploadError,
  maxSizeMB = 10,
  acceptedFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
}: AudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const validateFile = (file: File): string | null => {
    // Vérifier le type
    if (!acceptedFormats.includes(file.type)) {
      return `Format non supporté. Formats acceptés : ${acceptedFormats.join(', ')}`;
    }

    // Vérifier la taille
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `Fichier trop volumineux. Taille max : ${maxSizeMB}MB (actuel : ${sizeMB.toFixed(2)}MB)`;
    }

    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);

    // Créer une preview audio
    const previewUrl = URL.createObjectURL(selectedFile);
    setAudioPreview(previewUrl);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleAudioLoaded = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      const duration = Math.round(audioRef.current.duration);
      setAudioDuration(duration);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      // Simuler la progression
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/admin/dictations/upload-audio', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du téléversement');
      }

      setSuccess(true);
      onUploadSuccess(data.audioUrl, data.duration || audioDuration || 0);

      // Reset après 2 secondes
      setTimeout(() => {
        setFile(null);
        setAudioPreview(null);
        setAudioDuration(null);
        setSuccess(false);
        setProgress(0);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléversement');
      if (onUploadError) {
        onUploadError(err.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setAudioPreview(null);
    setAudioDuration(null);
    setError(null);
    setSuccess(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      {/* Zone de drop */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-8 transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : error
              ? 'border-red-300 bg-red-50'
              : success
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleChange}
          className="hidden"
        />

        {!file ? (
          <div className="text-center">
            <Music className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Glissez-déposez un fichier audio ici, ou
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Choisir un fichier
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Formats acceptés : MP3, WAV, OGG (max {maxSizeMB}MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Informations du fichier */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Music className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                    {audioDuration && ` • ${formatDuration(audioDuration)}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                disabled={uploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview audio */}
            {audioPreview && (
              <div className="rounded-lg bg-white p-3">
                <audio
                  ref={audioRef}
                  src={audioPreview}
                  controls
                  className="w-full"
                  onLoadedMetadata={handleAudioLoaded}
                />
              </div>
            )}

            {/* Barre de progression */}
            {uploading && (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600">
                  Téléversement en cours... {progress}%
                </p>
              </div>
            )}

            {/* Bouton d'upload */}
            {!uploading && !success && (
              <button
                onClick={handleUpload}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!file}
              >
                Téléverser le fichier audio
              </button>
            )}
          </div>
        )}

        {/* Messages d'état */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-red-100 p-3 text-sm text-red-800"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-green-100 p-3 text-sm text-green-800"
            >
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Fichier téléversé avec succès !</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-4 rounded-lg bg-blue-50 p-4">
        <h4 className="mb-2 font-medium text-blue-900">💡 Conseils</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Utilisez des fichiers MP3 pour une meilleure compatibilité</li>
          <li>• Qualité recommandée : 128-192 kbps</li>
          <li>• Assurez-vous que l'audio est clair et sans bruit de fond</li>
          <li>• La durée sera automatiquement détectée</li>
        </ul>
      </div>
    </div>
  );
}
