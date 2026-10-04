import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Product,
  Warehouse,
  Operation,
  StockLedgerEntry,
  ProductCategory,
  User
} from '../../src/types/inventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_OPERATIONS,
  INITIAL_LEDGER,
  INITIAL_CATEGORIES,
  INITIAL_USERS
} from '../../src/data/initialData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, 'stocksense.sqlite');

class SQLiteDataStore {
  private sqlDb: Database | null = null;
  public products: Product[] = [];
  public warehouses: Warehouse[] = [];
  public operations: Operation[] = [];
  public ledger: StockLedgerEntry[] = [];
  public categories: ProductCategory[] = [];
  public users: User[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const SQL = await initSqlJs();
      const dbExists = fs.existsSync(DB_PATH);

      if (dbExists) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        this.sqlDb = new SQL.Database(fileBuffer);
        this.loadFromSQLite();
        console.log('[SQLite DataStore] Loaded persistent database from disk.');
      } else {
        this.sqlDb = new SQL.Database();
        this.createTables();
        this.seedInitialData();
        this.persistToDisk();
        console.log('[SQLite DataStore] Initialized new persistent SQLite database and seeded initial data.');
      }
      this.isInitialized = true;
    } catch (err) {
      console.error('[SQLite DataStore] Error initializing SQLite data store:', err);
      // Fallback in-memory seeding
      this.products = [...INITIAL_PRODUCTS];
      this.warehouses = [...INITIAL_WAREHOUSES];
      this.operations = [...INITIAL_OPERATIONS];
      this.ledger = [...INITIAL_LEDGER];
      this.categories = [...INITIAL_CATEGORIES];
      this.users = [...INITIAL_USERS];
    }
  }

  private createTables() {
    if (!this.sqlDb) return;
    this.sqlDb.run(`
      CREATE TABLE IF NOT EXISTS kv_store (
        collection_key TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  private seedInitialData() {
    this.products = [...INITIAL_PRODUCTS];
    this.warehouses = [...INITIAL_WAREHOUSES];
    this.operations = [...INITIAL_OPERATIONS];
    this.ledger = [...INITIAL_LEDGER];
    this.categories = [...INITIAL_CATEGORIES];
    this.users = [...INITIAL_USERS];
    this.save();
  }

  private loadFromSQLite() {
    if (!this.sqlDb) return;
    try {
      const result = this.sqlDb.exec('SELECT collection_key, payload FROM kv_store');
      if (result.length > 0 && result[0].values) {
        for (const row of result[0].values) {
          const key = row[0] as string;
          const payloadStr = row[1] as string;
          const data = JSON.parse(payloadStr);

          if (key === 'products') this.products = data;
          else if (key === 'warehouses') this.warehouses = data;
          else if (key === 'operations') this.operations = data;
          else if (key === 'ledger') this.ledger = data;
          else if (key === 'categories') this.categories = data;
          else if (key === 'users') {
            this.users = (data as User[]).map(u => ({
              ...u,
              passwordHash: u.passwordHash || '$2b$10$3.G4ym.Ux/BSiwUY2bLDCehPkBtST/7F0fgj8HW/23AV0k68ju5u6'
            }));
          }
        }
      }
      // Ensure defaults if any collection is empty
      if (!this.products.length) this.products = [...INITIAL_PRODUCTS];
      if (!this.warehouses.length) this.warehouses = [...INITIAL_WAREHOUSES];
      if (!this.operations.length) this.operations = [...INITIAL_OPERATIONS];
      if (!this.ledger.length) this.ledger = [...INITIAL_LEDGER];
      if (!this.categories.length) this.categories = [...INITIAL_CATEGORIES];
      if (!this.users.length) this.users = [...INITIAL_USERS];
    } catch (err) {
      console.error('[SQLite DataStore] Failed to parse SQLite payload:', err);
    }
  }

  public save() {
    if (!this.sqlDb) return;
    const nowIso = new Date().toISOString();
    const collections = [
      { key: 'products', data: this.products },
      { key: 'warehouses', data: this.warehouses },
      { key: 'operations', data: this.operations },
      { key: 'ledger', data: this.ledger },
      { key: 'categories', data: this.categories },
      { key: 'users', data: this.users }
    ];

    try {
      for (const col of collections) {
        this.sqlDb.run(
          `INSERT OR REPLACE INTO kv_store (collection_key, payload, updated_at) VALUES (?, ?, ?);`,
          [col.key, JSON.stringify(col.data), nowIso]
        );
      }
      this.persistToDisk();
    } catch (err) {
      console.error('[SQLite DataStore] Error saving to SQLite database:', err);
    }
  }

  private persistToDisk() {
    if (!this.sqlDb) return;
    try {
      const data = this.sqlDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATH, buffer);
    } catch (err) {
      console.error('[SQLite DataStore] Failed to write database to disk:', err);
    }
  }

  public resetToDefault() {
    this.seedInitialData();
  }
}

export const db = new SQLiteDataStore();
