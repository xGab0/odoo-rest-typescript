from odoo import models, fields, api, _

# the convention for names is always {project_name}:{model_name}
class User(models.Model):
    _name = 'dummy.user'
    _description = 'Vdummy user with some data for testing'

    name = fields.Char(string="Name", required=True)
    surname = fields.Char(string="Surname", required=True)
    phone = fields.Char(string="Phone Number")
    email = fields.Char(string="Email")
    company = fields.Char(string="Company", required=True)
