import os

os.environ['PYTHON_EGG_CACHE'] = '/usr/local/python-eggs'
activate_this = '/home/ubuntu/routr-trondheim/bin/activate_this.py'
# activate_this = os.path.dirname(__file__) + '/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))

import sys
import logging
logging.basicConfig(stream=sys.stderr)

project_home = '/home/ubuntu/routr-trondheim'
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

from app import app as application

application.secret_key = 'Add your secret key'