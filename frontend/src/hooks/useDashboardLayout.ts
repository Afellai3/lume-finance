import { useState, useEffect } from 'react';

export type WidgetId = 'saldo' | 'entrateUscite' | 'topCategorie' | 'ultimiMovimenti' | 'budgetObiettivi';

export interface DashboardWidget {
  id: WidgetId;
  visible: boolean;
  label: string;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'saldo', visible: true, label: 'Saldo Totale' },
  { id: 'entrateUscite', visible: true, label: 'Entrate vs Uscite' },
  { id: 'topCategorie', visible: true, label: 'Top Categorie' },
  { id: 'ultimiMovimenti', visible: true, label: 'Ultimi Movimenti' },
  { id: 'budgetObiettivi', visible: true, label: 'Budget & Obiettivi' },
];

const STORAGE_KEY = 'dashboard_layout_v1';

export const useDashboardLayout = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setWidgets(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  }, [widgets]);

  const toggleVisibility = (id: WidgetId) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const moveUp = (id: WidgetId) => {
    setWidgets(prev => {
      const index = prev.findIndex(w => w.id === id);
      if (index <= 0) return prev;
      const newWidgets = [...prev];
      [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
      return newWidgets;
    });
  };

  const moveDown = (id: WidgetId) => {
    setWidgets(prev => {
      const index = prev.findIndex(w => w.id === id);
      if (index < 0 || index >= prev.length - 1) return prev;
      const newWidgets = [...prev];
      [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
      return newWidgets;
    });
  };

  const reset = () => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.removeItem(STORAGE_KEY);
  };

  const visibleWidgets = widgets.filter(w => w.visible);

  return {
    widgets,
    visibleWidgets,
    isCustomizing,
    setIsCustomizing,
    toggleVisibility,
    moveUp,
    moveDown,
    reset,
  };
};
