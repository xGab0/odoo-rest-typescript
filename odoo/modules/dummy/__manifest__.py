{
    'name': 'Odoo dummy project',
    'version': '1.0',
    'author': 'xGab0',
    'category': 'dummy',
    'depends': ['base'],

    'installable': True,
    'application': True,
    'auto_install': False,

    'data': [
        'views/view_user.xml',
        'views/menu_items.xml',
        'security/ir.model.access.csv'
    ],
    'access_rights': {
        'dummy.user': [('group_user', 'read', 'write')],
    },
}
