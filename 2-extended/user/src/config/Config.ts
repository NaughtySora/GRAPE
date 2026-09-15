export class Config<T> {
  constructor(private readonly proto: T) { }

  get<K extends keyof T>(key: K): T[K] {
    return this.proto[key];
  }
}
