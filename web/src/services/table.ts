import type { DummyUser } from "./dummy";

export interface Table {
  rows: Row<any>[]
}

export interface Row<T> {
  value: T
}
