import type { OdooRecord } from "../../../lib/rest-api"

export interface DummyUser extends OdooRecord {
  name: string,
  surname: string,
  phone: string,
  email: string,
  company: string
}
