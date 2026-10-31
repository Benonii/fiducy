import { DeleteItemCommand, DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { FetchHttpHandler } from '@smithy/fetch-http-handler';

import { IMDS_ROLE_PATH, IMDS_TOKEN_PATH, IMDS_TOKEN_TTL_SECONDS, IMDS_URL } from './constants';
import { SEALED_RECORD_FIELDS } from './constants';

import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import type { SealedRecord } from '@fiducy/core';
import type { DynamoKeyStoreOptions, DynamoSender, InstanceRoleCredentials } from './types';
import type { KeyStore } from './types';

function toItem(record: SealedRecord): Record<string, AttributeValue> {
  return Object.fromEntries(SEALED_RECORD_FIELDS.map((field) => [field, { S: record[field] }]));
}

function fromItem(item: Record<string, AttributeValue> | undefined): SealedRecord | null {
  if (!item) return null;
  const entries = SEALED_RECORD_FIELDS.map((field) => [field, item[field]?.S]);
  if (entries.some(([, value]) => typeof value !== 'string')) return null;
  return Object.fromEntries(entries) as SealedRecord;
}

async function readIMDS(path: string, token: string): Promise<string> {
  const response = await fetch(`${IMDS_URL}${path}`, {
    headers: { 'x-aws-ec2-metadata-token': token }
  });
  if (!response.ok) throw new Error(`Instance metadata answered ${response.status} for ${path}`);
  return response.text();
}

export async function readInstanceRoleCredentials(): Promise<InstanceRoleCredentials> {
  const tokenResponse = await fetch(`${IMDS_URL}${IMDS_TOKEN_PATH}`, {
    method: 'PUT',
    headers: { 'x-aws-ec2-metadata-token-ttl-seconds': String(IMDS_TOKEN_TTL_SECONDS) }
  });
  if (!tokenResponse.ok)
    throw new Error(`Instance metadata refused a token: ${tokenResponse.status}`);
  const token = await tokenResponse.text();
  const roleName = (await readIMDS(IMDS_ROLE_PATH, token)).trim();
  const role = JSON.parse(await readIMDS(`${IMDS_ROLE_PATH}${roleName}`, token));
  return {
    accessKeyId: role.AccessKeyId,
    secretAccessKey: role.SecretAccessKey,
    sessionToken: role.Token,
    expiration: new Date(role.Expiration)
  };
}

export function createDynamoClient(region: string, endpoint?: string): DynamoSender {
  return new DynamoDBClient({
    region,
    endpoint,
    credentials: readInstanceRoleCredentials,
    requestHandler: new FetchHttpHandler()
  });
}

export function createDynamoKeyStore({ client, tableName }: DynamoKeyStoreOptions): KeyStore {
  const keyOf = (keyID: string) => ({ keyID: { S: keyID } });
  return {
    saveRecord: async (record) => {
      await client.send(
        new PutItemCommand({
          TableName: tableName,
          Item: toItem(record),
          ConditionExpression: 'attribute_not_exists(keyID)'
        })
      );
    },
    findRecord: async (keyID) => {
      const output = await client.send(
        new GetItemCommand({ TableName: tableName, Key: keyOf(keyID), ConsistentRead: true })
      );
      return fromItem(output.Item);
    },
    deleteRecord: async (keyID) => {
      const output = await client.send(
        new DeleteItemCommand({ TableName: tableName, Key: keyOf(keyID), ReturnValues: 'ALL_OLD' })
      );
      return output.Attributes !== undefined;
    }
  };
}
