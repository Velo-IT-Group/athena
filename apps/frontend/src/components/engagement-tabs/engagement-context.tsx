import { createContext, useContext, ReactNode, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Engagement } from '@/providers/worker-provider';

interface EngagementContextType {
  currentEngagement: Engagement | null;
  setCurrentEngagement: (engagement: Engagement | null) => void;
//   updateEngagement: (update: Partial<Engagement>) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const EngagementContext = createContext<EngagementContextType | undefined>(undefined);

interface EngagementProviderProps {
  children: ReactNode;
  initialEngagement?: Engagement | null;
  onEngagementChange?: (engagement: Engagement | null) => void;
}

export function EngagementProvider({ 
  children, 
  initialEngagement,
  onEngagementChange 
}: EngagementProviderProps) {
  const [currentEngagement, setCurrentEngagement] = useState<Engagement | null>(initialEngagement ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEngagementChange = (engagement: Engagement | null) => {
    setCurrentEngagement(engagement);
    onEngagementChange?.(engagement);
  };

//   const updateEngagement = async (update: Partial<EngagementUpdate>) => {
//     if (!currentEngagement) return;
    
//     setIsLoading(true);
//     setError(null);

//     try {
//       const supabase = createClient();
//       const { error: updateError } = await supabase
//         .schema('reporting')
//         .from('engagements')
//         .update(update)
//         .eq('id', currentEngagement.id);

//       if (updateError) {
//         throw new Error(updateError.message);
//       }

//       setCurrentEngagement(prev => prev ? { ...prev, ...update } : null);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to update engagement');
//     } finally {
//       setIsLoading(false);
//     }
//   };

  const value = {
    currentEngagement,
    setCurrentEngagement: handleEngagementChange,
    // updateEngagement,
    isLoading,
    setIsLoading,
    error,
    setError,
  };

  return (
    <EngagementContext.Provider value={value}>
      {children}
    </EngagementContext.Provider>
  );
}

export function useEngagement() {
  const context = useContext(EngagementContext);
  if (context === undefined) {
    throw new Error('useEngagement must be used within an EngagementProvider');
  }
  return context;
}

export type { Engagement };