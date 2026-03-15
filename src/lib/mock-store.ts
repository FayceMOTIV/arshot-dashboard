/**
 * Mock product store — localStorage persistence for dev/demo mode (IS_MOCK = true).
 * Used when no Firebase / backend is configured.
 */
import type { ARModel } from "@/types";

const STORAGE_KEY = "arshot_mock_products";

function read(): ARModel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ARModel[]) : [];
  } catch {
    return [];
  }
}

function write(products: ARModel[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // localStorage quota — silently ignore
  }
}

export const mockStore = {
  getAll(): ARModel[] {
    return read();
  },

  getById(id: string): ARModel | undefined {
    return read().find((p) => p.id === id);
  },

  /** Insert or update a product (upsert). Newest first. */
  save(product: ARModel): void {
    const all = read();
    const idx = all.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      all[idx] = product;
    } else {
      all.unshift(product);
    }
    write(all);
  },

  delete(id: string): void {
    write(read().filter((p) => p.id !== id));
  },
};
