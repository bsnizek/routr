import uuid
import datetime
from geoalchemy2 import Geometry, WKTElement
from geoalchemy2.shape import to_shape

from routr.app import db
from shapely.geometry import mapping

__author__ = 'besn'

class Route(db.Model):

    __tablename__ = "route"

    id = db.Column(db.Integer, primary_key=True, unique=True)
    guid = db.Column(db.String, index=True, unique=True)
    geom = db.Column(Geometry(geometry_type='LINESTRING', srid=4326))
    date = db.Column(db.DateTime)
    user_id = db.Column(db.String)
    n_saves = db.Column(db.String)

    def __init__(self, user_id):
        """
        :return:
        """
        self.guid = str(uuid.uuid4())
        self.user_id = user_id
        self.date = datetime.datetime.now()
        self.n_saves = 1

    @staticmethod
    def create(d_b, user_id):

        route = Route(user_id)

        d_b.session.add(route)
        d_b.session.commit()

        return route

    @staticmethod
    def get_rout_by_user_id(d_b, user_id):
        return d_b.session.query(Route).filter_by(user_id=user_id).first()

    @staticmethod
    def update_geometry(d_b, user_id, geom):

        wkt = WKTElement(geom.wkt, srid=4326)

        route = Route.get_rout_by_user_id(d_b, user_id)

        if route:
            route.geom = wkt
            route.n_saves = route.n_saves + 1
            d_b.session.commit()
        else:
            route = Route.create(d_b, user_id)
            route.geom = wkt
            d_b.session.commit()

        return route

    def serialize(self):
        return {'guid': self.guid,
                'id': self.id,
                'geom':self.geom}

    def geo(self):
        return mapping(to_shape(self.geom))
