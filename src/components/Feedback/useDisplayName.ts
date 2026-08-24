"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "atlas.feedback.display-name";

/** Fired on same-tab writes; the `storage` event only covers other tabs. */
const CHANGE_EVENT = "atlas:display-name-change";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readName(): string | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && stored.trim() ? stored.trim() : null;
  } catch {
    // Private mode / storage disabled — behave as if no name is set.
    return null;
  }
}

/** localStorage does not exist during server render. */
function serverName(): null {
  return null;
}

const neverChanges = () => () => {};

/**
 * True only after hydration. Lets callers hold off on rendering anything that
 * depends on localStorage until its value is actually readable, instead of
 * flashing the "what should we call you?" prompt at someone who already
 * answered it.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false
  );
}

/**
 * The commenter's display name, asked for once and remembered in
 * localStorage. `null` while unknown — the overlay shows a name prompt then.
 *
 * Backed by `useSyncExternalStore` rather than an effect, so every tab and
 * every mounted overlay stays in sync off a single source of truth.
 */
export function useDisplayName() {
  const name = useSyncExternalStore(subscribe, readName, serverName);
  const ready = useHydrated();

  const save = useCallback((value: string) => {
    const trimmed = value.trim().slice(0, 80);
    if (!trimmed) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
    } catch {
      // Not fatal, but without storage there is nothing to notify about.
      return;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { name, ready, save, clear };
}
