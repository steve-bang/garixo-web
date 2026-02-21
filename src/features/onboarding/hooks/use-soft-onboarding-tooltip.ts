'use client';

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'garixo:first-work-order-tooltip-dismissed';

export function useSoftOnboardingTooltip(enabled: boolean): {
  visible: boolean;
  dismiss: () => void;
} {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    const dismissed = window.localStorage.getItem(DISMISS_KEY) === '1';
    if (dismissed) return;

    const timer = window.setTimeout(() => setVisible(true), 3000);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return { visible, dismiss };
}
