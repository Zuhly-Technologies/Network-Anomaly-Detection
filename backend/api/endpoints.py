from flask_restful import Resource
from flask import request,abort, Response, make_response, jsonify, send_from_directory
from initialize import db
from sqlalchemy import create_engine, text, inspect, desc
import pandas as pd
from dotenv import load_dotenv
import psycopg2
import math
from datetime import datetime, timedelta
import json
import shutil
import sklearn
import re
import random
import os
from attack_metrics import AttackMetrics

# Load environment variables from .env file
load_dotenv()

# Access variables
host = os.getenv("HOST")
database = os.getenv("DATABASE")
usr = os.getenv("USR")
password = os.getenv("PASSWORD")
port = os.getenv("PORT")

connect="postgresql+psycopg2://"+usr+":"+password+"@"+host+":"+port+"/"+database

class GenerateAttackMetrics(Resource):

    def post(self):

        return 0
    
class GetAttackMetrics(Resource):

    def post(self):

        return 0
    
#//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
class GenerateAllMetrics(Resource):

    def post(self):

        return 0
    
class GetAllMetrics(Resource):

    def post(self):

        return 0


