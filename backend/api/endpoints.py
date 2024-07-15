from flask_restful import Resource
from flask import request,abort, Response, make_response, jsonify, send_from_directory
from initialize import db
from sqlalchemy import create_engine, text, inspect, desc, Table, MetaData, update
from sqlalchemy.orm import sessionmaker
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
from attack_metrics import AttackMetrics, get_predictions_dataset
from all_metrics import AllMetrics, GetAllDataPredictions
from preprocess_sample import SampleDataset
from feature_selection import AttackFilter, FeatureSelectionAttack, FeatureSelectionAllData

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

    def get(self):

        try:

            # get_predictions_dataset()
            AttackMetrics()
            return Response(status = 200)
        
        except:

            return Response(status = 400)
    
class GetAttackMetrics(Resource):

    def get(self):

        engine = create_engine(connect)
        connection = engine.connect()

        try:
        
            Bot_df= pd.read_sql('SELECT * FROM Bot', engine)
            DDoS_df= pd.read_sql('SELECT * FROM ddoS', engine)
            DoS_GoldenEye_df= pd.read_sql('SELECT * FROM dos_goldeneye', engine)
            DoS_Hulk_df= pd.read_sql('SELECT * FROM dos_hulk', engine)
            DoS_Slowhttptest_df= pd.read_sql('SELECT * FROM dos_slowhttptest', engine)
            DoS_slowloris_df= pd.read_sql('SELECT * FROM dos_slowloris', engine)
            FTP_Patator_df= pd.read_sql('SELECT * FROM ftp_patator', engine)
            PortScan_df= pd.read_sql('SELECT * FROM portscan', engine)
            SSH_Patator_df= pd.read_sql('SELECT * FROM ssh_patator', engine)

            connection.close()

            metrics = {

                "Bot": Bot_df.to_dict(orient='records'),
                "DDoS": DDoS_df.to_dict(orient='records'),
                "DoS_GoldenEye": DoS_GoldenEye_df.to_dict(orient='records'),
                "DoS_Hulk": DoS_Hulk_df.to_dict(orient='records'),
                "DoS_Slowhttptest": DoS_Slowhttptest_df.to_dict(orient='records'),
                "DoS_slowloris": DoS_slowloris_df.to_dict(orient='records'),
                "FTP_Patator": FTP_Patator_df.to_dict(orient='records'),
                "PortScan": PortScan_df.to_dict(orient='records'),
                "SSH_Patator": SSH_Patator_df.to_dict(orient='records')
            }

            return metrics, 200
        
        except:

            return Response(status = 400)

    
#//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
class GenerateAllMetrics(Resource):

    def get(self):

        try:

            # GetAllDataPredictions()
            AllMetrics()
            return Response(status = 200)
        
        except:

            return Response(status = 400)
    
class GetAllMetrics(Resource):

    def get(self):

        engine = create_engine(connect)
        connection = engine.connect()
    
        try:
            
            all_data_df= pd.read_sql('SELECT * FROM all_data', engine)

            connection.close()

            return all_data_df.to_dict(orient='records')
        
        except:

            return Response(status = 400)
        
#//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Sampledataset(Resource):

    def get(self, sample_size):

        try:
        
            SampleDataset(int(sample_size))
            return Response(status = 200)
        
        except:

            return Response(status = 400)

class FeatureSelection(Resource):

    def get(self, target_feature):

        try:

            if target_feature == "attack":

                AttackFilter()

                print("\nRunning Feature Selection for Attacks...")
                FeatureSelectionAttack()
                return Response(status = 200)

            else:

                print("\nRunning Feature Selection for All Data...")
                FeatureSelectionAllData()
                return Response(status = 200)
        
        except:

            return Response(status = 400)
        
#//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class GenerateAllDataPredictions(Resource):

    def get(self):

        try:
            
            GetAllDataPredictions()
            return Response(status = 200)
        
        except:

            return Response(status = 404)

class GetAllPredictions(Resource):

    def get(self, limit, page):

        engine = create_engine(connect)
        connection = engine.connect()        

        try:

            limit=int(limit)
            page=int(page)
            start=(page*limit)-limit

            result_df= pd.read_sql('SELECT * FROM all_data_predictions LIMIT '+str(limit)+' OFFSET '+str(start), engine)
            
            result_df= result_df.to_json(orient='records')

            connection.close()
            return result_df

        except:

            return make_response(400)
        
class GetModalData(Resource):

    def get(self, id):
        
        engine = create_engine(connect)
        connection = engine.connect()
        
        customer_df = pd.read_sql('SELECT * FROM all_data_predictions', connection)
        customer_df = customer_df[customer_df['index'] == int(id)]
        customer_json = customer_df.to_json(orient='records')
        
        connection.close()

        return customer_json
        
class ModifyLabel(Resource):
    
    def get(self, id, label):

        label_str = str(label).lower()

        engine = create_engine(connect)
        connection = engine.connect()
        
        predictions_df = pd.read_sql('SELECT * FROM all_data_predictions', connection)
        
        attack_value = 1 if label_str == "true" else 0
        predictions_df.loc[predictions_df['index'] == id, 'Label'] = attack_value

        print("CLEARED")

        drop_table_query = text('DROP TABLE IF EXISTS all_data_predictions')
        connection.execute(drop_table_query)
        connection.commit()

        predictions_df.to_sql(
            'all_data_predictions',
            con=engine,
            index=False,
            if_exists='replace',
            chunksize=70000
        )
        
        connection.close()
        
        return Response(status=200)

# class ModifyLabel(Resource):
    
#     def get(self, id, label):
#         label_str = str(label).lower()

#         engine = create_engine(connect)
#         connection = engine.connect()
        
#         attack_value = 1 if label_str == "true" else 0

#         # Update the single row in the database
#         update_query = text('UPDATE all_data_predictions SET "Label" = :attack_value WHERE "index" = :id')
#         connection.execute(update_query, {'attack_value': attack_value, 'id': id})
        
#         connection.commit()
#         connection.close()
        
#         return Response(status=200)
class GetFilteredPredictions(Resource):

    def get(self, column, operator, value):

        engine = create_engine(connect)
        connection = engine.connect()
        
        filtered_df= pd.read_sql('SELECT * FROM all_data_predictions', engine)

        if column == 'TX_CATEGORY':

            filtered_df = filtered_df[filtered_df[column] == value]
            filtered_df=filtered_df.sort_values('TX_FRAUD',ascending=False)

            drop_table_query = text('DROP TABLE IF EXISTS model_predictions')
            connection.execute(drop_table_query)
            connection.commit()

            filtered_df.to_sql(

                            'model_predictions', 
                            con=engine, 
                            index=False, 
                            if_exists='replace'
                        )
                    
            connection.close()
            return filtered_df.to_json(orient='records')

        elif operator == "=":

            filtered_df = filtered_df[filtered_df[column] == float(value)]
            filtered_df=filtered_df.sort_values('TX_FRAUD',ascending=False)

            drop_table_query = text('DROP TABLE IF EXISTS model_predictions')
            connection.execute(drop_table_query)
            connection.commit()

            filtered_df.to_sql(

                            'model_predictions', 
                            con=engine, 
                            index=False, 
                            if_exists='replace'
                        )        
            
            connection.close()
            return filtered_df.to_json(orient='records')

        elif operator == "<=":

            filtered_df = filtered_df[filtered_df[column] <= float(value)]
            filtered_df=filtered_df.sort_values('TX_FRAUD',ascending=False)

            drop_table_query = text('DROP TABLE IF EXISTS model_predictions')
            connection.execute(drop_table_query)
            connection.commit()

            filtered_df.to_sql(

                            'model_predictions', 
                            con=engine, 
                            index=False, 
                            if_exists='replace'
                        )  
                  
            connection.close()
            return filtered_df.to_json(orient='records')

        elif operator == ">=":

            filtered_df = filtered_df[filtered_df[column] >= float(value)]
            filtered_df=filtered_df.sort_values('TX_FRAUD',ascending=False)

            drop_table_query = text('DROP TABLE IF EXISTS model_predictions')
            connection.execute(drop_table_query)
            connection.commit()

            filtered_df.to_sql(

                            'model_predictions', 
                            con=engine, 
                            index=False, 
                            if_exists='replace'
                        )   
                 
            connection.close()
            return filtered_df.to_json(orient='records')

        elif operator == "<":

            filtered_df = filtered_df[filtered_df[column] < float(value)]
            filtered_df=filtered_df.sort_values('TX_FRAUD',ascending=False)

            drop_table_query = text('DROP TABLE IF EXISTS model_predictions')
            connection.execute(drop_table_query)
            connection.commit()

            filtered_df.to_sql(

                            'model_predictions', 
                            con=engine, 
                            index=False, 
                            if_exists='replace'
                        )   
                 
            connection.close()
            return filtered_df.to_json(orient='records')

        elif operator == ">":

            filtered_df = filtered_df[filtered_df[column] > float(value)]
            filtered_df=filtered_df.sort_values('TX_FRAUD',ascending=False)

            drop_table_query = text('DROP TABLE IF EXISTS model_predictions')
            connection.execute(drop_table_query)
            connection.commit()

            filtered_df.to_sql(

                            'model_predictions', 
                            con=engine, 
                            index=False, 
                            if_exists='replace'
                        ) 

            connection.close()
            return filtered_df.to_json(orient='records')

        else:

            connection.close()
            return make_response(400)
        
class SortPredictions(Resource):

        def get(self, sort):

            engine = create_engine(connect)
            connection = engine.connect()

            if sort == 'default':

                transactions_df= pd.read_sql('SELECT * FROM model_predictions_default', engine)

                drop_table_query = text('DROP TABLE IF EXISTS model_predictions')
                connection.execute(drop_table_query)
                connection.commit() 

                transactions_df.to_sql(

                            'model_predictions', 
                            con=engine, 
                            index=False, 
                            if_exists='replace'
                        )
                
                connection.close()
                return Response(status = 200)

            else:

                transactions_df= pd.read_sql('SELECT * FROM model_predictions_default', engine)
                transactions_df=transactions_df.sort_values(str(sort),ascending=False)

                try:

                    drop_table_query = text('DROP TABLE IF EXISTS model_predictions')
                    connection.execute(drop_table_query)
                    connection.commit()

                    transactions_df.to_sql(

                                'model_predictions', 
                                con=engine, 
                                index=False, 
                                if_exists='replace'
                                
                            )
                    
                    connection.close()
                    
                except ValueError as error:

                    connection.close()
                    print(error)
                    return make_response({"error": str(error)}, 400)
            
            
                return Response(status = 200)
        
#//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class GetTotalPages(Resource):
    
        def get(self, limit, table):

            engine = create_engine(connect)
            connection = engine.connect() 

            if table == 1:
        
                count_query = text("SELECT COUNT(*) FROM all_data_predictions")
                count = connection.execute(count_query).scalar()

                total_pages = math.ceil(count / int(limit))

                response={
                    "total_pages": total_pages
                }

                connection.close()
                return jsonify(response)
                    
            elif table == 2:

                count_query = text("SELECT COUNT(*) FROM model_predictions")
                count = connection.execute(count_query).scalar()

                total_pages = math.ceil(count / int(limit))

                response={
                    "total_pages": total_pages
                }

                connection.close()
                return jsonify(response)
            
            elif table == 3:
        
                count_query = text("SELECT COUNT(*) FROM customer_profile")
                count = connection.execute(count_query).scalar()

                total_pages = math.ceil(count / int(limit))

                response={
                    "total_pages": total_pages
                }

                connection.close()
                return jsonify(response)
                    
            elif table == 4:

                count_query = text("SELECT COUNT(*) FROM terminal_profile")
                count = connection.execute(count_query).scalar()

                total_pages = math.ceil(count / int(limit))

                response={
                    "total_pages": total_pages
                }

                connection.close()
                return jsonify(response)
            
            elif table == 5:

                count_query = text("SELECT COUNT(*) FROM threshold_based_metrics")
                count = connection.execute(count_query).scalar()

                total_pages = math.ceil(count / int(limit))

                response={
                    "total_pages": total_pages
                }

                connection.close()
                return jsonify(response)

            elif table == 6:

                count_query = text("SELECT COUNT(*) FROM threshold_free_metrics")
                count = connection.execute(count_query).scalar()

                total_pages = math.ceil(count / int(limit))

                response={
                    "total_pages": total_pages
                }

                connection.close()
                return jsonify(response)
            
            else:
                
                connection.close()
                return make_response(400)


