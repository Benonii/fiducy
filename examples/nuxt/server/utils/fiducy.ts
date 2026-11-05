import { fileStorage, readSessionUser } from '@fiducy/example-kit';
import { createFiducy } from '@fiducy/sdk/server';

export const fiducy = createFiducy({
  storage: fileStorage(),
  getUserID: readSessionUser
});
