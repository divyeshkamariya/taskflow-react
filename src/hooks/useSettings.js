import { useCallback, useState } from "react";
import { loadSettings, saveSettings } from "../utils/storage";

// Small user preferences (display name) saved in localStorage
export default function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  const updateSettings = useCallback((changes) => {
    setSettings((prev) => {
      const next = { ...prev, ...changes };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
