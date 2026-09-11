import test from "@/utils/test";
import { PublicUserRepository } from "../../storage/repositories/PublicUserRepository";
//@ts-ignore
class MockPublicUserRepository implements PublicUserRepository {
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

  async upsertAddress(id: string, address: any) {
    const addr = this.address.get(id);
    if (addr) {
      const data = Object.assign({}, addr, address);
      this.address.set(id, data);
      return data;
    }
    this.address.set(id, address);
    return address;
  }

  async updateProfile(id: string, profile: any) {
    const user = this.storage.get(id);
    if (!user) throw new Error('User doesn\'t exist');
    const data = Object.assign({}, user, profile);
    this.storage.set(id, data);
    return data;
  }

  async profile(where: any) {
    const user = this.search(where);
    if (!user) return null;
    const addr = this.search(where, this.address.values());
    return Object.assign({}, addr, user);
  }

}

export default {
  MockPublicUserRepository
}