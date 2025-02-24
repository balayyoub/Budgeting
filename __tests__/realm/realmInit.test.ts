import Realm from 'realm';
import { Transaction } from '../../models/Transaction';
import { Category } from '../../models/Category';
import { Account } from '../../models/Account';

describe('Realm Database Initialization', () => {
  let realm: Realm;

  beforeAll(() => {
    // Create an in-memory Realm for testing
    realm = new Realm({
      schema: [Transaction, Category, Account],
      inMemory: true,         // Important: ephemeral, does not persist
      path: 'testRealm',      // Arbitrary path
      schemaVersion: 1,
    });
  });

  afterAll(() => {
    realm.close();

  });

  it('should initialize Realm without errors', () => {
    expect(realm).toBeDefined();
    expect(realm.isClosed).toBe(false);
  });
});
