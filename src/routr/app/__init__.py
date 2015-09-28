import yaml
from flask import url_for
from flask.ext.sqlalchemy import SQLAlchemy
import jinja2
import os
from routr.helpers import Flask

__author__ = 'besn'

# 1.    We need to read the YAML config file in order to be able to determine whether we should run in development or
#       production mode


# get the root path of the python app
root_path = '/'.join(os.path.abspath(__file__).split('/')[:-4])
config_path = os.path.join(root_path, 'config')

# load the yaml
stram = open(os.path.join(config_path, 'app.yml'), "r")
cfg = yaml.load(stram)

in_development_mode = cfg.get('DEVELOPMENT')

if in_development_mode:
    print("Booting server in development mode.")
    static_folder = os.path.join(os.path.join(root_path, 'dev'), 'static')
    template_folder = os.path.join(os.path.join(root_path, 'dev'), 'templates')
else:
    static_folder = os.path.join(root_path, 'static')
    template_folder = os.path.join(root_path, 'templates')

app = Flask(__name__, static_folder=static_folder, template_folder=template_folder)
app.config.from_yaml(root_path)

my_loader = jinja2.ChoiceLoader([
    app.jinja_loader,
    jinja2.FileSystemLoader(template_folder),
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

from routr.views import index, cfg, save_route, \
    data, routes, routes_geojson, \
    route_route_guid_geojson, routes_qgis