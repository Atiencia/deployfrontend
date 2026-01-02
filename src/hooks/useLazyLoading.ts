import { useState, useEffect, useMemo } from 'react';

interface UseLazyLoadingProps<T> {
  data: T[];
  itemsPerPage: number;
  dependencies?: any[]; // Para resetear cuando cambien filtros
}

interface UseLazyLoadingReturn<T> {
  displayedItems: T[];
  currentPage: number;
  showingAll: boolean;
  hasMore: boolean;
  loadMore: () => void;
  showAll: () => void;
  showPaginated: () => void;
  reset: () => void;
  totalItems: number;
  displayedCount: number;
}

/**
 * Hook personalizado para implementar lazy loading en listas
 * Permite cargar elementos de forma progresiva o mostrar todos a la vez
 */
export default function useLazyLoading<T>({
  data,
  itemsPerPage,
  dependencies = []
}: UseLazyLoadingProps<T>): UseLazyLoadingReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [showingAll, setShowingAll] = useState(false);

  // Resetear cuando cambien las dependencias (ej: filtros)
  useEffect(() => {
    setCurrentPage(1);
    setShowingAll(false);
  }, dependencies);

  // Elementos a mostrar basado en el estado actual
  const displayedItems = useMemo(() => {
    if (showingAll) {
      return data;
    }
    return data.slice(0, currentPage * itemsPerPage);
  }, [data, currentPage, itemsPerPage, showingAll]);

  // Calcular si hay más elementos para cargar
  const hasMore = useMemo(() => {
    return !showingAll && (currentPage * itemsPerPage) < data.length;
  }, [currentPage, itemsPerPage, data.length, showingAll]);

  // Funciones de control
  const loadMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const showAll = () => {
    setShowingAll(true);
    setCurrentPage(1);
  };

  const showPaginated = () => {
    setShowingAll(false);
    setCurrentPage(1);
  };

  const reset = () => {
    setCurrentPage(1);
    setShowingAll(false);
  };

  return {
    displayedItems,
    currentPage,
    showingAll,
    hasMore,
    loadMore,
    showAll,
    showPaginated,
    reset,
    totalItems: data.length,
    displayedCount: displayedItems.length
  };
}