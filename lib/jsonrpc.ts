import axios from "axios";

export type ServerVersionInfo = [number, number, number, string, number, string];
export type OdooRecordSyntax = { [key: string]: any };
export type LogicType = '>=' | '<=' | '=' | 'ilike';
export type LogicFilter = [string, LogicType, any];
export type FieldsFilter = OdooRecordSyntax[] | [true];

export class OdooConnection {
  private readonly host: string;
  private readonly serverVersion: string;
  private readonly serverVersionInfo: ServerVersionInfo;
  private readonly serverSerie: string;
  private readonly protocolVersion: number;

  public constructor(
    host: string,
    serverVersion: string,
    serverVersionInfo: ServerVersionInfo,
    serverSerie: string,
    protocolVersion: number
  ) {
    this.host = host;
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
      const response = await axios.post(this.host, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.error) {
        throw new Error(`Error: ${response.data.error.message}`);
      }

      console.log('Logged to Odoo successfully!');

      return new OdooUser(this.host, database, 2, username, password)
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

      console.log('Connected to Odoo successfully!');
      console.log(result);

      return new OdooConnection(
        host,
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
  private readonly host: string;
  private readonly database: string;
  private readonly uid: number;
  private readonly username: string;
  private readonly password: string;

  public constructor(host: string, database: string, uid: number, username: string, password: string) {
    this.host = host;
    this.database = database;
    this.uid = uid;
    this.username = username;
    this.password = password;
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

    const response = await axios.post(this.host, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

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

    const response = await axios.post(this.host, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

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

    const response = await axios.post(this.host, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data.result;
  }

  /**
  * Get the list of records ids
  *
  * @param {string} modelName - The name of the registered Model
  * @param {LogicFilter[]} [andFilters="[]"] - The filters for the AND logic
  * @param {LogicFilter[]} [orFilters="[]"] - The filters for the OR logic
  * @param {FieldsFilter} [fieldsFilter="[true]"] - The filter for the fields you want to retrieve
  * @param {number} limit - The max number of records to be retrieved
  * @returns {Promise<number[]>} The ids of founds arrays
  */
  public async searchRecords(
    modelName: string,
    andFilters: LogicFilter[] = [],
    orFilters: LogicFilter[] = [],
    fieldsFilter: FieldsFilter = [true],
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
          fieldsFilter,
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

    const response = await axios.post(this.host, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data.result;
  }

  /**
  * Get the list of records and their content
  *
  * @param {string} modelName - The name of the registered Model
  * @param {LogicFilter[]} [andFilters="[]"] - The filters for the AND logic
  * @param {LogicFilter[]} [orFilters="[]"] - The filters for the OR logic
  * @param {FieldsFilter} [fieldsFilter="[true]"] - The filter for the fields you want to retrieve
  * @param {number} limit - The max number of records to be retrieved
  * @returns {OdooRecord[]} List of the records
  */
  public async searchReadRecord(
    modelName: string,
    andFilters: LogicFilter[] = [],
    orFilters: LogicFilter[] = [],
    fieldsFilter: FieldsFilter = [true],
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
        //filters,  // Passa i filtri combinati
        [andFilters, orFilters],
        {
          fieldsFilter,
          limit
        }
      ]
    }

    const payload = {
      'jsonrpc': '2.0',
      'method': 'call',
      'params': params,
      'id': 1
    }

    const response = await axios.post(this.host, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data.result;
  }
}
