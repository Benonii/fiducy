import { fileStorage, readSessionUser } from '@fiducy/example-kit';
import { createFiducy } from '@fiducy/sdk/server';

export const fiducyServer = createFiducy({
  storage: fileStorage(),
  getUserID: readSessionUser
});
