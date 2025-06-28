import type en from '../locales/en/common.json';
import type enErrors from '../locales/en/errors.json';
import type enSettings from '../locales/en/settings.json';

type Messages = {
  common: typeof en;
  errors: typeof enErrors;
  settings: typeof enSettings;
};

declare global {
  // Use type safe message keys with `next-intl`
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}

export {};
