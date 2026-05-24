import { createContext, useContext, useState, useCallback } from 'react';

const SelectedRepoContext = createContext(null);

/**
 * Persists the selected repo ID across page navigation.
 * Stored in localStorage so it survives page refreshes.
 */
export function SelectedRepoProvider({ children }) {
  const [selectedRepoId, setSelectedRepoIdState] = useState(
    () => localStorage.getItem('devtrackr_selected_repo') || null
  );

  const setSelectedRepoId = useCallback((id) => {
    if (id) {
      localStorage.setItem('devtrackr_selected_repo', id);
    } else {
      localStorage.removeItem('devtrackr_selected_repo');
    }
    setSelectedRepoIdState(id);
  }, []);

  return (
    <SelectedRepoContext.Provider value={{ selectedRepoId, setSelectedRepoId }}>
      {children}
    </SelectedRepoContext.Provider>
  );
}

export function useSelectedRepo() {
  const ctx = useContext(SelectedRepoContext);
  if (!ctx) throw new Error('useSelectedRepo must be used within SelectedRepoProvider');
  return ctx;
}
