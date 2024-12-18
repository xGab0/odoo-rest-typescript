import axios, { type AxiosInstance } from 'axios';

export interface OdooUser {
  id: number,
  name: string
}

export interface OdooRecord {
  id: number,
  __last_update: Date, // "2024-10-29 09:16:17"
  create_date: Date, // "2024-10-29 09:16:17"
  create_uid: Array<any>, // OdooUser
  write_date: Date, // "2024-10-29 09:16:17"
  write_uid: Array<any> // OdooUser,
}

//export interface OdooResponse<T extends OdooRecord<M>, M extends OdooModel> {
export interface OdooResponse<T> {
  id: undefined | null | string
  jsonrcp: string,
  result: T,
  //data: T[];
}

export interface DeleteRecordResponse {
    status: string;
    message: string;
}

export interface Visitor extends OdooRecord {
  name: string,
  surname: string,
  phone: string,
  email: string,
  company: string
}

export interface AuthResponse {
  id: number,
  result: object
}

export class OdooQuery {
  private modelName: string | null = null;
  private domainConditions: [string, string, any][] = [];
  private selectedFields: string[] | boolean = false;

  static odooQuery() {
    return new OdooQuery();
  }

  model(name: string): this {
    this.modelName = name;
    return this;
  }

  domain(...conditions: [string, string, any][]): this {
    this.domainConditions.push(...conditions);
    return this;
  }

  fields(fields: string[] | false = false): this {
    this.selectedFields = fields;
    return this;
  }

  async run() {
    if (!this.modelName) throw new Error("Model name is required");

    const body = {
      model: this.modelName,
      domain: this.domainConditions,
      fields: this.selectedFields || undefined,
    };

    const response = await fetch('/your-odoo-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("Failed to fetch data from Odoo");

    return response.json();
  }
}

/*
  Questo test funziona su postman
    curl -X POST http://localhost:8070/login \
    -H "Content-Type: application/json" \
    -d '{
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "db": "odoo-db",
        "username": "admin",
        "password": "admin"
      },
      "id": 1
    }'
*/

export async function workingLogin() {
  const url = 'http://localhost:8070/login';
  const requestData = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "db": "odoo-db",
      "username": "admin",
      "password": "admin"
    },
    "id": 1
  }

  const response = await axios.post(url, requestData, {
    headers: {
      'Content-Type': 'application/json',
    }
  });

  console.log('workingAuth | response:');
  console.log(response.data);

  return response.data.result;
}

export async function createModelRecords(token: string, modelName: string, data: object) {
  const url = `http://localhost:8070/model/${modelName}/create`;
  const requestData = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      data: data  // Dati del nuovo record
    },
    id: 1,
  };

  const response = await axios.post(url, requestData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,  // Usa il session ID come token
    },
  });

  console.log('createModelRecords | response:');
  console.log(response.data);

  return response.data;
}

export async function deleteModelRecord(modelName: string, recordId: number, domain: Array<[string, string, any]> = []): Promise<DeleteRecordResponse> {
  const url = `http://localhost:8070/model/${modelName}/delete_record/${recordId}`;

  try {
      const response = await axios.post<DeleteRecordResponse>(url,
        {
          domain: domain
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        });

      if (response.data.status === 'success') {
          console.log('Record eliminato con successo:', response.data.message);
      } else {
          console.error('Errore durante l\'eliminazione del record:', response.data.message);
      }

      return response.data;
  } catch (error) {
      console.error('Errore nella richiesta:', error);
      throw error;
  }
}

export async function deleteModelRecords(token: string, modelName: string, ids: number[]) {
  const url = `http://localhost:8070/model/${modelName}/delete`;
  const requestData = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      ids: ids  // Lista degli ID dei record da eliminare
    },
    id: 1,
  };

  const response = await axios.post(url, requestData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function newOdooClient(): Promise<AxiosInstance> {
  const apiClient = axios.create({
      baseURL: 'http://localhost:8069/api/v0', // Cambia con il tuo URL di base
      headers: {
          'Content-Type': 'application/json',
      },
      withCredentials: true, // Necessario per gestire la sessione Odoo
  });

  return apiClient;
}

export interface LoginResponse {
    status: string;
    user_id?: number;
    token?: string;
    message: string;
}

export async function NEWAUTH(db: string, username: string, password: string): Promise<LoginResponse> {
    try {
        // Crea un'istanza Axios temporanea con il baseURL fornito
        const url = `http://localhost:8070/api/v0/login`;
        const requestData = {
          "jsonrpc": "2.0",
          "method": "call",
          "params": {
            "db": db,
            "username": username,
            "password": password
          },
          "id": 1
        }

        const response = await axios.post<LoginResponse>(url, requestData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}`,  // Usa il session ID come token
          },
        });

        const { data } = response;

        if (data.status === 'success' && data.token) {
            // Configura l'intestazione di autorizzazione per le richieste successive
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            console.log('Login effettuato con successo:', data);
        } else {
            console.warn('Login fallito:', data.message);
        }

        return data;
    } catch (error) {
        console.error('Errore durante il login:', error);
        throw error;
    }
}

export async function getModelRecordsWithAuth(sessionId: string, modelName: string) {
  const url = `http://localhost:8070/api/v0/${modelName}/records`;
  const result = await axios.get('/api/<nome_modello>/records', {
      headers: {
          'Cookie': `session_id=${sessionId}`
      },
      params: {
          //domain: [['is_active', '=', true]],  // esempio di dominio
          //fields: ['id', 'name']               // campi da includere
      }
  })
  .then(response => {
      console.log('Records:', response.data.data);
  })
  .catch(error => {
      console.error('Errore:', error.response.data.message);
  });

}

export async function getModelRecords<M extends OdooRecord>(modelName: string, domain: Array<[string, string, string]> = [], limit: number): Promise<OdooResponse<M[]>> {
  const url = `http://localhost:8070/model/${modelName}/records`;

  try {
    const response = await axios.post<OdooResponse<M[]>>(url,
      {
        domain: domain,
        limit: limit
      },
      {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    /*
    {
      id: number,
      jsonrcp: "2.0",
      result: [
        {
          __last_update: "2024-10-29 09:16:17",
          create_date: "2024-10-29 09:16:17",
          create_uid: [ 2, 'Mitchell Admin' ],
          write_date: "2024-10-29 09:16:17",
          write_uid: [ 2, 'Mitchell Admin' ],

          id: 1,
          name: 'Marco',
          surname 'Giordano'
        }
      ]
    }
    */

    // Converting the first item in `result` to a JSON string for readability
    //console.log('DEBUG RESPONSE:', JSON.stringify(response.data.result[0], null, 2));

    //const records = response.data.result;  // I record del modello saranno qui
    //console.log('Records:', records);
    return response.data;
  } catch (error) {
    console.error('Errore durante il recupero dei record:', error);
    throw error;
  }
}

export async function getModelRecord(modelName: string, recordId: number) {
  const url = `http://localhost:8070/model/${modelName}/record/${recordId}`;

  try {
    const response = await axios.post(url, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const records = response.data;  // I record del modello saranno qui
    console.log('Records:', records);
    return records;
  } catch (error) {
    console.error('Errore durante il recupero dei record:', error);
    throw error;
  }
}

/*
export async function getModelRecords(token: string, modelName: string, fields: string[] = [], domain: any[] = []) {
  const url = `http://localhost:8070/model/${modelName}`;  // URL generico
  const requestData = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      fields: fields,  // Campi da recuperare
      domain: domain   // Domain opzionale per filtrare i dati
    },
    id: 1,
  };

  const response = await axios.post(url, requestData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.data;
}
*/

export async function OLD_getVisitors() {
  const url = 'http://localhost:8070/get_visitors';
  const requestData = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {},
    "id": 1
  }

  const response = await axios.post(url, requestData, {
    headers: {
      'Content-Type': 'application/json',
    }
  });

  console.log('getVisitors | response:');
  console.log(response.data.result);

  return response.data.result;
}

export async function getVisitors() {
  const url = 'http://localhost:8070/get_visitors';  // Assicurati che questo URL corrisponda a quello esposto da Odoo

  try {
    const response = await axios.post(url, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const visitors = response.data;  // I dati dei visitors saranno qui
    console.log('Visitors:', visitors);
    return visitors;
  } catch (error) {
    console.error('Errore durante il recupero dei visitors:', error);
    throw error;
  }
}

/*

const response = await axios.get(url, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // Include il session ID
    },
});

*/
