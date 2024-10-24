import axios from 'axios';

export interface OdooModel {
  id: number
}

export interface Visitor extends OdooModel {
  name: string,
  surname: string,
  phone: string,
  email: string,
  company: string
}

export interface OdooResponse<T extends OdooModel> {
  id: undefined | null | string
  jsonrcp: string,
  result: T
}

export interface AuthResponse {
  id: number,
  result: object
}

/*
  Questo test funziona su postman
    curl -X POST http://localhost:8069/login \
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
  const url = 'http://localhost:8069/login';
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
  const url = `http://localhost:8069/model/${modelName}/create`;
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

export async function deleteModelRecords(token: string, modelName: string, ids: number[]) {
  const url = `http://localhost:8069/model/${modelName}/delete`;
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

export async function getModelRecords(modelName: string) {
  const url = `http://localhost:8069/model/${modelName}/records`;

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

export async function getModelRecord(modelName: string, recordId: number) {
  const url = `http://localhost:8069/model/${modelName}/record/${recordId}`;

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
  const url = `http://localhost:8069/model/${modelName}`;  // URL generico
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
  const url = 'http://localhost:8069/get_visitors';
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
  const url = 'http://localhost:8069/get_visitors';  // Assicurati che questo URL corrisponda a quello esposto da Odoo

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
