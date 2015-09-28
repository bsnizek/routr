import json
import uuid

from flask import render_template, jsonify, request, make_response
from routr.app import app, db

from routr.models import Route
from shapely.geometry import LineString

import geoalchemy2.functions as func
from flask import Response

__author__ = 'besn'

@app.route('/')
def index():
    user_id = request.args.get('user_id')

    return render_template('index.html',
                           user_id = user_id or str(uuid.uuid4())
                           )

@app.route('/routes')
def routes():
    return render_template('routes.html',
                           qgis_file_url="http://127.0.0.1:5000/routes/routes.qgs")

@app.route('/routes/routes.qgs')
def routes_qgis():

    bounds = Route.get_bounds(app.db)

    rt = render_template('routes.qgs',
                         datasource = 'http://127.0.0.1:5000/data',
                         xmin = bounds[0],
                         ymin = bounds[1],
                         xmax = bounds[2],
                         ymax = bounds[3]
                         )

    response= make_response(rt)
    response.headers["Content-Type"] = "application/x-qgis-project"

    return response

@app.route('/routes/data')
def routes_geojson():
    """
    :return: Returns a dict containing the bundaries of the table and a list of guids of the routes.
    {
  "bounds": [
    10.26912689208984,
    63.38337070759972,
    10.45074462890625,
    63.4445238395574
  ],
  "guids": [
    "75ab78e8-63a5-459a-b580-61f67c45db94",
    "f82d1581-2649-4fbb-8716-270da989538c",
    "01407688-2237-4f87-ba66-697097517cbc",
    "d25184ca-a76a-4e52-b474-aadc80d26626"
  ]
}
    """
    return jsonify(
        {
            'bounds': Route.get_bounds(app.db),
            'guids': [r.guid for r in Route.all(app.db)]
        })

@app.route('/route/<route_guid>/geojson')
def route_route_guid_geojson(route_guid):
    return jsonify(Route.get_route_by_guid(app.db, route_guid).geo())

@app.route("/data")
def data():
    """Returns all data
    """

    routes = Route.all(app.db)

    features = []

    for route in routes:

        geojson = json.loads(db.session.scalar(func.ST_AsGeoJSON(route.geom)))

        features.append(
            {'geometry': geojson,
             'properties': {'guid': route.guid,
                            'user_id': route.user_id}
             }
        )

    dd = {"type": "FeatureCollection",
          "crs": { "type": "name",
                   "properties": {
                       "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                   }
                   },
          'features': features,

          }

    return jsonify(dd)

@app.route("/cfg/<user_id>")
def cfg(user_id):

    route = Route.get_route_by_user_id(db, user_id)

    j = {
        'config':
            {'center':
                {
                    'lat': app.config['LOAD_SITUATION'].get('lat'),
                    'lng': app.config['LOAD_SITUATION'].get('lon')
                },
                'zoom': app.config['LOAD_SITUATION'].get('zoom'),
                'zoom_limits': {'from': app.config['ZOOM_LIMITS'].get('from'),
                                'to': app.config['ZOOM_LIMITS'].get('to')}
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

    geom = data.get("polyline")
    user_id = data.get("user_id")

    linestring = LineString([(g.get("lng"), g.get("lat")) for g in geom])
    Route.update_geometry(app.db, user_id, linestring)

    return json.dumps({'status': 'OK'})