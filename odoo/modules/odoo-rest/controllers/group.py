from odoo import http
from odoo.http import request
from odoo.exceptions import AccessError


class GroupController(http.Controller):


    @http.route('/api/groups/create', type='json', auth='user', methods=['POST'])
    def create_group(self, group_name):
        """
        Route per creare un nuovo gruppo di accesso.
        """
        try:
            # Controlla se un gruppo con lo stesso nome esiste già
            existing_group = request.env['res.groups'].sudo().search([('name', '=', group_name)], limit=1)
            if existing_group:
                return {'status': 'error', 'message': 'Il gruppo esiste già'}, 400

            # Crea il gruppo
            new_group = request.env['res.groups'].sudo().create({'name': group_name})
            return {'status': 'success', 'message': 'Gruppo creato con successo', 'group_id': new_group.id}

        except Exception as e:
            return {'status': 'error', 'message': str(e)}, 500


    @http.route('/api/groups/delete', type='json', auth='user', methods=['POST'])
    def delete_group(self, group_name):
        """
        Route per rimuovere un nuovo gruppo di accesso.
        """
        try:
            # Controlla se un gruppo con lo stesso nome esiste già
            existing_group = request.env['res.groups'].sudo().search([('name', '=', group_name)], limit=1)
            if existing_group:
                return {'status': 'error', 'message': 'Il gruppo esiste già'}, 400

            # Crea il gruppo
            new_group = request.env['res.groups'].sudo().create({'name': group_name})
            return {'status': 'success', 'message': 'Gruppo creato con successo', 'group_id': new_group.id}

        except Exception as e:
            return {'status': 'error', 'message': str(e)}, 500


    @http.route('/api/v0/groups/<int:group_id>/set_permissions', type='json', auth='user', methods=['POST'])
    def set_group_permissions(self, group_id, model_name, read=False, write=False, create=False, delete=False):
        """
        Route per impostare i permessi di un gruppo su un modello specifico.
        """
        try:
            # Controlla se il gruppo esiste
            group = request.env['res.groups'].sudo().browse(group_id)
            if not group.exists():
                return {'status': 'error', 'message': 'Gruppo non trovato'}, 404

            # Verifica se il modello esiste
            model = request.env['ir.model'].sudo().search([('model', '=', model_name)], limit=1)
            if not model:
                return {'status': 'error', 'message': 'Modello non trovato'}, 404

            # Cerca o crea la regola di accesso per il modello e il gruppo
            access_right = request.env['ir.model.access'].sudo().search([
                ('model_id', '=', model.id),
                ('group_id', '=', group.id)
            ], limit=1)

            if access_right:
                # Aggiorna i permessi
                access_right.sudo().write({
                    'perm_read': read,
                    'perm_write': write,
                    'perm_create': create,
                    'perm_unlink': delete,
                })
            else:
                # Crea una nuova regola di accesso se non esiste
                request.env['ir.model.access'].sudo().create({
                    'name': f'Access for {model_name} - {group.name}',
                    'model_id': model.id,
                    'group_id': group.id,
                    'perm_read': read,
                    'perm_write': write,
                    'perm_create': create,
                    'perm_unlink': delete,
                })

            return {'status': 'success', 'message': 'Permessi aggiornati con successo'}

        except AccessError:
            return {'status': 'error', 'message': 'Permessi insufficienti per modificare questo gruppo.'}, 403
        except Exception as e:
            return {'status': 'error', 'message': str(e)}, 500


    @http.route('/api/v0/groups', type='json', auth='user', methods=['GET'])
    def get_groups(self):
        """
        Route per ottenere tutti i gruppi e i relativi permessi sui modelli.
        """
        try:
            groups = request.env['res.groups'].sudo().search([])
            group_data = []

            for group in groups:
                # Trova tutti i permessi associati al gruppo
                access_rights = request.env['ir.model.access'].sudo().search([('group_id', '=', group.id)])
                permissions = [{
                    'model_name': access.model_id.model,
                    'perm_read': access.perm_read,
                    'perm_write': access.perm_write,
                    'perm_create': access.perm_create,
                    'perm_unlink': access.perm_unlink,
                } for access in access_rights]

                group_data.append({
                    'group_name': group.name,
                    'permissions': permissions
                })

            return {
                'status': 'success',
                'data': group_data
            }

        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }, 500
