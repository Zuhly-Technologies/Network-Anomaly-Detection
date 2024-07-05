#from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
#ma = Marshmallow()

def init(app):
    db.init_app(app)
    #ma.init_app(app)