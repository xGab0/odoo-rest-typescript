/*

odoo.exceptions.AccessDenied: Access Denied
{
  "message": "Access Denied",
  "name": "odoo.exceptions.AccessDenied"
},
"message": "Odoo Server Error"
},
"id": 1,
"jsonrpc": "2.0"
}

// STATUS CODE 200 - Access Denied
// STATUS CODE 188 - Unable to authenticate

*/

import axios, { AxiosInstance } from "axios";

const DEBUG: boolean = true;

export type ServerVersionInfo = [number, number, number, string, number, string];
export type OdooRecordSyntax = { [key: string]: any };
export type LogicType = '>=' | '<=' | '=' | '!=' | 'ilike';
export type LogicFilter = [string, LogicType, any];
export type FieldsFilter = string[] | ['*'];
export type OdooUid = {
  id: number,
  name: string
}

export class OdooConnection {
  public readonly host: string;
  public readonly client: AxiosInstance;
  public readonly serverVersion: string;
  public readonly serverVersionInfo: ServerVersionInfo;
  public readonly serverSerie: string;
  public readonly protocolVersion: number;

  public constructor(
    host: string,
    client: AxiosInstance,
    serverVersion: string,
    serverVersionInfo: ServerVersionInfo,
    serverSerie: string,
    protocolVersion: number
  ) {
    this.host = host;
    this.client = client;
    this.serverVersion = serverVersion;
    this.serverVersionInfo = serverVersionInfo;
    this.serverSerie = serverSerie;
    this.protocolVersion = protocolVersion;
  }

  async login(database: string, username: string, password: string): Promise<OdooUser> {
    const params = {
      'service': 'common',
      'method': 'login',
      'args': [
        database,
        username,
        password
      ]
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    try {
      const response = await this.client.post('', payload);

      if (response.data.error) {
        throw new Error(`Error: ${response.data.error.message}`);
      }

      const uid = response.data.result;
      return new OdooUser(this, database, uid, username, password)
      //return response.data.result;
    } catch (error: any) {
      console.error('Error while connecting to Odoo server:', error);
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  static async connect(host: string): Promise<OdooConnection> {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'common',
        method: 'version',
        args: [],
      },
      id: 1
    };

    try {
      const response = await axios.post(host, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.error) {
        throw new Error(`Error: ${response.data.error.message}`);
      }

      const result = response.data.result;

      //console.log('Connected to Odoo successfully!');
      //console.log(result);

      const client: AxiosInstance = axios.create({
        baseURL: host,
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return new OdooConnection(
        host,
        client,
        result.server_version,
        result.server_version_info,
        result.server_serie,
        result.protocol_version
      );
    } catch (error: any) {
      console.error('Error while connecting to Odoo server:', error);
      throw new Error(`Connection failed: ${error.message}`);
    }
  }
}

export interface OdooRecord {

}

export class OdooUser {
  public readonly connection: OdooConnection;
  public readonly database: string;
  public readonly uid: number;
  public readonly username: string;
  public readonly password: string;

  public constructor(connection: OdooConnection, database: string, uid: number, username: string, password: string) {
    this.connection = connection;
    this.database = database;
    this.uid = uid;
    this.username = username;
    this.password = password;
  }

  public modelQueryBuilder<T>(modelName: string): ModelQueryBuilder<T> {
    return new ModelQueryBuilder<T>(this, modelName);
  }

  public async createRecord(modelName: string, record: OdooRecordSyntax): Promise<number[]> {
    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.database,
        this.uid,
        this.password,
        modelName,
        'create',
        [record],
      ],
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.connection.client.post('', payload)

    return response.data.result;
  }

  public async createRecords(modelName: string, records: OdooRecordSyntax[]): Promise<number[]> {
    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.database,
        this.uid,
        this.password,
        modelName,
        'create',
        records,
      ],
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.connection.client.post('', payload)

    return response.data.result;
  }

  public async writeRecords(modelName: string, recordsId: number[], body: OdooRecordSyntax): Promise<number[]> {
    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.database,
        this.uid,
        this.password,
        modelName,
        'write',
        [
          recordsId,
          body
        ],
      ],
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.connection.client.post('', payload)

    return response.data.result;
  }

  public async multiWriteRecords(modelName: string, records: [number, OdooRecordSyntax][]): Promise<number[]> {
    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.database,
        this.uid,
        this.password,
        modelName,
        'write',
        records
      ],
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.connection.client.post('', payload)

    return response.data.result;
  }

  /**
  * Get the list of records ids
  *
  * @param {string} modelName - The name of the registered Model
  * @param {LogicFilter[]} [andFilters="[]"] - The filters for the AND logic
  * @param {LogicFilter[]} [orFilters="[]"] - The filters for the OR logic
  * @param {FieldsFilter} [fields] - The filter for the fields you want to retrieve
  * @param {number} limit - The max number of records to be retrieved
  * @returns {Promise<number[]>} The ids of founds arrays
  */
  public async searchRecords(
    modelName: string,
    andFilters: LogicFilter[] = [],
    orFilters: LogicFilter[] = [],
    fields?: FieldsFilter,
    limit?: number
  ): Promise<number[]> {
    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.database,
        this.uid,
        this.password,
        modelName,
        'search',
        [andFilters, orFilters],
        {
          fields,
          limit
        }
      ],
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.connection.client.post('', payload)

    return response.data.result;
  }

  /**
  * Get the list of records and their content
  *
  * @param {string} modelName - The name of the registered Model
  * @param {LogicFilter[]} [andFilters="[]"] - The filters for the AND logic
  * @param {LogicFilter[]} [orFilters="[]"] - The filters for the OR logic
  * @param {FieldsFilter} [fields] - The filter for the fields you want to retrieve
  * @param {number} limit - The max number of records to be retrieved
  * @returns {OdooRecord[]} List of the records
  */
  public async searchReadRecord(
    modelName: string,
    andFilters: LogicFilter[] = [],
    orFilters: LogicFilter[] = [],
    fields?: FieldsFilter,
    limit?: number
  ): Promise<OdooRecord[]> {
    // Combina i filtri AND e OR
    const filters = [
      ...andFilters, // I filtri AND
      ...(orFilters.length > 0 ? [orFilters] : []), // Aggiungi i filtri OR se presenti
    ];

    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.database,
        this.uid,
        this.password,
        modelName,
        'search_read',
        [
          andFilters,
        ],
        {
          fields,
          limit,
        }

        /*
        [
          [
            ['check_in', '>=', `${formattedDate} 00:00:00`],
            //['check_out', '<=', `${formattedDate} 23:59:59`],
          ],
        ],
        {
          fields: [
            'id',
            'employee_id',
            'department_id',
            'check_in',
            'check_out'
          ],
          limit: 100
        }, // Campi da recuperare
        */
      ]
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.connection.client.post('', payload)

    return response.data.result;
  }
}

export class ModelQueryBuilder<T> {
  public readonly user: OdooUser;
  public readonly modelName: string;

  public constructor(user: OdooUser, modelName: string) {
    this.user = user;
    this.modelName = modelName;
  }

  public async createRecord(body: OdooRecordSyntax): Promise<number> {
    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.user.database,
        this.user.uid,
        this.user.password,
        this.modelName,
        'create',
        [body],
      ],
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.user.connection.client.post('', payload);

    if (DEBUG) {
      console.log(response.data);
      console.log(`
        ModelQueryBuilder | createRecord
        - user: ${this.user.uid}
        - password: ${this.user.password}
        - record_id: ${response.data.result}
        - record_body: ${JSON.stringify(body)}
      `);
    }

    return response.data.result;
  }

  public async createRecords(records: OdooRecordSyntax[]): Promise<number[]> {
    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.user.database,
        this.user.uid,
        this.user.password,
        this.modelName,
        'create',
        records,
      ],
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.user.connection.client.post('', payload)

    console.log(`
      ModelQueryBuilder | createRecords
      - user: ${this.user.uid}
      - password: ${this.user.password}
      - response:
      ${response.data.result}
    `);

    return response.data.result;
  }

  public async writeRecord(recordId: number, body: OdooRecordSyntax): Promise<boolean> {
    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.user.database,
        this.user.uid,
        this.user.password,
        this.modelName,
        'write',
        [
          [recordId],
          body
        ],
      ],
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.user.connection.client.post('', payload)

    console.log(`
      ModelQueryBuilder | writeRecord
      - user_uid: ${this.user.uid}
      - password: ${this.user.password}
      - record_updated: ${response.data.result}
    `);

    return response.data.result;
  }

  public async writeRecords(recordsId: number[], body: OdooRecordSyntax): Promise<number[]> {
    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.user.database,
        this.user.uid,
        this.user.password,
        this.modelName,
        'write',
        [
          recordsId,
          body
        ],
      ],
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.user.connection.client.post('', payload);

    console.log(`
      ModelQueryBuilder | writeRecords
      - user: ${this.user.uid}
      - password: ${this.user.password}
      - response:
      ${response.data.result}
    `);

    return response.data.result;
  }

  public async multiWriteRecords(records: [number, OdooRecordSyntax][]): Promise<number[]> {
    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.user.database,
        this.user.uid,
        this.user.password,
        this.modelName,
        'write',
        records
      ],
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.user.connection.client.post('', payload)

    return response.data.result;
  }

  /**
  * Get the list of records ids
  *
  * @param {LogicFilter[]} [andFilters="[]"] - The filters for the AND logic
  * @param {LogicFilter[]} [orFilters="[]"] - The filters for the OR logic
  * @param {FieldsFilter} [fields] - The filter for the fields you want to retrieve
  * @param {number} limit - The max number of records to be retrieved
  * @returns {Promise<number[]>} The ids of founds arrays
  */
  public async searchRecords(
    andFilters: LogicFilter[] = [],
    orFilters: LogicFilter[] = [],
    fields?: FieldsFilter,
    limit?: number
  ): Promise<number[]> {
    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.user.database,
        this.user.uid,
        this.user.password,
        this.modelName,
        'search',
        [andFilters, orFilters],
        {
          fields,
          limit
        }
      ],
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.user.connection.client.post('', payload)

    return response.data.result;
  }

  /**
  * Get the list of records and their content
  *
  * @param {LogicFilter[]} [andFilters="[]"] - The filters for the AND logic
  * @param {LogicFilter[]} [orFilters="[]"] - The filters for the OR logic
  * @param {FieldsFilter} [fields] - The filter for the fields you want to retrieve
  * @param {number} limit - The max number of records to be retrieved
  * @returns {OdooRecord[]} List of the records
  */
  public async searchReadRecords(
    andFilters: LogicFilter[] = [],
    orFilters: LogicFilter[] = [],
    fields?: FieldsFilter,
    limit?: number
  ): Promise<T[]> {
    // Combina i filtri AND e OR
    const filters = [
      ...andFilters, // I filtri AND
      ...(orFilters.length > 0 ? [orFilters] : []), // Aggiungi i filtri OR se presenti
    ];

    const params = {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.user.database,
        this.user.uid,
        this.user.password,
        this.modelName,
        'search_read',
        [
          andFilters,
        ],
        {
          fields,
          limit,
        }
      ]
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await this.user.connection.client.post('', payload)

    return response.data.result;
  }

  public async readRecord(
    recordId: number,
    fields?: FieldsFilter,
    limit?: number
  ): Promise<T> {
      const params = {
        service: 'object',
        method: 'execute_kw',
        args: [
          this.user.database,
          this.user.uid,
          this.user.password,
          this.modelName,
          'read',
          [[recordId]],
          {
            fields,
            limit,
          }
        ],
      }

      const payload = {
        'jsonrpc': '2.0',
        'method': 'call',
        'params': params,
        'id': 1
      }

      const response = await this.user.connection.client.post('', payload);

      if (DEBUG) {
        console.log(`
          ModelQueryBuilder | readRecord
          - user: ${this.user.uid}
          - password: ${this.user.password}
          - response:
            ${JSON.stringify(response.data.result)}
        `);
      }

      return response.data.result[0];
    }

    public async readRecords(
      recordsId: number[],
      fields?: FieldsFilter,
      limit?: number
    ): Promise<T[]> {
      const params = {
        service: 'object',
        method: 'execute_kw',
        args: [
          this.user.database,
          this.user.uid,
          this.user.password,
          this.modelName,
          'read',
          [recordsId],
          {
            fields,
            limit,
          }
        ],
      }

      const payload = {
        'jsonrpc': '2.0',
        'method': 'call',
        'params': params,
        'id': 1
      }

      const response = await this.user.connection.client.post('', payload)

      return response.data.result;
    }

}

//const connection = await OdooConnection.connect('http://localhost:8070/jsonrpc');
//const user = await connection.login('odoo-rest-db', 'admin', 'admin')
