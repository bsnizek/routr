import json
from flask import render_template, jsonify, request
from routr.app import app, db

from routr.models import Route
from shapely.geometry import Point, LineString

__author__ = 'besn'

@app.route('/')
def index():
    return render_template('index.html',
                           user_id=request.args.get('user_id'))

@app.route("/cfg/<user_id>")
def cfg(user_id):

    route = Route.get_rout_by_user_id(db, user_id)

    j = {'config':
             {
                 'lat':63.4266335,
                 'lng': 10.4074486
             }
         }

    if route:
        coords = route.geo().get('coordinates')
        coords = [c for c in coords]
        j['geom'] = coords

    return jsonify(j)


@app.route('/save_route', methods=['POST'])
def save_route():
    """
    saves the route
    :return:
    """
    data = request.json

    print(data)

    geom = data.get("polyline")
    user_id = data.get("user_id")

    linestring = LineString([(g.get("lat"), g.get("lng")) for g in geom])
    Route.update_geometry(app.db, user_id, linestring)

    return json.dumps({'status':'OK'});