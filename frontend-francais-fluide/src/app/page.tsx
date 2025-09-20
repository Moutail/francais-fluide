// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  Target, 
  Trophy, 
  Zap, 
  ChevronRight,
  Star,
  TrendingUp,
  Users,
  Clock,
  Award,
  Brain,
  Lightbulb,
  Rocket,
  CheckCircle
} from 'lucide-react';
import { SmartEditor } from '@/components/editor/SmartEditor';
import { Navbar } from '@/components/navigation/Navbar';
import { cn } from '@/lib/utils/cn';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

interface Statistic {
  value: string;
  label: string;
  trend?: number;
}

export default function HomePage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [userStats, setUserStats] = useState<Statistic[]>([
    { value: "0", label: "Mots écrits", trend: 0 },
    { value: "100%", label: "Précision", trend: 0 },
    { value: "0", label: "Séquence parfaite", trend: 0 },
    { value: "0", label: "Minutes pratiquées", trend: 0 }
  ]);
  
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 100], [0, -50]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);

  const features: Feature[] = [
    {
      icon: Brain,
      title: "IA Adaptative",
      description: "S'adapte à votre niveau et style d'apprentissage",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Correction Instantanée",
      description: "Feedback en temps réel pendant que vous écrivez",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Trophy,
      title: "Gamification",
      description: "Progressez avec des défis et récompenses motivants",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Target,
      title: "Exercices Ciblés",
      description: "Pratique personnalisée selon vos difficultés",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  // Animation des statistiques au montage
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserStats([
        { value: "2,847", label: "Mots écrits", trend: 12 },
        { value: "94%", label: "Précision", trend: 3 },
        { value: "7", label: "Séquence parfaite", trend: 2 },
        { value: "45", label: "Minutes pratiquées", trend: 15 }
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navbar currentPage="/" />

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-6"
            >
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-blue-900">
                Plus de 10,000 étudiants ont amélioré leur français
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Écrivez sans fautes,
              </span>
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-900"
              >
                naturellement.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto mb-10"
            >
              L'application intelligente qui transforme l'apprentissage du français 
              en une expérience intuitive et engageante. Fini les fautes, 
              bonjour la confiance !
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditorOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-2xl shadow-blue-500/30 flex items-center gap-2 group"
              >
                <Rocket className="w-5 h-5" />
                Essayer maintenant
                <motion.div
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/demo'}
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Voir la démo
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Statistiques animées */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {userStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5 + index * 0.1, type: "spring" }}
                    className="text-3xl font-bold text-gray-900"
                  >
                    {stat.value}
                  </motion.div>
                  {stat.trend && stat.trend > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.7 + index * 0.1 }}
                      className="flex items-center gap-1 text-green-500"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">+{stat.trend}%</span>
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Une approche révolutionnaire
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez comment FrançaisFluide transforme l'apprentissage
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${feature.color.split(' ')[1]} 0%, ${feature.color.split(' ')[3]} 100%)`
                  }}
                />
                <div className="relative bg-white rounded-2xl p-6 shadow-xl">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center mb-4",
                      feature.color
                    )}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsEditorOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Éditeur Intelligent
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditorOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    ×
                  </motion.button>
                </div>
                <SmartEditor 
                  mode="practice"
                  onProgressUpdate={(metrics) => {
                    console.log('Progress:', metrics);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-blue-500/30"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Trophy className="w-10 h-10" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-4">
            Prêt à transformer votre français ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez des milliers d'étudiants qui écrivent déjà sans fautes
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/auth/login'}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-2xl"
          >
            Commencer gratuitement
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}