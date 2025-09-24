// start-dev.js
// Script pour démarrer les serveurs frontend et backend en mode développement

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 DÉMARRAGE DES SERVEURS FRANÇAIS FLUIDE');
console.log('='.repeat(50));

// Configuration
const BACKEND_DIR = path.join(__dirname, 'backend-francais-fluide');
const FRONTEND_DIR = path.join(__dirname, 'frontend-francais-fluide');
const BACKEND_PORT = process.env.BACKEND_PORT || 3001;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

// Couleurs pour les logs
const colors = {
  backend: '\x1b[36m', // Cyan
  frontend: '\x1b[33m', // Yellow
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m'
};

// Fonction pour lancer un serveur
function startServer(name, dir, command, port, color) {
  console.log(`${color}📦 Démarrage du serveur ${name}...${colors.reset}`);
  
  const child = spawn(command, ['run', 'dev'], {
    cwd: dir,
    stdio: 'pipe',
    shell: true
  });

  child.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('ready') || output.includes('started') || output.includes('listening')) {
      console.log(`${color}✅ ${name} démarré sur le port ${port}${colors.reset}`);
    }
    console.log(`${color}[${name}]${colors.reset} ${output}`);
  });

  child.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('error') || output.includes('Error') || output.includes('ERROR')) {
      console.log(`${colors.red}[${name} ERROR]${colors.reset} ${output}`);
    } else {
      console.log(`${color}[${name}]${colors.reset} ${output}`);
    }
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.log(`${colors.red}❌ ${name} s'est arrêté avec le code ${code}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ ${name} s'est arrêté proprement${colors.reset}`);
    }
  });

  child.on('error', (error) => {
    console.log(`${colors.red}❌ Erreur lors du démarrage de ${name}: ${error.message}${colors.reset}`);
  });

  return child;
}

// Démarrer les serveurs
console.log('🔧 Configuration:');
console.log(`   Backend: ${BACKEND_DIR} (port ${BACKEND_PORT})`);
console.log(`   Frontend: ${FRONTEND_DIR} (port ${FRONTEND_PORT})`);
console.log('');

// Démarrer le backend
const backendProcess = startServer(
  'Backend', 
  BACKEND_DIR, 
  'npm', 
  BACKEND_PORT, 
  colors.backend
);

// Attendre un peu avant de démarrer le frontend
setTimeout(() => {
  // Démarrer le frontend
  const frontendProcess = startServer(
    'Frontend', 
    FRONTEND_DIR, 
    'npm', 
    FRONTEND_PORT, 
    colors.frontend
  );

  // Gestion de l'arrêt propre
  process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt des serveurs...');
    backendProcess.kill('SIGINT');
    frontendProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Arrêt des serveurs...');
    backendProcess.kill('SIGTERM');
    frontendProcess.kill('SIGTERM');
    process.exit(0);
  });

}, 2000);

console.log('\n💡 Conseils:');
console.log('   - Backend: http://localhost:3001');
console.log('   - Frontend: http://localhost:3000');
console.log('   - Health Check: http://localhost:3001/health');
console.log('   - Appuyez sur Ctrl+C pour arrêter les serveurs');
console.log('');
