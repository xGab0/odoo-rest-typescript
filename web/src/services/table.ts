import type { OdooRecord } from "../../../lib/rest-api";
import type { DummyUser } from "./dummy";

export interface Table<T extends OdooRecord> {
  records: T[]
}
