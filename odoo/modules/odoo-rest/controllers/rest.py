from odoo import http
from odoo.http import request

class MyController(http.Controller):

    @http.route('/model/<string:model_name>/create', type='json', auth='user', cors='*', methods=['POST'])
    def create_model_record(self, model_name, **kwargs):
        """
        API per creare un record per un modello specificato.
        """
        try:
            # Verifica se il modello esiste
            if not request.env.get(model_name):
                return {'error': 'Modello non trovato'}, 404

            # Recupera i dati passati nel corpo della richiesta
            record_data = kwargs.get('data', {})
            if not record_data:
                return {'status': 'error', 'message': 'Nessun dato fornito per la creazione'}, 400

            # Crea un nuovo record
            new_record = request.env[model_name].create(record_data)
            return {'status': 'success', 'message': 'Record creato con successo', 'id': new_record.id}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}, 500

    @http.route('/model/<string:model_name>/delete', type='json', auth='user', cors='*', methods=['POST'])
    def delete_model_records(self, model_name, **kwargs):
        """
        API per rimuovere uno o più record di un modello specificato.
        """
        try:
            if not request.env.get(model_name):
                return {'error': 'Modello non trovato'}, 404

            record_ids = kwargs.get('ids', [])
            if not record_ids:
                return {'status': 'error', 'message': 'Nessun ID specificato per la rimozione'}, 400

            # Cerca i record e li elimina
            records = request.env[model_name].browse(record_ids)
            if records.exists():
                records.unlink()
                return {'status': 'success', 'message': 'Record eliminati con successo'}
            else:
                return {'status': 'error', 'message': 'Record non trovati'}, 404
        except Exception as e:
            return {'status': 'error', 'message': str(e)}, 500

    @http.route(['/model/<string:model_name>/record/<int:record_id>'], type='json', auth="public", cors="*")
    def get_model_record(self, model_name, record_id):
        # Verifica se il modello esiste nel database
        #record = request.env[model_name].sudo().search_read([('id', '=', record_id)], False)
        record = request.env[model_name].sudo().search_read([('id', '=', record_id)], ['name'])

        if not record:
            return {'error': f'Record with ID {record_id} not found in model "{model_name}".'}

        json = {
            'id': id,
            '__last_update': record.__lastupdate,
            'create_date': record.create_date,
            'create_uid': record.create_uid,
            'write_date': record.write_date,
            'write_uid': record.write_uid,
            'model': ''
        }

        print("Json: ", json)
        print("Record:", record)

        return record

    """
    @http.route('/model/<string:model_name>', type='json', auth='user', cors='*', methods=['POST'])
    def get_model_records(self, model_name, **kwargs):
        # API generica per ottenere i record di un modello specificato tramite l'URL.
        try:
            if not request.env.get(model_name):
                return {'error': 'Modello non trovato'}, 404

            fields = kwargs.get('fields', [])
            domain = kwargs.get('domain', [])
            records = request.env[model_name].search_read(domain, fields)
            return {'status': 'success', 'data': records}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}, 500
    """

    @http.route(['/login'], type='json', auth="public", cors="*")
    def login(self, db, username, password):
        """ Autenticazione dell'utente. """
        uid = request.session.authenticate(db, username, password)
        if uid:
            return {
                'status': 'success',
                'user_id': uid,
                'token': request.session.id, # request.session.authenticate.auth_access_token
                'message': 'Login effettuato con successo!'
            }
        else:
            return {
                'status': 'error',
                'message': 'Credenziali non valide.'
            }

    @http.route(['/get'], type='json', auth="public", cors="*")
    def get_data(self):
        # Esempio di dati che potrebbero essere restituiti
        data = {
            'message': 'Hello from Odoo with CORS enabled!',
            'user_id': request.env.user.id,
        }
        return data

    @http.route(['/get_visitors'], type='json', auth="public", cors="*")
    def get_visitors(self):
        #visitors = request.env['dummy.user'].search_read([], ['name'])

        # DANGER: usa sudo per ignorare i permessi, usare solo in testing!
        visitors = request.env['dummy.user'].sudo().search_read([], ['name'])

        # prendi tutti i campi:
        # .search_read([], False)

        print("Visitors:", visitors)
        return visitors

    # auth="public"
    # auth="user"
    @http.route(['/model/<string:model_name>/records'], type='json', auth="public", cors="*")
    def get_model_records(self, model_name):
        # Verifica se il modello esiste nel database
        records = request.env[model_name].sudo().search_read([], False)
        #records = request.env[model_name].sudo().search_read([], ['name'])

        print("Records:", records)
        return records
