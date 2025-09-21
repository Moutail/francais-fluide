// src/components/performance/VirtualizedList.tsx

/**
 * Composant de liste virtualisée pour les performances optimales
 * Rendu efficace de longues listes avec seulement les éléments visibles
 */

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import { motion, AnimatePresence } from 'framer-motion';

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight?: number;
  itemRenderer: (props: { index: number; item: T; style: React.CSSProperties }) => React.ReactNode;
  height: number;
  width?: number | string;
  overscan?: number;
  className?: string;
  enableAnimations?: boolean;
  onItemClick?: (item: T, index: number) => void;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  variableHeight?: boolean;
  estimatedItemSize?: number;
}

export interface VirtualizedListState {
  scrollTop: number;
  scrollLeft: number;
  isScrolling: boolean;
  visibleRange: { start: number; end: number };
}

// Composant d'élément de liste mémorisé
const VirtualizedListItem = memo<{
  index: number;
  item: any;
  style: React.CSSProperties;
  itemRenderer: (props: any) => React.ReactNode;
  onItemClick?: (item: any, index: number) => void;
  enableAnimations?: boolean;
}>(({ index, item, style, itemRenderer, onItemClick, enableAnimations = true }) => {
  const handleClick = useCallback(() => {
    onItemClick?.(item, index);
  }, [item, index, onItemClick]);

  const content = itemRenderer({ index, item, style });

  if (!enableAnimations) {
    return (
      <div style={style} onClick={handleClick}>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      style={style}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, delay: index * 0.01 }}
      className="virtualized-list-item"
    >
      {content}
    </motion.div>
  );
});

VirtualizedListItem.displayName = 'VirtualizedListItem';

// Composant de liste virtualisée principale
export const VirtualizedList = memo(<T,>({
  items,
  itemHeight = 50,
  itemRenderer,
  height,
  width = '100%',
  overscan = 5,
  className = '',
  enableAnimations = true,
  onItemClick,
  onScroll,
  loading = false,
  loadingComponent,
  emptyComponent,
  variableHeight = false,
  estimatedItemSize = 50
}: VirtualizedListProps<T>) => {
  const [state, setState] = useState<VirtualizedListState>({
    scrollTop: 0,
    scrollLeft: 0,
    isScrolling: false,
    visibleRange: { start: 0, end: 0 }
  });

  const listRef = useRef<List | VariableSizeList>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculer la plage visible
  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(height / itemHeight);
    const start = Math.max(0, Math.floor(state.scrollTop / itemHeight) - overscan);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    
    return { start, end };
  }, [state.scrollTop, height, itemHeight, overscan, items.length]);

  // Gestionnaire de scroll optimisé
  const handleScroll = useCallback(({ scrollTop, scrollLeft }: { scrollTop: number; scrollLeft: number }) => {
    setState(prev => ({
      ...prev,
      scrollTop,
      scrollLeft,
      isScrolling: true,
      visibleRange
    }));

    onScroll?.(scrollTop, scrollLeft);

    // Délai pour détecter la fin du scroll
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isScrolling: false }));
    }, 150);
  }, [onScroll, visibleRange]);

  // Nettoyage du timeout
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Rendu d'élément optimisé
  const renderItem = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    
    return (
      <VirtualizedListItem
        index={index}
        item={item}
        style={style}
        itemRenderer={itemRenderer}
        onItemClick={onItemClick}
        enableAnimations={enableAnimations && !state.isScrolling}
      />
    );
  }, [items, itemRenderer, onItemClick, enableAnimations, state.isScrolling]);

  // Calcul de la taille variable des éléments
  const getItemSize = useCallback((index: number) => {
    if (typeof itemHeight === 'number') {
      return itemHeight;
    }
    
    // Pour les tailles variables, utiliser une estimation ou calculer dynamiquement
    return estimatedItemSize;
  }, [itemHeight, estimatedItemSize]);

  // État de chargement
  if (loading) {
    return (
      <div 
        className={`virtualized-list loading ${className}`}
        style={{ height, width }}
      >
        {loadingComponent || (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        )}
      </div>
    );
  }

  // État vide
  if (items.length === 0) {
    return (
      <div 
        className={`virtualized-list empty ${className}`}
        style={{ height, width }}
      >
        {emptyComponent || (
          <div className="flex items-center justify-center h-full text-gray-500">
            Aucun élément à afficher
          </div>
        )}
      </div>
    );
  }

  // Rendu de la liste virtualisée
  const ListComponent = variableHeight ? VariableSizeList : List;

  return (
    <div 
      ref={containerRef}
      className={`virtualized-list-container ${className}`}
      style={{ height, width }}
    >
      <ListComponent
        ref={listRef}
        height={height}
        width={width}
        itemCount={items.length}
        itemSize={variableHeight ? getItemSize : itemHeight}
        onScroll={handleScroll}
        overscanCount={overscan}
        className="virtualized-list"
      >
        {renderItem}
      </ListComponent>

      {/* Indicateur de scroll */}
      {state.isScrolling && (
        <motion.div
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {Math.floor(state.scrollTop / itemHeight) + 1}-{Math.min(items.length, Math.ceil((state.scrollTop + height) / itemHeight))} / {items.length}
        </motion.div>
      )}
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

// Composant spécialisé pour les suggestions de grammaire
export const VirtualizedSuggestionsList = memo<{
  suggestions: Array<{ id: string; text: string; type: string; confidence: number }>;
  onSelect: (suggestion: any) => void;
  height?: number;
  className?: string;
}>(({ suggestions, onSelect, height = 200, className = '' }) => {
  const itemRenderer = useCallback(({ index, item, style }: any) => {
    const { text, type, confidence } = item;
    
    return (
      <div style={style} className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">{text}</span>
            <span className="text-xs text-gray-500 ml-2 capitalize">({type})</span>
          </div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              confidence > 0.8 ? 'bg-green-500' :
              confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-xs text-gray-400">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <VirtualizedList
      items={suggestions}
      itemHeight={48}
      itemRenderer={itemRenderer}
      height={height}
      className={`suggestions-list ${className}`}
      onItemClick={onSelect}
      enableAnimations={true}
    />
  );
});

VirtualizedSuggestionsList.displayName = 'VirtualizedSuggestionsList';

// Composant spécialisé pour les exercices
export const VirtualizedExercisesList = memo<{
  exercises: Array<{ id: string; title: string; difficulty: string; completed: boolean }>;
  onSelect: (exercise: any) => void;
  height?: number;
  className?: string;
}>(({ exercises, onSelect, height = 400, className = '' }) => {
  const itemRenderer = useCallback(({ index, item, style }: any) => {
    const { title, difficulty, completed } = item;
    
    const difficultyColors = {
      facile: 'bg-green-100 text-green-800',
      moyen: 'bg-yellow-100 text-yellow-800',
      difficile: 'bg-red-100 text-red-800'
    };

    return (
      <div style={style} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              {completed && (
                <span className="text-green-500">✓</span>
              )}
            </div>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.moyen}`}>
              {difficulty}
            </span>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <VirtualizedList
      items={exercises}
      itemHeight={64}
      itemRenderer={itemRenderer}
      height={height}
      className={`exercises-list ${className}`}
      onItemClick={onSelect}
      enableAnimations={true}
    />
  );
});

VirtualizedExercisesList.displayName = 'VirtualizedExercisesList';

// Hook pour utiliser la virtualisation
export const useVirtualization = <T,>(
  items: T[],
  options: {
    itemHeight?: number;
    containerHeight?: number;
    overscan?: number;
  } = {}
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { itemHeight = 50, containerHeight = 400, overscan = 5 } = options;

  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    
    return { start, end };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
  }, []);

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    handleScroll,
    itemHeight
  };
};
