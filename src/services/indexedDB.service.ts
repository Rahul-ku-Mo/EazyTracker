interface CardDescriptionData {
  cardId: number;
  description: string;
  lastModified: number;
}

interface ProjectDescriptionData {
  projectSlug: string;
  description: string;
  lastModified: number;
}

class IndexedDBService {
  private dbName = 'PulseBoardDB';
  private version = 2;
  private cardStoreName = 'cardDescriptions';
  private projectStoreName = 'projectDescriptions';
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for card descriptions
        if (!db.objectStoreNames.contains(this.cardStoreName)) {
          const cardStore = db.createObjectStore(this.cardStoreName, { keyPath: 'cardId' });
          cardStore.createIndex('lastModified', 'lastModified', { unique: false });
        }
        
        // Create object store for project descriptions
        if (!db.objectStoreNames.contains(this.projectStoreName)) {
          const projectStore = db.createObjectStore(this.projectStoreName, { keyPath: 'projectSlug' });
          projectStore.createIndex('lastModified', 'lastModified', { unique: false });
        }
      };
    });
  }

  async saveCardDescription(cardId: number, description: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.cardStoreName], 'readwrite');
      const store = transaction.objectStore(this.cardStoreName);
      
      const data: CardDescriptionData = {
        cardId,
        description,
        lastModified: Date.now()
      };

      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save card description'));
    });
  }

  async getCardDescription(cardId: number): Promise<string | null> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.cardStoreName], 'readonly');
      const store = transaction.objectStore(this.cardStoreName);
      const request = store.get(cardId);

      request.onsuccess = () => {
        const data = request.result as CardDescriptionData | undefined;
        resolve(data ? data.description : null);
      };

      request.onerror = () => reject(new Error('Failed to get card description'));
    });
  }

  async deleteCardDescription(cardId: number): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.cardStoreName], 'readwrite');
      const store = transaction.objectStore(this.cardStoreName);
      const request = store.delete(cardId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete card description'));
    });
  }

  async getAllCardDescriptions(): Promise<CardDescriptionData[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.cardStoreName], 'readonly');
      const store = transaction.objectStore(this.cardStoreName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as CardDescriptionData[]);
      };

      request.onerror = () => reject(new Error('Failed to get all card descriptions'));
    });
  }

  async clearAllData(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.cardStoreName], 'readwrite');
      const store = transaction.objectStore(this.cardStoreName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear all data'));
    });
  }

  // Project Description Methods
  async saveProjectDescription(projectSlug: string, description: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.projectStoreName], 'readwrite');
      const store = transaction.objectStore(this.projectStoreName);
      
      const data: ProjectDescriptionData = {
        projectSlug,
        description,
        lastModified: Date.now()
      };

      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save project description'));
    });
  }

  async getProjectDescription(projectSlug: string): Promise<string | null> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.projectStoreName], 'readonly');
      const store = transaction.objectStore(this.projectStoreName);
      const request = store.get(projectSlug);

      request.onsuccess = () => {
        const data = request.result as ProjectDescriptionData | undefined;
        resolve(data ? data.description : null);
      };

      request.onerror = () => reject(new Error('Failed to get project description'));
    });
  }

  async deleteProjectDescription(projectSlug: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.projectStoreName], 'readwrite');
      const store = transaction.objectStore(this.projectStoreName);
      const request = store.delete(projectSlug);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete project description'));
    });
  }

  async getAllProjectDescriptions(): Promise<ProjectDescriptionData[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.projectStoreName], 'readonly');
      const store = transaction.objectStore(this.projectStoreName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as ProjectDescriptionData[]);
      };

      request.onerror = () => reject(new Error('Failed to get all project descriptions'));
    });
  }

  async clearAllProjectData(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.projectStoreName], 'readwrite');
      const store = transaction.objectStore(this.projectStoreName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear all project data'));
    });
  }
}

// Create a singleton instance
export const indexedDBService = new IndexedDBService(); 