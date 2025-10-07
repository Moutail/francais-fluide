// src/routes/admin-dictations-upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configuration de Multer pour l'upload de fichiers audio
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/audio/dictations');
    
    // Créer le dossier s'il n'existe pas
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Erreur création dossier:', err);
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique : timestamp-random-original.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/x-m4a',
    'audio/mp4'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non supporté: ${file.mimetype}. Formats acceptés: MP3, WAV, OGG`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  }
});

// POST /api/admin/dictations/upload-audio
router.post('/upload-audio', authenticateToken, requireAdmin, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier audio fourni'
      });
    }

    // Obtenir la durée du fichier audio
    const getAudioDuration = require('get-audio-duration');
    const filePath = req.file.path;
    
    let duration = 0;
    try {
      duration = await getAudioDuration.getAudioDurationInSeconds(filePath);
    } catch (err) {
      console.warn('Impossible de déterminer la durée audio:', err.message);
      // Continuer sans durée
    }

    // URL publique du fichier
    const audioUrl = `/audio/dictations/${req.file.filename}`;

    res.json({
      success: true,
      audioUrl,
      duration: Math.round(duration),
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error) {
    console.error('Erreur upload audio:', error);
    
    // Supprimer le fichier en cas d'erreur
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error('Erreur suppression fichier:', unlinkErr);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors du téléversement du fichier audio'
    });
  }
});

// DELETE /api/admin/dictations/delete-audio/:filename
router.delete('/delete-audio/:filename', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Valider le nom de fichier (sécurité)
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        error: 'Nom de fichier invalide'
      });
    }

    const filePath = path.join(__dirname, '../../public/audio/dictations', filename);
    
    // Vérifier que le fichier existe
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'Fichier non trouvé'
      });
    }

    // Supprimer le fichier
    await fs.unlink(filePath);

    res.json({
      success: true,
      message: 'Fichier audio supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression audio:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du fichier audio'
    });
  }
});

// GET /api/admin/dictations/audio-files
router.get('/audio-files', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const audioDir = path.join(__dirname, '../../public/audio/dictations');
    
    // Créer le dossier s'il n'existe pas
    try {
      await fs.mkdir(audioDir, { recursive: true });
    } catch (err) {
      // Ignorer si le dossier existe déjà
    }

    const files = await fs.readdir(audioDir);
    
    const audioFiles = await Promise.all(
      files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.mp3', '.wav', '.ogg', '.webm', '.m4a'].includes(ext);
        })
        .map(async (file) => {
          const filePath = path.join(audioDir, file);
          const stats = await fs.stat(filePath);
          
          return {
            filename: file,
            url: `/audio/dictations/${file}`,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          };
        })
    );

    // Trier par date de création (plus récent en premier)
    audioFiles.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      files: audioFiles,
      total: audioFiles.length
    });

  } catch (error) {
    console.error('Erreur liste fichiers audio:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la liste des fichiers audio'
    });
  }
});

module.exports = router;
