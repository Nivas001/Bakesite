import { useSyncExternalStore } from "react";

export interface HeroThemeState {
  inHero: boolean;
  bgColor: string | null;
  textColor: string | null;
  accentColor: string | null;
  dotColor: string | null;
  btnBg: string | null;
  btnText: string | null;
}

const getInitialState = (): HeroThemeState => {
  if (
    typeof window !== "undefined" &&
    (window.location.pathname === "/" || window.location.pathname === "")
  ) {
    return {
      inHero: true,
      bgColor: "#F5C2CD",
      textColor: "#3A1018",
      accentColor: "#9B112D",
      dotColor: "#C41E3A",
      btnBg: "#C41E3A",
      btnText: "#ffffff",
    };
  }
  return {
    inHero: false,
    bgColor: null,
    textColor: null,
    accentColor: null,
    dotColor: null,
    btnBg: null,
    btnText: null,
  };
};

let currentState: HeroThemeState = getInitialState();

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
    updated.accentColor !== currentState.accentColor ||
    updated.dotColor !== currentState.dotColor ||
    updated.btnBg !== currentState.btnBg ||
    updated.btnText !== currentState.btnText
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
      dotColor: null,
      btnBg: null,
      btnText: null,
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
