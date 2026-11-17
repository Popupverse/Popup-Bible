import { useEffect, useMemo } from "react";

import { i18n } from "@lingui/core";
import { I18nProvider, type I18nProviderProps } from "@lingui/react";

import { AppContainerContext } from "./AppContainer";
import { LocaleContext, useLocale } from "./LocaleContext";

interface AppContainerProps extends Omit<I18nProviderProps, "i18n"> {
  container: HTMLElement;
}

function AppShell({ container, ...props }: AppContainerProps) {
  const locale = useLocale();

  useEffect(() => {
    void locale.activate("en");
  }, [locale.activate]);

  return (
    <AppContainerContext value={container}>
      <I18nProvider {...props} i18n={i18n} />
    </AppContainerContext>
  );
}

interface AppProps extends AppContainerProps {}

export function App(props: AppProps) {
  const appContext = useMemo(() => ({ activate: localeActivate }), []);

  return (
    <LocaleContext value={appContext}>
      <AppShell {...props} />
    </LocaleContext>
  );
}

async function localeActivate(locale: string) {
  const { messages } = await import(`../../locales/${locale}.po`);

  i18n.load(locale, messages);
  i18n.activate(locale);
}
