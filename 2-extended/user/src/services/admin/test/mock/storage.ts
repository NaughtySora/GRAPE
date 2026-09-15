import { SharedUserRepository } from "@/storage/repositories/ShareUserRepository";
import test from "@/utils/test";

class MockPublicUserRepository implements SharedUserRepository {
  storage = new Map();
  //@ts-ignore
  address = new Map();

  async create({ email, hash }: { hash: string, email: string }) {
    const id = test.random.uuid();
    const date = new Date();
    this.storage.set(id, {
      id, hash, email,
      createAt: date, updated: date
    });
    return id;
  }

  private search(where: any, values = this.storage.values()) {
    const entries = Object.entries(where);
    for (const item of values) {
      let hit = entries.length;
      for (const entry of entries) {
        if (item[entry[0]] === entry[1]) hit--;
      }
      if (hit === 0) return item;
    }
    return null;
  }

  async hash(where: any) {
    const entry = this.search(where);
    if (entry === null) return null;
    return { id: entry.id, hash: entry.hash };
  }

  async exists(where: any) {
    const entry = this.search(where);
    if (entry === null) return false;
    return true;
  }
}

export default {
  MockPublicUserRepository,
};