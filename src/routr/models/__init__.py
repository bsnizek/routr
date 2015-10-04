import uuid
import datetime
from geoalchemy2 import Geometry, WKTElement
from geoalchemy2.shape import to_shape

from routr.app import db
from shapely.geometry import mapping, LineString

__author__ = 'besn'

class Route(db.Model):

    __tablename__ = "route"

    id = db.Column(db.Integer, primary_key=True, unique=True)
    guid = db.Column(db.String, index=True, unique=True)
    geom = db.Column(Geometry(geometry_type='LINESTRING', srid=4326))
    date = db.Column(db.DateTime)
    user_id = db.Column(db.String)
    n_saves = db.Column(db.String)

    # TODO: switch type
    # n_saves = db.Column(db.Integer)

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
    def all(d_b):
        return d_b.session.query(Route)

    @staticmethod
    def get_route_by_user_id(d_b, user_id):
        return d_b.session.query(Route).filter_by(user_id = user_id).first()

    @staticmethod
    def get_route_by_guid(d_b, guid):
        return d_b.session.query(Route).filter_by(guid = guid).first()

    @staticmethod
    def update_geometry(d_b, user_id, geom):

        wkt = WKTElement(geom.wkt, srid=4326)

        route = Route.get_route_by_user_id(d_b, user_id)

        if route:
            route.geom = wkt
            # if route.n_saves:
            #     route.n_saves = route.n_saves + 1
            # else:
            #     route.n_saves = 1
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
        """
        :return: The geoJSON of the object.
        {'coordinates': (
        (51.83577752045248, 0.0),
        (44.08758502824518, 11.42578125),
        (58.72259882804337, 20.56640625),
        (43.32517767999296, 13.359375)),
        'type': 'LineString'}
        """
        return mapping(to_shape(self.geom))

    def get_geometry(self):
        """
        :return: The Shapely geometry object.
        """
        return to_shape(self.geom)

    @staticmethod
    def get_bounds(d_b):
        """
        Returns the boundary for the whole table i.e. all its objects.
        :param d_b:
        :return:
        """
        routes = Route.all(d_b)
        coords = []
        for route in routes:
            coords = coords + list(route.get_geometry().coords)
        return LineString(coords).bounds
