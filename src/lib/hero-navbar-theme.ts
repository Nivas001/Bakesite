import { useSyncExternalStore } from "react";

export interface HeroThemeState {
  inHero: boolean;
  bgColor: string | null;
  textColor: string | null;
  accentColor: string | null;
}

let currentState: HeroThemeState = {
  inHero: false,
  bgColor: null,
  textColor: null,
  accentColor: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function setHeroTheme(newState: Partial<HeroThemeState>) {
  const updated: HeroThemeState = {
    ...currentState,
    ...newState,
  };

  if (
    updated.inHero !== currentState.inHero ||
    updated.bgColor !== currentState.bgColor ||
    updated.textColor !== currentState.textColor ||
    updated.accentColor !== currentState.accentColor
  ) {
    currentState = updated;
    notify();
  }
}

export function resetHeroTheme() {
  if (currentState.inHero || currentState.bgColor !== null) {
    currentState = {
      inHero: false,
      bgColor: null,
      textColor: null,
      accentColor: null,
    };
    notify();
  }
}

export function useHeroNavbarTheme(): HeroThemeState {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => currentState,
    () => currentState
  );
}
