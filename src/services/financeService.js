// Serviço de dados do Finanly.
//
// Todos os métodos são ASSÍNCRONOS (retornam Promises) de propósito: assim, para trocar o
// localStorage por uma API real, basta reescrever este arquivo (por exemplo com fetch/axios).
// Nenhum componente ou hook precisa mudar.

import { initialCategories, initialGoals, initialTransactions } from '../data/mockData';
import { STORAGE_KEYS } from '../utils/constants';
import { StorageError, storage } from './storage';

// Pequena espera para simular a latência de uma API e permitir ver o estado de loading (skeleton).
const SIMULATED_LATENCY_MS = 450;
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** Lê uma coleção; na primeira execução grava os dados de exemplo. */
function readCollection(key, seed) {
  const stored = storage.get(key, null);

  if (stored === null) {
    try {
      storage.set(key, seed);
    } catch {
      // Sem persistência disponível: o app continua funcionando só em memória.
    }
    return seed;
  }

  if (!Array.isArray(stored)) {
    throw new StorageError(`Os dados de "${key}" estão em um formato inválido.`);
  }
  return stored;
}

export const financeService = {
  async loadAll() {
    await wait(SIMULATED_LATENCY_MS);
    return {
      transactions: readCollection(STORAGE_KEYS.transactions, initialTransactions),
      categories: readCollection(STORAGE_KEYS.categories, initialCategories),
      goals: readCollection(STORAGE_KEYS.goals, initialGoals),
    };
  },

  /** Salva uma coleção inteira: "transactions" | "categories" | "goals". */
  async save(collection, items) {
    storage.set(STORAGE_KEYS[collection], items);
  },

  /** Restaura os dados de demonstração. */
  async resetToDemo() {
    storage.set(STORAGE_KEYS.transactions, initialTransactions);
    storage.set(STORAGE_KEYS.categories, initialCategories);
    storage.set(STORAGE_KEYS.goals, initialGoals);
    return { transactions: initialTransactions, categories: initialCategories, goals: initialGoals };
  },
};
