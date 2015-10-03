import os

os.environ['PYTHON_EGG_CACHE'] = '/usr/local/python-eggs'
activate_this = '/home/ubuntu/routr-trondheim/bin/activate_this.py'

# activate_this = os.path.dirname(__file__) + '/bin/activate_this.py'
# execfile(activate_this, dict(__file__=activate_this))

with open(activate_this) as f:
    code = compile(f.read(), activate_this, 'exec')
    exec(code, global_vars, local_vars)

import sys
import logging
logging.basicConfig(stream=sys.stderr)

project_home = '/home/ubuntu/routr-trondheim'
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

sys.path.append('src')

from routr.app import app as application

application.secret_key = 'bwxj1'