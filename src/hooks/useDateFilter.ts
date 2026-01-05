import { useState, useEffect } from 'react';

export interface DateFilterState {
  startDate: string | null;
  endDate: string | null;
}

const STORAGE_KEY = 'taskday_date_filter';

export function useDateFilter() {
  const [filter, setFilter] = useState<DateFilterState>({
    startDate: null,
    endDate: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFilter(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar filtro de datas:', error);
    }
  }, []);

  // Save to localStorage whenever filter changes
  const updateFilter = (newFilter: DateFilterState) => {
    setFilter(newFilter);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFilter));
    } catch (error) {
      console.error('Erro ao salvar filtro de datas:', error);
    }
  };

  const setDateRange = (startDate: string | null, endDate: string | null) => {
    updateFilter({ startDate, endDate });
  };

  const clearFilter = () => {
    updateFilter({ startDate: null, endDate: null });
  };

  const isFiltering = Boolean(filter.startDate || filter.endDate);

  return {
    filter,
    setDateRange,
    clearFilter,
    isFiltering,
  };
}
