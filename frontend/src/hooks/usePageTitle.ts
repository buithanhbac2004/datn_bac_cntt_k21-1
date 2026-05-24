import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';

export const usePageTitle = (title: string, subtitle?: string) => {
  const setPageInfo = useAppStore((state) => state.setPageInfo);

  useEffect(() => {
    setPageInfo(title, subtitle);
  }, [title, subtitle, setPageInfo]);
};