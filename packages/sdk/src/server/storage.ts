import type { GatewayProvider } from '../types';
import type { FiducyStorage, KeyValueDriver, StoredUserKey } from './types';

const KEY_PREFIX = 'fiducy';

function lastSegment(key: string): string {
  return key.split(':').at(-1) ?? key;
}

export function memoryStorage(): FiducyStorage {
  const keys = new Map<string, StoredUserKey>();
  const userKeys = (userID: string) => [...keys.values()].filter((key) => key.userID === userID);
  return {
    saveKey: async (key) => {
      keys.set(key.keyID, structuredClone(key));
    },
    findKey: async (userID, provider) =>
      userKeys(userID).find((key) => key.provider === provider) ?? null,
    listKeys: async (userID) => userKeys(userID),
    deleteKey: async (userID, keyID) => {
      if (keys.get(keyID)?.userID !== userID) return false;
      return keys.delete(keyID);
    }
  };
}

/** Backs Fiducy with any unstorage-style driver, such as a Farm.js storage mount. */
export function keyValueStorage(driver: KeyValueDriver): FiducyStorage {
  const itemKey = (userID: string, keyID: string) => `${KEY_PREFIX}:${userID}:${keyID}`;

  const listKeys = async (userID: string) => {
    const itemKeys = await driver.getKeys(`${KEY_PREFIX}:${userID}`);
    const items = await Promise.all(
      itemKeys.map((key) => driver.getItem(itemKey(userID, lastSegment(key))))
    );
    return items.filter((item): item is StoredUserKey => item !== null && item !== undefined);
  };

  return {
    saveKey: (key) => driver.setItem(itemKey(key.userID, key.keyID), key),
    findKey: async (userID: string, provider: GatewayProvider) =>
      (await listKeys(userID)).find((key) => key.provider === provider) ?? null,
    listKeys,
    deleteKey: async (userID, keyID) => {
      const key = itemKey(userID, keyID);
      if (!(await driver.getItem(key))) return false;
      await driver.removeItem(key);
      return true;
    }
  };
}
