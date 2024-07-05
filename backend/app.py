from flask import Flask, make_response
from flask_restful import Api
from flask_cors import CORS
from initialize import init, db
from dotenv import load_dotenv
import os
import psycopg2
from api import *

# Load environment variables from .env file
load_dotenv()

# Access variables
host = os.getenv("HOST")
database = os.getenv("DATABASE")
usr = os.getenv("USR")
password = os.getenv("PASSWORD")
port = os.getenv("PORT")
server_port = os.getenv("SERVER_PORT")

app = Flask(__name__)

CORS(app, resources={

    r"/generate_attack_metrics": {"origins": "*"},
    r"/get_attack_metrics": {"origins": "*"},

    r"/generate_all_metrics": {"origins": "*"},
    r"/get_all_metrics": {"origins": "*"},

})

app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://"+usr+":"+password+"@"+host+":"+port+"/"+database

init(app)
api = Api(app)
add_resource(api)

connect="postgresql+psycopg2://"+usr+":"+password+"@"+host+":"+port+"/"+database
engine = create_engine(connect)
connection = engine.connect()

if __name__ == '__main__':
    
    app.run(debug=True, host='0.0.0.0', port=server_port)