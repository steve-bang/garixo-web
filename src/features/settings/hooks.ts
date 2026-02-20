'use client';

import { useMemo } from 'react';

import { getSettingsNavItems } from '@/features/settings/api';

export function useSettingsNav() {
  return useMemo(() => getSettingsNavItems(), []);
}
