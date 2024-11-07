import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8069/api/v0',
    withCredentials: true,  // Permette ad Axios di gestire i cookie di sessione
});

export interface LoginResponse {
    status: string;
    user_id?: number;
    message: string;
}

export async function test_login(db: string, username: string, password: string): Promise<LoginResponse> {
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

    try {
        const response = await apiClient.post<LoginResponse>('/login', requestData, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const { data } = response;

        if (data.status === 'success') {
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

// Esempio di utilizzo
/*
test_login('odoo-rest-db', 'admin', 'admin')
    .then((data) => console.log('Risposta login:', data))
    .catch((error) => console.error('Errore:', error));
*/
