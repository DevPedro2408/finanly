// Camada única de acesso ao localStorage.
// Nenhum outro arquivo do projeto deve chamar localStorage.getItem/setItem diretamente.

const PREFIX = 'finanly:';

export class StorageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StorageError';
  }
}

export const storage = {
  /** Lê e converte o valor salvo. Retorna `fallback` se não existir. */
  get(key, fallback = null) {
    let raw;
    try {
      raw = window.localStorage.getItem(PREFIX + key);
    } catch {
      return fallback; // localStorage bloqueado (ex.: modo privado restrito)
    }
    if (raw === null) return fallback;

    try {
      return JSON.parse(raw);
    } catch {
      throw new StorageError(`Os dados salvos em "${key}" estão corrompidos.`);
    }
  },

  /** Salva um valor (convertido para JSON). Lança StorageError se não for possível. */
  set(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      throw new StorageError('Não foi possível salvar os dados neste navegador. Verifique o espaço e as permissões.');
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      /* nada a fazer */
    }
  },
};
