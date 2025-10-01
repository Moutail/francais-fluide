#!/usr/bin/env node
/**
 * Script pour corriger automatiquement les warnings Tailwind CSS
 * - Remplace h-X w-X par size-X
 * - Remplace flex-shrink-0 par shrink-0
 * - Supprime les classes 'transform' inutiles en Tailwind v3
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const COLOR_GREEN = '\x1b[32m';
const COLOR_BLUE = '\x1b[34m';
const COLOR_YELLOW = '\x1b[33m';
const COLOR_RESET = '\x1b[0m';

let filesModified = 0;
let totalReplacements = 0;

function log(message, color = COLOR_BLUE) {
    console.log(`${color}${message}${COLOR_RESET}`);
}

function fixTailwindClasses(content) {
    let modified = false;
    let replacements = 0;
    
    // 1. Remplacer h-X w-X par size-X (même valeur)
    const sizePattern = /(\b)(h-\d+)\s+(w-\d+)(\b)/g;
    content = content.replace(sizePattern, (match, p1, h, w) => {
        const hValue = h.match(/h-(\d+)/)[1];
        const wValue = w.match(/w-(\d+)/)[1];
        
        if (hValue === wValue) {
            modified = true;
            replacements++;
            return `${p1}size-${hValue}`;
        }
        return match;
    });
    
    // 2. after:h-X after:w-X → after:size-X
    const afterSizePattern = /(\b)(after:h-\d+),?\s+(after:w-\d+)(\b)/g;
    content = content.replace(afterSizePattern, (match, p1, h, w) => {
        const hValue = h.match(/after:h-(\d+)/)[1];
        const wValue = w.match(/after:w-(\d+)/)[1];
        
        if (hValue === wValue) {
            modified = true;
            replacements++;
            return `${p1}after:size-${hValue}`;
        }
        return match;
    });
    
    // 3. Remplacer flex-shrink-0 par shrink-0
    if (content.includes('flex-shrink-0')) {
        content = content.replace(/\bflex-shrink-0\b/g, 'shrink-0');
        modified = true;
        replacements++;
    }
    
    // 4. Supprimer 'transform' standalone (inutile en Tailwind v3)
    // Attention: ne pas supprimer dans transform-gpu, transform-none, etc.
    const transformPattern = /(\s)transform(\s)/g;
    if (transformPattern.test(content)) {
        content = content.replace(transformPattern, '$1$2');
        modified = true;
        replacements++;
    }
    
    return { content, modified, replacements };
}

function processFile(filePath) {
    try {
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const { content: newContent, modified, replacements } = fixTailwindClasses(originalContent);
        
        if (modified) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            filesModified++;
            totalReplacements += replacements;
            log(`✓ Modifié: ${filePath} (${replacements} remplacement(s))`, COLOR_GREEN);
        }
    } catch (error) {
        log(`✗ Erreur: ${filePath} - ${error.message}`, COLOR_YELLOW);
    }
}

function main() {
    log('🔧 Correction des warnings Tailwind CSS...', COLOR_BLUE);
    log('');
    
    const srcDir = path.join(process.cwd(), 'frontend-francais-fluide', 'src');
    
    if (!fs.existsSync(srcDir)) {
        log('❌ Répertoire src/ introuvable. Assurez-vous d\'être à la racine du projet.', COLOR_YELLOW);
        process.exit(1);
    }
    
    // Trouver tous les fichiers TSX et TS
    const pattern = path.join(srcDir, '**', '*.{ts,tsx}');
    const files = glob.sync(pattern);
    
    log(`📁 ${files.length} fichiers trouvés`, COLOR_BLUE);
    log('');
    
    files.forEach(processFile);
    
    log('');
    log('═══════════════════════════════════', COLOR_BLUE);
    log(`✅ Terminé!`, COLOR_GREEN);
    log(`📊 ${filesModified} fichiers modifiés`, COLOR_GREEN);
    log(`🔄 ${totalReplacements} remplacements effectués`, COLOR_GREEN);
    log('═══════════════════════════════════', COLOR_BLUE);
    
    if (filesModified > 0) {
        log('');
        log('💡 Conseil: Exécutez maintenant:', COLOR_YELLOW);
        log('   npm run lint -- --fix', COLOR_YELLOW);
        log('   pour corriger les autres warnings automatiquement.', COLOR_YELLOW);
    }
}

main();


