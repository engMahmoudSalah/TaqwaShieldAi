import { useState, useEffect, useCallback } from 'react';

export interface ExtensionSettings {
  enabled: boolean;
  sensitivity: string;
  blurCount: number;
  blurFemales: boolean;
}

export function useExtensionSettings() {
  const [settings, setSettings] = useState<ExtensionSettings>({
    enabled: true,
    sensitivity: 'Medium',
    blurCount: 0,
    blurFemales: true,
  });

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Load initial settings
      chrome.storage.local.get(['enabled', 'sensitivity', 'blurCount', 'blurFemales'], (result) => {
        setSettings((prev) => ({
          ...prev,
          enabled: result.enabled !== undefined ? result.enabled : prev.enabled,
          sensitivity: result.sensitivity !== undefined ? result.sensitivity : prev.sensitivity,
          blurCount: result.blurCount !== undefined ? result.blurCount : prev.blurCount,
          blurFemales: result.blurFemales !== undefined ? result.blurFemales : prev.blurFemales,
        }));
      });

      // Listen for changes (e.g., blurCount incremented by background script)
      const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        setSettings((prev) => ({
          ...prev,
          enabled: changes.enabled ? changes.enabled.newValue : prev.enabled,
          sensitivity: changes.sensitivity ? changes.sensitivity.newValue : prev.sensitivity,
          blurCount: changes.blurCount ? changes.blurCount.newValue : prev.blurCount,
          blurFemales: changes.blurFemales ? changes.blurFemales.newValue : prev.blurFemales,
        }));
      };

      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setSettings((prev) => {
      const newEnabled = !prev.enabled;
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ enabled: newEnabled });
      }
      return { ...prev, enabled: newEnabled };
    });
  }, []);

  const toggleBlurFemales = useCallback(() => {
    setSettings((prev) => {
      const newBlurFemales = !prev.blurFemales;
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ blurFemales: newBlurFemales });
      }
      return { ...prev, blurFemales: newBlurFemales };
    });
  }, []);

  const changeSensitivity = useCallback((newSensitivity: string) => {
    setSettings((prev) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ sensitivity: newSensitivity });
      }
      return { ...prev, sensitivity: newSensitivity };
    });
  }, []);

  return {
    ...settings,
    toggleEnabled,
    toggleBlurFemales,
    changeSensitivity,
  };
}
