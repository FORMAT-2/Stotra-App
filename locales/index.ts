import { useSettingsStore, Language } from '../store/settingsStore';
import { en } from './en';
import { hi } from './hi';
import { sa } from './sa';

const dictionaries: Record<Language, typeof en> = {
  english: en,
  hindi: hi,
  sanskrit: sa,
};

export function useTranslation() {
  const language = useSettingsStore((state) => state.language);
  const dict = dictionaries[language] || dictionaries.english;

  const t = (key: keyof typeof en): string => {
    return dict[key] || en[key] || key;
  };

  return { t, language };
}
