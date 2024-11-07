from odoo import http
from odoo.http import request
from odoo.exceptions import AccessError


class AuthController(http.Controller):


    """
    Route per effettuare il login su Odoo.
    """
    @http.route('/api/v0/login', type='json', auth='public', cors='*', methods=['POST'])
    def login(self, db, username, password, **kwargs):
        uid = request.session.authenticate(db, username, password)

        if uid:
            print(f'status: "success", user_id: {uid}, session_id: {request.session}')
            return {
                'status': 'success',
                'user_id': uid,
                'session_id': request.session,  # Ritornare il session_id come "token"
                'message': 'Login effettuato con successo!'
            }
        else:
            return {
                'status': 'error',
                'message': 'Credenziali non valide'
            }, 401

    @http.route('/api/<string:model_name>/records_with_auth', type='json', auth='user', cors='*', methods=['GET'])
    def get_model_records(self, model_name, **kwargs):
        """
        Route per ottenere i record di un modello specificato.
        Richiede autenticazione basata su sessione.
        """
        try:
            # Verifica se il modello esiste
            if model_name not in request.env:
                return {
                    'status': 'error',
                    'message': 'Modello non trovato'
                }, 404

            # Recupera il dominio e i campi opzionali dai parametri della richiesta
            domain = kwargs.get('domain', [])
            fields = kwargs.get('fields', [])

            # Cerca i record in base al dominio e ai campi specificati
            records = request.env[model_name].search_read(domain, fields)

            return {
                'status': 'success',
                'data': records
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }, 500
