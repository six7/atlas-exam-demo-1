export interface PrototypeEntry {
  id: string;
  name: string;
  author: string;
  description: string;
  createdAt: string;
}

export interface Registry {
  prototypes: PrototypeEntry[];
}
