from flask import url_for
from flask.ext.sqlalchemy import SQLAlchemy
import jinja2
import os
from routr.helpers import Flask

__author__ = 'besn'

app = Flask(__name__)

root_path = '/'.join(os.path.abspath(__file__).split('/')[:-4])
static_folder = os.path.join(root_path, 'static')

app = Flask(__name__, static_folder=static_folder)
app.config.from_yaml(app.root_path)

tmpl_dir = os.path.join(root_path, 'templates')

my_loader = jinja2.ChoiceLoader([
    app.jinja_loader,
    jinja2.FileSystemLoader(tmpl_dir),
])

app.jinja_env.globals['static'] = (
    lambda filename: url_for('static', filename=filename)
)

app.jinja_loader = my_loader

db = SQLAlchemy(app)
app.db = db
# db.session.execute(text("CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;"))

from routr.models import Route

db.create_all()

from routr.views import index, cfg, save_route