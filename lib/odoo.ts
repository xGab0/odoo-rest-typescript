import axios, { type AxiosInstance } from 'axios';

export interface LoginResponse {
    status: string;
    user_id?: number;
    token?: string;
    message: string;
}

export class OdooAPIClient {
    private client: AxiosInstance;
    private authToken: string | null = null;

    constructor(baseURL: string) {
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Necessario per la gestione delle sessioni Odoo
        });
    }

    // Funzione per effettuare il login
    async login(db: string, username: string, password: string): Promise<LoginResponse> {
        try {
            const response = await this.client.post<LoginResponse>('/login', {
                db: db,
                username: username,
                password: password,
            });

            const { data } = response;

            if (data.status === 'success' && data.token) {
                // Salva il token di autenticazione
                this.authToken = data.token;
                // Aggiunge il token alle intestazioni di default
                this.client.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
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

    // Metodo per ottenere l'istanza Axios con autenticazione
    getClient(): AxiosInstance {
        return this.client;
    }

    // Esempio di funzione per chiamate API successive, qui `getProfile`
    async getProfile(): Promise<any> {
        if (!this.authToken) {
            throw new Error('Utente non autenticato. Esegui prima il login.');
        }

        try {
            const response = await this.client.get('/profile');
            console.log('Profilo utente:', response.data);
            return response.data;
        } catch (error) {
            console.error('Errore durante il recupero del profilo:', error);
            throw error;
        }
    }
}
