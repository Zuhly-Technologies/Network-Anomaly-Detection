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

    r"/feature_selection/*": {"origins": "*"},

    r"/sample_dataset/*": {"origins": "*"},

    r"/getall_pages/*": {"origins": "*"},

    r"/generate_all_data_predictions": {"origins": "*"},
    r"/get_all_predictions/*": {"origins": "*"},
    r"/modify_label/*": {"origins": "*"},
    r"/modal_data/*": {"origins": "*"},


})

app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://"+usr+":"+password+"@"+host+":"+port+"/"+database

init(app)
api = Api(app)
add_resource(api)

connect="postgresql+psycopg2://"+usr+":"+password+"@"+host+":"+port+"/"+database
engine = create_engine(connect)
connection = engine.connect()

table_exists_query = text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'all_data_predictions')")
table_exists = connection.execute(table_exists_query).scalar()

if not table_exists:

            transactions_df= pd.DataFrame(columns=[ "index",
                                                    "Flow Duration",
                                                    "Total Fwd Packets",
                                                    "Total Backward Packets",
                                                    "Total Length of Fwd Packets",
                                                    "Total Length of Bwd Packets",
                                                    "Fwd Packet Length Max",
                                                    "Fwd Packet Length Min",
                                                    "Fwd Packet Length Mean",
                                                    "Fwd Packet Length Std",
                                                    "Bwd Packet Length Max",
                                                    "Bwd Packet Length Mean",
                                                    "Bwd Packet Length Std",
                                                    "Flow Bytes/s",
                                                    "Flow IAT Mean",
                                                    "Flow IAT Std",
                                                    "Flow IAT Max",
                                                    "Flow IAT Min",
                                                    "Fwd IAT Total",
                                                    "Label",
                                                    "Naive Bayes",
                                                    "QDA",
                                                    "Random Forest",
                                                    "ID3",
                                                 ])

            transactions_df.head(0).to_sql('all_data_predictions', con=engine, index=False, if_exists='replace')

else:

    print (" * predictions table exists...")

if __name__ == '__main__':
    
    app.run(debug=True, host='0.0.0.0', port=server_port)