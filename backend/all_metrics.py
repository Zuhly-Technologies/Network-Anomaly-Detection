from sklearn import metrics
from sklearn.discriminant_analysis import QuadraticDiscriminantAnalysis as QDA
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.metrics import f1_score, recall_score, precision_score
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
repetition = 10

def folder(f_name):
    try:
        if not os.path.exists(f_name):
            os.makedirs(f_name)
    except OSError:
        print("The folder could not be created!")

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
        wrt.writerow(["File", "ML algorithm", "accuracy", "Precision", "Recall", "F1-score", "Time"])

    def process_file(j):
        print('%-17s %-17s  %-15s %-15s %-15s %-15s %-15s' % ("File","ML algorithm","accuracy","Precision", "Recall" , "F1-score","Time"))
        feature_list = list(features[j[0:-4]])
        
        # Dask
        df = dd.read_csv(path + j, usecols=feature_list).fillna(0).compute()
        
        # Convert labels to binary values for machine learning
        attack_or_not = df["Label"].apply(lambda x: 1 if x == "BENIGN" else 0)
        df["Label"] = attack_or_not
        y = df["Label"]
        X = df.drop(columns=["Label"])

        results = []
        for ii in ml_list:
            def run_model(i):
                second = time.time()
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=repetition)
                clf = ml_list[ii]
                clf.fit(X_train, y_train)
                predict = clf.predict(X_test)
                f_1 = f1_score(y_test, predict, average='macro')
                pr = precision_score(y_test, predict, average='macro')
                rc = recall_score(y_test, predict, average='macro')
                return clf.score(X_test, y_test), pr, rc, f_1, time.time() - second

            # Limit the number of parallel jobs to manage memory usage
            scores = Parallel(n_jobs=4)(delayed(run_model)(i) for i in range(repetition))
            accuracy, precision, recall, f1, t_time = zip(*scores)

            avg_accuracy = np.mean(accuracy)
            avg_precision = np.mean(precision)
            avg_recall = np.mean(recall)
            avg_f1 = np.mean(f1)
            avg_time = np.mean(t_time)

            results.append([j[0:-4], ii, round(avg_accuracy, 3), round(avg_precision, 3), round(avg_recall, 3), round(avg_f1, 3), round(avg_time, 3)])

            print('%-17s %-17s  %-15s %-15s %-15s %-15s %-15s' % (j[0:-4], ii, round(avg_accuracy, 3), round(avg_precision, 3), 
                round(avg_recall, 3), round(avg_f1, 3), round(avg_time, 3)))

        if results:
            df_results = pd.DataFrame(results, columns=["Attack", "ML algorithm", "accuracy", "Precision", "Recall", "F1-score", "Time"])
            df_results.to_sql("all_data", engine, if_exists='replace', index=False)

            with open(result, "a", newline="", encoding="utf-8") as f:
                wrt = csv.writer(f)
                wrt.writerows(results)

            # Generate and save boxplots
            for algo in ml_list.keys():
                f1_scores = [result[5] for result in results if result[1] == algo]
                if f1_scores:
                    plt.boxplot(f1_scores)
                    plt.title("All Dataset - " + str(algo))
                    plt.ylabel('F-measure')
                    plt.savefig(folder_name + "all_data_" + str(algo) + ".pdf", bbox_inches='tight', format='pdf')
                    plt.show()

    for j in csv_files:
        process_file(j)

    print("Total operation time: = ", time.time() - seconds, "seconds")