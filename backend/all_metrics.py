from sklearn import metrics
from sklearn.discriminant_analysis import QuadraticDiscriminantAnalysis as QDA
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.metrics import f1_score, recall_score, precision_score, roc_curve
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.tree import DecisionTreeClassifier
from joblib import Parallel, delayed
import matplotlib.pyplot as plt
import numpy as np
import os
import pandas as pd
import dask.dataframe as dd
import csv
import time
import warnings
import math
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

warnings.filterwarnings("ignore")

# Database connection
# Load environment variables from .env file
load_dotenv()

# Access variables
host = os.getenv("HOST")
database = os.getenv("DATABASE")
usr = os.getenv("USR")
password = os.getenv("PASSWORD")
port = os.getenv("PORT")
engine = create_engine(f'postgresql://{usr}:{password}@{host}:{port}/{database}')

result = "./results/results_2.csv"
csv_files = ["all_data.csv"]
path = ""
repetition = 1

def folder(f_name):
    try:
        if not os.path.exists(f_name):
            os.makedirs(f_name)
    except OSError:
        print("The folder could not be created!")

def calculate_optimal_threshold(predict_proba, y_test):
    thresholds = np.arange(0.0, 1.0, 0.01)
    # thresholds = np.arange(0.5)
    f1_scores = [f1_score(y_test, (predict_proba >= t).astype(int)) for t in thresholds]
    optimal_idx = np.argmax(f1_scores)
    optimal_threshold = thresholds[optimal_idx]
    return optimal_threshold, f1_scores[optimal_idx]

# def AllMetrics():

#     folder_name = "./results/"
#     folder(folder_name)
#     folder_name = "./results/result_graph_2/"
#     folder(folder_name)

#     ml_list = {
#         "Naive Bayes": GaussianNB(),
#         "QDA": QDA(),
#         "Random Forest": RandomForestClassifier(max_depth=5, n_estimators=10, max_features=1),
#         "ID3": DecisionTreeClassifier(max_depth=5, criterion="entropy"),
#         # "AdaBoost": AdaBoostClassifier(),
#         # "MLP": MLPClassifier(hidden_layer_sizes=(13,13,13), max_iter=500),
#         # "Nearest Neighbors": KNeighborsClassifier(3)
#     }

#     features = {"all_data": ["Bwd Packet Length Max","Bwd Packet Length Mean","Bwd Packet Length Std","Flow Bytes/s",
#     "Flow Duration","Flow IAT Max","Flow IAT Mean","Flow IAT Min","Flow IAT Std","Fwd IAT Total","Fwd Packet Length Max",
#     "Fwd Packet Length Mean","Fwd Packet Length Min","Fwd Packet Length Std","Total Backward Packets","Total Fwd Packets",
#     "Total Length of Bwd Packets","Total Length of Fwd Packets","Label"]}

#     seconds = time.time()

#     with open(result, "w", newline="", encoding="utf-8") as f:
#         wrt = csv.writer(f)
#         wrt.writerow(["File", "ML algorithm", "accuracy", "Precision", "Recall", "F1-score", "Time", "Optimal Threshold", "F1-score at Optimal Threshold"])

#     def process_file(j):
#         print('%-17s %-17s  %-15s %-15s %-15s %-15s %-15s %-20s %-25s' % ("File","ML algorithm","accuracy","Precision", "Recall" , "F1-score","Time", "Optimal Threshold", "F1-score at Optimal Threshold"))
#         feature_list = list(features[j[0:-4]])
        
#         # Dask
#         df = dd.read_csv(path + j, usecols=feature_list).fillna(0).compute()
        
#         # Convert labels to binary values for machine learning
#         attack_or_not = df["Label"].apply(lambda x: 1 if x == "BENIGN" else 0)
#         df["Label"] = attack_or_not
#         y = df["Label"]
#         X = df.drop(columns=["Label"])

#         results = []
#         for ii in ml_list:
#             def run_model(i):
#                 second = time.time()
#                 X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=repetition)
#                 # print(ml_list[ii])
#                 clf = ml_list[ii]
#                 clf.fit(X_train, y_train)
#                 predict_proba = clf.predict_proba(X_test)[:, 1]
#                 # print(predict_proba)

#                 # Calculate F1-score for default threshold (0.5)
#                 predict = (predict_proba >= 0.5).astype(int)
#                 f_1_default = f1_score(y_test, predict, average='macro')
#                 pr = precision_score(y_test, predict, average='macro')
#                 rc = recall_score(y_test, predict, average='macro')

#                 # Calculate optimal threshold using F1-score
#                 optimal_threshold, f_1_optimal = calculate_optimal_threshold(predict_proba, y_test)

#                 # print(clf.score(X_test, y_test), pr, rc, f_1_default, time.time() - second, optimal_threshold, f_1_optimal)

#                 return clf.score(X_test, y_test), pr, rc, f_1_default, time.time() - second, optimal_threshold, f_1_optimal, predict_proba

#             # Limit the number of parallel jobs to manage memory usage
#             scores = Parallel(n_jobs=5)(delayed(run_model)(i) for i in range(repetition))
#             accuracy, precision, recall, f1_default, t_time, optimal_threshold, f1_optimal,predict_proba = zip(*scores)

#             print(predict_proba)

#             print("AVERAGINNG SCORES")
#             avg_accuracy = np.mean(accuracy)
#             avg_precision = np.mean(precision)
#             avg_recall = np.mean(recall)
#             avg_f1_default = np.mean(f1_default)
#             avg_time = np.mean(t_time)
#             avg_optimal_threshold = np.mean(optimal_threshold)
#             avg_f1_optimal = np.mean(f1_optimal)
#             avg_predictions = np.mean(predict_proba)

#             print(avg_predictions)

#             results.append([j[0:-4], ii, round(avg_accuracy, 3), round(avg_precision, 3), round(avg_recall, 3), round(avg_f1_default, 3), round(avg_time, 3), round(avg_optimal_threshold, 3), round(avg_f1_optimal, 3)])

#             print('%-17s %-17s  %-15s %-15s %-15s %-15s %-15s %-20s %-25s' % (j[0:-4], ii, round(avg_accuracy, 3), round(avg_precision, 3), 
#                 round(avg_recall, 3), round(avg_f1_default, 3), round(avg_time, 3), round(avg_optimal_threshold, 3), round(avg_f1_optimal, 3)))

#         if results:
#             df_results = pd.DataFrame(results, columns=["Attack", "ML algorithm", "accuracy", "Precision", "Recall", "F1-score", "Time", "Optimal Threshold", "F1-score at Optimal Threshold"])
#             df_results.to_sql("all_data", engine, if_exists='replace', index=False)

#             with open(result, "a", newline="", encoding="utf-8") as f:
#                 wrt = csv.writer(f)
#                 wrt.writerows(results)

#     for j in csv_files:
#         process_file(j)

#     print("Total operation time: = ", time.time() - seconds, "seconds")

def AllMetrics():

    folder_name = "./results/"
    folder(folder_name)
    folder_name = "./results/result_graph_2/"
    folder(folder_name)

    ml_list = {
        "Naive Bayes": GaussianNB(),
        "QDA": QDA(),
        "Random Forest": RandomForestClassifier(max_depth=5, n_estimators=10, max_features=1),
        "ID3": DecisionTreeClassifier(max_depth=5, criterion="entropy"),
        # "AdaBoost": AdaBoostClassifier(),
        # "MLP": MLPClassifier(hidden_layer_sizes=(13,13,13), max_iter=500),
        # "Nearest Neighbors": KNeighborsClassifier(3)
    }

    features = {"all_data": ["Bwd Packet Length Max","Bwd Packet Length Mean","Bwd Packet Length Std","Flow Bytes/s",
    "Flow Duration","Flow IAT Max","Flow IAT Mean","Flow IAT Min","Flow IAT Std","Fwd IAT Total","Fwd Packet Length Max",
    "Fwd Packet Length Mean","Fwd Packet Length Min","Fwd Packet Length Std","Total Backward Packets","Total Fwd Packets",
    "Total Length of Bwd Packets","Total Length of Fwd Packets","Label"]}

    seconds = time.time()

    with open(result, "w", newline="", encoding="utf-8") as f:
        wrt = csv.writer(f)
        wrt.writerow(["File", "ML algorithm", "accuracy", "Precision", "Recall", "F1-score", "Time", "Optimal Threshold", "F1-score at Optimal Threshold"])

    all_probabilities = pd.DataFrame()  
    test_data = pd.DataFrame()  

    def process_file(j):
        nonlocal all_probabilities, test_data  # Declare nonlocal variable to modify it inside the nested function
        print('%-17s %-17s  %-15s %-15s %-15s %-15s %-15s %-20s %-25s' % ("File","ML algorithm","accuracy","Precision", "Recall" , "F1-score","Time", "Optimal Threshold", "F1-score at Optimal Threshold"))
        feature_list = list(features[j[0:-4]])
        
        # Dask
        df = dd.read_csv(path + j, usecols=feature_list).fillna(0).compute()
        
        # Convert labels to binary values for machine learning
        attack_or_not = df["Label"].apply(lambda x: 1 if x == "BENIGN" else 0)
        df["Label"] = attack_or_not
        y = df["Label"]
        X = df.drop(columns=["Label"])

        X_Train, X_Test, y_Train, y_Test = train_test_split(X, y, test_size=0.20, random_state=repetition)
        test_data = X_Test
        print(X_Test,"\n////////////////////////////////////////////////////////////////////")

        results = []

        for ii in ml_list:
            def run_model(i):
                second = time.time()
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=repetition)
                print(X_test)
                clf = ml_list[ii]
                clf.fit(X_train, y_train)
                predict_proba = clf.predict_proba(X_test)[:, 1]

                # Calculate F1-score for default threshold (0.5)
                predict = (predict_proba >= 0.5).astype(int)
                f_1_default = f1_score(y_test, predict, average='macro')
                pr = precision_score(y_test, predict, average='macro')
                rc = recall_score(y_test, predict, average='macro')

                # Calculate optimal threshold using F1-score
                optimal_threshold, f_1_optimal = calculate_optimal_threshold(predict_proba, y_test)

                return clf.score(X_test, y_test), pr, rc, f_1_default, time.time() - second, optimal_threshold, f_1_optimal, predict_proba

            # Limit the number of parallel jobs to manage memory usage
            scores = Parallel(n_jobs=5)(delayed(run_model)(i) for i in range(repetition))

            accuracy, precision, recall, f1_default, t_time, optimal_threshold, f1_optimal, predict_proba = zip(*scores)

            # Stack the predict_proba arrays into a 2D array
            predict_proba = np.vstack(predict_proba)

            # Average the probabilities along the columns
            avg_predict_proba = np.mean(predict_proba, axis=0)

            # Convert averaged probabilities to DataFrame and round to 5 decimal places
            df_avg_proba = pd.DataFrame(avg_predict_proba, columns=[ii]).round(5)

            # Concatenate with all_probabilities DataFrame
            all_probabilities = pd.concat([all_probabilities, df_avg_proba], axis=1)

            avg_accuracy = np.mean(accuracy)
            avg_precision = np.mean(precision)
            avg_recall = np.mean(recall)
            avg_f1_default = np.mean(f1_default)
            avg_time = np.mean(t_time)
            avg_optimal_threshold = np.mean(optimal_threshold)
            avg_f1_optimal = np.mean(f1_optimal)

            results.append([j[0:-4], ii, round(avg_accuracy, 3), round(avg_precision, 3), round(avg_recall, 3), round(avg_f1_default, 3), round(avg_time, 3), round(avg_optimal_threshold, 3), round(avg_f1_optimal, 3)])

            print('%-17s %-17s  %-15s %-15s %-15s %-15s %-15s %-20s %-25s' % (j[0:-4], ii, round(avg_accuracy, 3), round(avg_precision, 3), 
                round(avg_recall, 3), round(avg_f1_default, 3), round(avg_time, 3), round(avg_optimal_threshold, 3), round(avg_f1_optimal, 3)))

        if results:
            df_results = pd.DataFrame(results, columns=["Attack", "ML algorithm", "accuracy", "Precision", "Recall", "F1-score", "Time", "Optimal Threshold", "F1-score at Optimal Threshold"])
            df_results.to_sql("all_data", engine, if_exists='replace', index=False)

            with open(result, "a", newline="", encoding="utf-8") as f:
                wrt = csv.writer(f)
                wrt.writerows(results)

    for j in csv_files:
        process_file(j)

    print("Total operation time: = ", time.time() - seconds, "seconds")

    # Concatenate the test_data and all_probabilities DataFrames
    # final_data = pd.concat([test_data.reset_index(drop=True), all_probabilities.reset_index(drop=True)], axis=1)

    # print(final_data)

    # Save final data to a CSV file
    # final_data.to_sql("all_data_predictions", engine, if_exists='replace', index=False, chunksize=70000)


def GetAllDataPredictions():

    ml_list = {
        "Naive Bayes": GaussianNB(),
        "QDA": QDA(),
        "Random Forest": RandomForestClassifier(max_depth=5, n_estimators=10, max_features=1),
        "ID3": DecisionTreeClassifier(max_depth=5, criterion="entropy"),
        # "AdaBoost": AdaBoostClassifier(),
        # "MLP": MLPClassifier(hidden_layer_sizes=(13,13,13), max_iter=500),
        # "Nearest Neighbors": KNeighborsClassifier(3)
    }

    features = {"all_data": ["Bwd Packet Length Max","Bwd Packet Length Mean","Bwd Packet Length Std","Flow Bytes/s",
    "Flow Duration","Flow IAT Max","Flow IAT Mean","Flow IAT Min","Flow IAT Std","Fwd IAT Total","Fwd Packet Length Max",
    "Fwd Packet Length Mean","Fwd Packet Length Min","Fwd Packet Length Std","Total Backward Packets","Total Fwd Packets",
    "Total Length of Bwd Packets","Total Length of Fwd Packets","Label"]}

    seconds = time.time()

    with open(result, "w", newline="", encoding="utf-8") as f:
        wrt = csv.writer(f)
        wrt.writerow(["File", "ML algorithm", "accuracy", "Precision", "Recall", "F1-score", "Time", "Optimal Threshold", "F1-score at Optimal Threshold"])

    all_probabilities = pd.DataFrame()  
    test_data = pd.DataFrame()  
    test_labels = pd.DataFrame()

    def process_file(j):
        nonlocal all_probabilities, test_data, test_labels  # Declare nonlocal variable to modify it inside the nested function
        print('%-17s %-17s  %-15s %-15s %-15s %-15s %-15s %-20s %-25s' % ("File","ML algorithm","accuracy","Precision", "Recall" , "F1-score","Time", "Optimal Threshold", "F1-score at Optimal Threshold"))
        feature_list = list(features[j[0:-4]])
        
        # Dask
        df = dd.read_csv(path + j, usecols=feature_list).fillna(0).compute()
        
        # Convert labels to binary values for machine learning
        attack_or_not = df["Label"].apply(lambda x: 1 if x == "BENIGN" else 0)
        df["Label"] = attack_or_not
        y = df["Label"]
        X = df.drop(columns=["Label"])

        X_Train, X_Test, y_Train, y_Test = train_test_split(X, y, test_size=0.20, random_state=repetition)
        test_data = X_Test
        test_labels["Label"] = y_Test
        print(y_Test,"\n////////////////////////////////////////////////////////////////////")

        results = []

        for ii in ml_list:
            def run_model(i):
                second = time.time()
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=repetition)
                print(X_test)
                clf = ml_list[ii]
                clf.fit(X_train, y_train)
                predict_proba = clf.predict_proba(X_test)[:, 1]

                # Calculate F1-score for default threshold (0.5)
                predict = (predict_proba >= 0.5).astype(int)
                f_1_default = f1_score(y_test, predict, average='macro')
                pr = precision_score(y_test, predict, average='macro')
                rc = recall_score(y_test, predict, average='macro')

                # Calculate optimal threshold using F1-score
                optimal_threshold, f_1_optimal = calculate_optimal_threshold(predict_proba, y_test)

                return clf.score(X_test, y_test), pr, rc, f_1_default, time.time() - second, optimal_threshold, f_1_optimal, predict_proba

            # Limit the number of parallel jobs to manage memory usage
            scores = Parallel(n_jobs=5)(delayed(run_model)(i) for i in range(repetition))

            accuracy, precision, recall, f1_default, t_time, optimal_threshold, f1_optimal, predict_proba = zip(*scores)

            # Stack the predict_proba arrays into a 2D array
            predict_proba = np.vstack(predict_proba)

            # Average the probabilities along the columns
            avg_predict_proba = np.mean(predict_proba, axis=0)

            # Convert averaged probabilities to DataFrame and round to 5 decimal places
            df_avg_proba = pd.DataFrame(avg_predict_proba, columns=[ii]).round(5)

            # Concatenate with all_probabilities DataFrame
            all_probabilities = pd.concat([all_probabilities, df_avg_proba], axis=1)

    for j in csv_files:
        process_file(j)

    print("Total operation time: = ", time.time() - seconds, "seconds")

    # Concatenate the test_data, test_labels, and all_probabilities DataFrames
    final_data = pd.concat([test_data.reset_index(drop=False), test_labels.reset_index(drop=False), all_probabilities.reset_index(drop=False)], axis=1)

    print(final_data)

    # Save final data to a SQL table
    final_data.to_sql("all_data_predictions", engine, if_exists='replace', index=False, chunksize=70000)
