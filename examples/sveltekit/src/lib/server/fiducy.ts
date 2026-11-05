import * as env from '$app/env/private';
import { fileStorage, readSessionUser, useExampleEnvironment } from '@fiducy/example-kit';
import { createFiducy } from '@fiducy/sdk/server';

useExampleEnvironment(env);

export const fiducy = createFiducy({
  env,
  storage: fileStorage(),
  getUserID: readSessionUser
});
