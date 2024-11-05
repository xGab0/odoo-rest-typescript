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
    @http.route('/model/<string:model_name>/delete_record/<int:record_id>', type='json', auth='public', cors='*', methods=['POST'])
    def delete_specific_record(self, model_name, record_id, **kwargs):
        """
        API per rimuovere un record specifico di un modello dato l'ID e un dominio opzionale.
        """

        #print(f'looking for model {model_name}')
        #print(f'from get: {request.env.get(model_name)}')
        #print(f'from env: {request.env[model_name]}')
        #print('----')

        # Verifica se il modello esiste
        #if not request.env.get(model_name):
        #    return {'error': 'Modello non trovato'}, 404

        # Verifica se il modello esiste con sudo
        if not request.env[model_name].sudo().check_access_rights('unlink', raise_exception=False):
            return {'error': 'Modello non trovato o permesso negato'}, 404

        print('model found')

        # Recupera il dominio opzionale dai kwargs
        domain = kwargs.get('domain', [])

        # Aggiungi il filtro per l'ID al dominio
        domain.append(('id', '=', record_id))

        #print(f'DOMAIN: {domain}')

        # Cerca il record con il dominio specificato
        record = request.env[model_name].sudo().search(domain, limit=1)

        #print('found record: ', record)

        if record.exists():
            #print(f'record with id {record.id} found, removing it...')
            record.unlink()
            return {'status': 'success', 'message': 'Record eliminato con successo'}
        else:
            #print('record with id ' + record.record_id + "not found")
            return {'status': 'error', 'message': 'Record non trovato o non soddisfa i criteri'}, 404

    # auth="public"
    # auth="user"
    @http.route(['/model/<string:model_name>/records'], type='json', auth="public", cors="*")
    def get_model_records(self, model_name, **kwargs):
        # Recupera il dominio opzionale dai kwargs
        domain = kwargs.get('domain', [])
        limit = kwargs.get('limit', 999)

        # Verifica se il modello esiste nel database
        #records = request.env[model_name].sudo().search(domain, limit)
        #records = request.env[model_name].sudo().search_read(domain, False)
        records = request.env[model_name].sudo().search_read([], False)
        #records = request.env[model_name].sudo().search_read([], ['name', 'surname'])

        #partner_data = request.env['res.partner'].sudo().search_read(
        #    [('id', '=', partner_id)],
        #    ['name', 'company_id']
        #)

        print("Records:", records)
        return records

    """
    Example result:
        {
          "status": "success",
          "models": [
            {"model": "res.partner", "name": "Contacts"},
            {"model": "res.users", "name": "Users"},
            ...
          ]
        }
    """
    @http.route('/models', type='json', auth='public', cors='*', methods=['GET'])
    def get_all_models(self):
        """
        API per ottenere tutti i modelli disponibili nel database.
        """
        try:
            # Ottieni tutti i nomi dei modelli nel database
            models = request.env['ir.model'].sudo().search_read([], ['model', 'name'])
            model_list = [{'model': model['model'], 'name': model['name']} for model in models]

            return {'status': 'success', 'models': model_list}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}, 500

    """
    Example result:
        {
          "status": "success",
          "users": [
            {"name": "Admin", "login": "admin", "email": "admin@example.com"},
            {"name": "John Doe", "login": "johndoe", "email": "johndoe@example.com"},
            ...
          ]
        }
    """
    @http.route('/users', type='json', auth='public', cors='*', methods=['GET'])
    def get_all_users(self):
        """
        API per ottenere tutti gli utenti nel sistema.
        """
        try:
            # Ottieni tutti gli utenti con i campi specificati
            users = request.env['res.users'].sudo().search_read([], ['name', 'login', 'email'])

            return {'status': 'success', 'users': users}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}, 500

    """
    Example result:
        {
            "status": "success",
            "fields": [
                {
                    "name": "name",
                    "type": "char",
                    "value": "Contatto di esempio",
                    "label": "Nome",
                    "required": true,
                    "readonly": false
                },
                {
                    "name": "email",
                    "type": "char",
                    "value": "example@example.com",
                    "label": "Email",
                    "required": false,
                    "readonly": false
                },
                {
                    "name": "company_id",
                    "type": "many2one",
                    "value": 1,
                    "label": "Company",
                    "required": false,
                    "readonly": false
                },
                {
                    "name": "category_id",
                    "type": "many2many",
                    "value": [3, 5],
                    "label": "Tags",
                    "required": false,
                    "readonly": false
                },
                ...
            ]
        }
    """
    @http.route('/model/<string:model_name>/record/<int:record_id>/fields', type='json', auth='public', cors='*', methods=['GET'])
    def get_record_fields(self, model_name, record_id):
        """
        API per ottenere i campi di un record specifico con tipo, nome, valore, ecc.
        """
        try:
            # Verifica se il modello esiste
            model = request.env.get(model_name)
            if not model:
                return {'status': 'error', 'message': 'Modello non trovato'}, 404

            # Recupera il record specifico
            record = model.sudo().browse(record_id)
            if not record.exists():
                return {'status': 'error', 'message': 'Record non trovato'}, 404

            # Ottieni le informazioni dei campi
            fields_info = []
            for field_name, field in record._fields.items():
                field_type = field.type
                field_value = getattr(record, field_name)

                # Formatta il valore del campo per tipi specifici
                if field_type in ['many2one']:
                    field_value = field_value.id if field_value else None
                elif field_type in ['one2many', 'many2many']:
                    field_value = field_value.ids

                fields_info.append({
                    'name': field_name,
                    'type': field_type,
                    'value': field_value,
                    'label': field.string,
                    'required': field.required,
                    'readonly': field.readonly
                })

            return {
                'status': 'success',
                'fields': fields_info
            }
        except Exception as e:
            return {'status': 'error', 'message': str(e)}, 500
