import type { OdooModel } from "../../../lib/rest-api";

export interface DummyUser extends OdooModel {
  name: string,
  surname: string,
  phone: string,
  email: string,
  company: string
}
