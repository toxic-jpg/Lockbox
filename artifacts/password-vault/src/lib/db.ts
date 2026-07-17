import Dexie, { type Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import { generatePassword, getStrength } from './crypto';

export interface VaultEntry {
  id: string;
  title: string;
  username?: string;
  email?: string;
  password?: string;
  notes?: string;
  url?: string;
  icon?: string;
  categoryId?: string;
  folderId?: string;
  tags: string[];
  color?: string;
  isFavorite: boolean;
  isImportant: boolean;
  twoFactorEnabled: boolean;
  strength?: number;
  passwordHistory: { password: string; changedAt: number }[];
  customFields: { id: string; label: string; value: string; hidden: boolean }[];
  createdAt: number;
  updatedAt: number;
  lastUsed?: number;
  expiresAt?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
  priority: number;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  count?: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
}

export interface AuditLog {
  id: string;
  entryId: string;
  action: 'view' | 'copy' | 'edit' | 'generate';
  timestamp: number;
}

export class VaultDatabase extends Dexie {
  entries!: Table<VaultEntry, string>;
  tags!: Table<Tag, string>;
  categories!: Table<Category, string>;
  folders!: Table<Folder, string>;
  auditLog!: Table<AuditLog, string>;

  constructor() {
    super('VaultDatabase');
    
    this.version(1).stores({
      entries: 'id, title, categoryId, folderId, *tags, isFavorite, strength, lastUsed',
      tags: 'id, name, priority',
      categories: 'id, name',
      folders: 'id, parentId',
      auditLog: 'id, entryId, timestamp'
    });

    this.on('populate', async () => {
      await this.populateDefaultData();
    });
  }

  async populateDefaultData() {
    const defaultCategories: Category[] = [
      { id: uuidv4(), name: 'Banking', icon: '🏦', color: 'rose' },
      { id: uuidv4(), name: 'Social Media', icon: '📱', color: 'sky' },
      { id: uuidv4(), name: 'Gaming', icon: '🎮', color: 'violet' },
      { id: uuidv4(), name: 'Education', icon: '🎓', color: 'amber' },
      { id: uuidv4(), name: 'Work', icon: '💼', color: 'indigo' },
      { id: uuidv4(), name: 'Servers', icon: '🖥️', color: 'lime' },
      { id: uuidv4(), name: 'Streaming', icon: '🎬', color: 'rose' },
      { id: uuidv4(), name: 'Shopping', icon: '🛒', color: 'fuchsia' },
      { id: uuidv4(), name: 'Crypto', icon: '₿', color: 'amber' },
      { id: uuidv4(), name: 'Email', icon: '📧', color: 'emerald' },
      { id: uuidv4(), name: 'Medical', icon: '🏥', color: 'rose' },
      { id: uuidv4(), name: 'Travel', icon: '✈️', color: 'sky' },
      { id: uuidv4(), name: 'Utilities', icon: '🔧', color: 'default' },
      { id: uuidv4(), name: 'Cloud Storage', icon: '☁️', color: 'indigo' },
      { id: uuidv4(), name: 'Personal', icon: '👤', color: 'default' }
    ];

    const defaultTags: Tag[] = [
      { id: uuidv4(), name: 'Critical', icon: '🔴', color: 'rose', priority: 1 },
      { id: uuidv4(), name: 'Very Important', icon: '⭐', color: 'amber', priority: 2 },
      { id: uuidv4(), name: 'Super Important', icon: '🔒', color: 'indigo', priority: 3 },
      { id: uuidv4(), name: 'Banking', icon: '💳', color: 'emerald', priority: 4 },
      { id: uuidv4(), name: 'Gaming', icon: '🎮', color: 'violet', priority: 5 },
      { id: uuidv4(), name: 'Developer', icon: '💻', color: 'default', priority: 6 },
      { id: uuidv4(), name: 'Archived', icon: '🗄️', color: 'muted', priority: 99 }
    ];

    await this.categories.bulkAdd(defaultCategories);
    await this.tags.bulkAdd(defaultTags);

    // Create some sample entries
    const now = Date.now();
    const pw1 = generatePassword({ length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true });
    const pw2 = generatePassword({ length: 18, uppercase: true, lowercase: true, numbers: true, symbols: true });
    
    const sampleEntries: VaultEntry[] = [
      {
        id: uuidv4(),
        title: 'GitHub',
        username: 'developer123',
        email: 'dev@example.com',
        password: pw1,
        url: 'https://github.com',
        icon: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
        categoryId: defaultCategories.find(c => c.name === 'Work')?.id,
        tags: [defaultTags.find(t => t.name === 'Developer')?.id!].filter(Boolean),
        color: 'emerald',
        isFavorite: true,
        isImportant: true,
        twoFactorEnabled: true,
        strength: getStrength(pw1).score,
        passwordHistory: [{ password: pw1, changedAt: now }],
        customFields: [],
        createdAt: now - 10000000,
        updatedAt: now - 500000,
        lastUsed: now - 10000
      },
      {
        id: uuidv4(),
        title: 'Gmail',
        email: 'personal@gmail.com',
        password: pw2,
        url: 'https://mail.google.com',
        icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64',
        categoryId: defaultCategories.find(c => c.name === 'Email')?.id,
        tags: [defaultTags.find(t => t.name === 'Very Important')?.id!].filter(Boolean),
        color: 'sky',
        isFavorite: true,
        isImportant: false,
        twoFactorEnabled: true,
        strength: getStrength(pw2).score,
        passwordHistory: [{ password: pw2, changedAt: now }],
        customFields: [],
        createdAt: now - 20000000,
        updatedAt: now - 1000000,
        lastUsed: now - 5000
      },
      {
        id: uuidv4(),
        title: 'Discord',
        username: 'gamerdude',
        email: 'gaming@example.com',
        password: generatePassword({ length: 16, uppercase: true, lowercase: true, numbers: true, symbols: false }),
        url: 'https://discord.com',
        icon: 'https://www.google.com/s2/favicons?domain=discord.com&sz=64',
        categoryId: defaultCategories.find(c => c.name === 'Gaming')?.id,
        tags: [defaultTags.find(t => t.name === 'Gaming')?.id!].filter(Boolean),
        color: 'violet',
        isFavorite: false,
        isImportant: false,
        twoFactorEnabled: false,
        strength: 3,
        passwordHistory: [],
        customFields: [],
        createdAt: now - 5000000,
        updatedAt: now - 5000000,
      }
    ];

    await this.entries.bulkAdd(sampleEntries);
  }
}

export const db = new VaultDatabase();
