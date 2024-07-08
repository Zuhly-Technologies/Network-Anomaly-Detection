from sklearn import metrics
from sklearn.discriminant_analysis import QuadraticDiscriminantAnalysis as QDA
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.metrics import average_precision_score, confusion_matrix, f1_score, recall_score, precision_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.tree import DecisionTreeClassifier
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
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

result = "./results/results_1.csv" # a CSV file is named in which the results are saved.
csv_files = os.listdir("./attacks/") # CSV files names: #The names of the files in the attacks folder are taken and assigned to a list (csv_files).
path = "./attacks/"
repetition = 10

def folder(f_name): # this function creates a folder named "results" and "result_graph_1" in the program directory.
    try:
        if not os.path.exists(f_name):
            os.makedirs(f_name)
    except OSError:
        print("The folder could not be created!")

def format_table_name(name):
    return name.lower().replace(" ", "_").replace("-", "_")

def find_optimal_threshold(y_true, y_pred_prob):
    thresholds = np.linspace(0, 1, 100)
    # thresholds = np.arange(0.0, 1.0, 0.01)
    f1_scores = [f1_score(y_true, y_pred_prob >= t) for t in thresholds]
    optimal_idx = np.argmax(f1_scores)
    return thresholds[optimal_idx], f1_scores[optimal_idx]

def AttackMetrics():

    folder_name = "./results/"
    folder(folder_name)
    folder_name = "./results/result_graph_1/"
    folder(folder_name)

    # The machine learning algorithms to be used are defined in a dictionary (ml_list).
    ml_list = {
        "Naive Bayes": GaussianNB(),
        "QDA": QDA(),
        "Random Forest": RandomForestClassifier(max_depth=5, n_estimators=10, max_features=1),
        "ID3": DecisionTreeClassifier(max_depth=5, criterion="entropy"),
        # "AdaBoost": AdaBoostClassifier(),
        # "MLP": MLPClassifier(hidden_layer_sizes=(13,13,13),max_iter=500),
        # "Nearest Neighbors": KNeighborsClassifier(3)
    }

    # the features to be used for each attack type is defined in a dictionary(features).
    # the first 4 of the features created by the file "04_1_feature_selection_for_attack_files.py" are used here.
    features = {
        "Bot": ["Bwd Packet Length Mean", "Flow IAT Max", "Flow Duration", "Flow IAT Min", "Label"],
        "DDoS": ["Bwd Packet Length Std", "Total Backward Packets", "Fwd IAT Total", "Flow Duration", "Label"],
        "DoS GoldenEye": ["Flow IAT Max", "Bwd Packet Length Std", "Flow IAT Min", "Total Backward Packets", "Label"],
        "DoS Hulk": ["Bwd Packet Length Std", "Fwd Packet Length Std", "Fwd Packet Length Max", "Flow IAT Min", "Label"],
        "DoS Slowhttptest": ["Flow IAT Mean", "Fwd Packet Length Min", "Bwd Packet Length Mean", "Total Length of Bwd Packets", "Label"],
        "DoS slowloris": ["Flow IAT Mean", "Total Length of Bwd Packets", "Bwd Packet Length Mean", "Total Fwd Packets", "Label"],
        "FTP-Patator": ["Fwd Packet Length Max", "Fwd Packet Length Std", "Fwd Packet Length Mean", "Bwd Packet Length Std", "Label"],
        "Heartbleed": ["Total Backward Packets", "Fwd Packet Length Max", "Flow IAT Min", "Bwd Packet Length Max", "Label"],
        "Infiltration": ["Fwd Packet Length Max", "Fwd Packet Length Mean", "Flow Duration", "Total Length of Fwd Packets", "Label"],
        "PortScan": ["Flow Bytes/s", "Total Length of Fwd Packets", "Fwd IAT Total", "Flow Duration", "Label"],
        "SSH-Patator": ["Fwd Packet Length Max", "Flow Duration", "Flow IAT Max", "Total Length of Fwd Packets", "Label"],
        "Web Attack": ["Bwd Packet Length Std", "Total Length of Fwd Packets", "Flow Bytes/s", "Flow IAT Max", "Label"]
    }

    seconds = time.time() # time stamp for all processing time

    with open(result, "w", newline="", encoding="utf-8") as f: # a CSV file is created to save the results obtained.
        wrt = csv.writer(f)
        wrt.writerow(["File", "ML algorithm", "accuracy", "Precision", "Recall", "F1-score", "Time", "Optimal Threshold", "F1-score at Optimal Threshold"])

    for j in csv_files: # this loop runs on the list containing the filenames. Operations are repeated for all attack files
        print('%-17s %-17s  %-15s %-15s %-15s %-15s %-15s' % ("File", "ML algorithm", "accuracy", "Precision", "Recall", "F1-score", "Time")) # print output header
        a = []
        
        feature_list = list(features[j[0:-4]])
        df = pd.read_csv(path + j, usecols = feature_list) # read an attack file.
        df = df.fillna(0)
        attack_or_not = []
        for i in df["Label"]: # it changes the normal label to "1" and the attack tag to "0" for use in the machine learning algorithm
            if i == "BENIGN":
                attack_or_not.append(1)
            else:
                attack_or_not.append(0)           
        df["Label"] = attack_or_not

        y = df["Label"] # this section separates the label and the data into two separate pieces, as Label=y Data=X 
        del df["Label"]
        feature_list.remove('Label')
        X = df[feature_list]

        results = []

        for ii in ml_list: # this loop runs on the list containing the machine learning algorithm names. Operations are repeated for all the 7 algorithm
            precision = []
            recall = []
            f1 = []
            accuracy = []
            t_time = []
            opt_thresholds = []
            f1_opt_thresholds = []

            for i in range(repetition): # This loop allows cross-validation and machine learning algorithm to be repeated 10 times
                second = time.time() # time stamp for processing time

                # cross-validation
                X_train, X_test, y_train, y_test = train_test_split(X, y, # data (X) and labels (y) are divided into 2 parts to be sent to the machine learning algorithm (80% train, 20% test). 
                    test_size = 0.20, random_state = repetition) # So, in total there are 4 tracks: training data(X_train), training tag (y_train), test data(X_test) and test tag(y_test).

                # Check if there are at least 2 classes in y_train and y_test
                unique_train = np.unique(y_train)
                unique_test = np.unique(y_test)
                if len(unique_train) < 2 or len(unique_test) < 2:
                    print(f"Skipping {ii} for {j} due to insufficient class diversity. Classes in train: {unique_train}, Classes in test: {unique_test}")
                    continue

                # Check if any class has only one sample
                if any(np.sum(y_train == cls) < 2 for cls in unique_train) or any(np.sum(y_test == cls) < 2 for cls in unique_test):
                    print(f"Skipping {ii} for {j} due to insufficient samples in one or more classes.")
                    continue

                # machine learning algorithm is applied in this section
                clf = ml_list[ii] # choose algorithm from ml_list dictionary                                                                          
                clf.fit(X_train, y_train)
                predict_proba = clf.predict_proba(X_test)[:, 1]  # Probabilities for the positive class
                predict = clf.predict(X_test)
            
                # Calculate optimal threshold and corresponding F1-score
                opt_threshold, f1_opt = find_optimal_threshold(y_test, predict_proba)
                opt_thresholds.append(opt_threshold)
                f1_opt_thresholds.append(f1_opt)

                # Calculate metrics at default threshold
                f_1 = f1_score(y_test, predict, average='macro')
                pr = precision_score(y_test, predict, average='macro')
                rc = recall_score(y_test, predict, average='macro')

                precision.append(float(pr))
                recall.append(float(rc))
                f1.append(float(f_1))
                accuracy.append(clf.score(X_test, y_test))
                t_time.append(float((time.time() - second)))

            if precision:  # Check if precision is not empty before proceeding
                avg_accuracy = np.mean(accuracy)
                avg_precision = np.mean(precision)
                avg_recall = np.mean(recall)
                avg_f1 = np.mean(f1)
                avg_time = np.mean(t_time)
                avg_opt_threshold = np.mean(opt_thresholds)
                avg_f1_opt_threshold = np.mean(f1_opt_thresholds)

                results.append([j[0:-4], ii, avg_accuracy, avg_precision, avg_recall, avg_f1, avg_time, avg_opt_threshold, avg_f1_opt_threshold])
                
                print('%-17s %-17s  %-15s %-15s %-15s %-15s %-15s' % (j[0:-4], ii, str(round(avg_accuracy, 2)), str(round(avg_precision, 2)), 
                    str(round(avg_recall, 2)), str(round(avg_f1, 2)), str(round(avg_time, 4)))) # the result of the ten repetitions is printed on the screen

        if results:
            df_results = pd.DataFrame(results, columns=["Attack", "ML algorithm", "accuracy", "Precision", "Recall", "F1-score", "Time", "Optimal Threshold", "F1-score at Optimal Threshold"])
            df_results = df_results.round(3)  # Round all values to 3 decimal places
            table_name = format_table_name(j[0:-4])  # Format the table name
            df_results.to_sql(table_name, engine, if_exists='replace', index=False)

            with open(result, "a", newline="", encoding="utf-8") as f: # all the values found are saved in the opened file.
                wrt = csv.writer(f)
                wrt.writerows(df_results.values.tolist())  # Convert DataFrame to list of lists before writing to CSV

        # In this section, Box graphics are created for the results of machine learning algorithms and saved in the feature_graph folder.
        # ml = ["Naive Bayes", "QDA", "Random Forest", "ID3", "AdaBoost", "MLP", "Nearest Neighbors"]
        ml = ["Naive Bayes", "QDA", "Random Forest", "ID3"]
        temp = 0
        fig, axes = plt.subplots(nrows=2, ncols=4, figsize=(12, 6), sharey=True)
        for c in range(2):
            for b in range(4):
                if temp >= len(a): # check if temp is within bounds
                    break
                axes[c, b].boxplot(a[temp])
                axes[c, b].set_title(str(j[0:-4]) + " - " + str(ml[temp]), fontsize=7)
                axes[c, b].set_ylabel(("F measure"))
                temp += 1
                if temp == 4:
                    break
            if temp == 4:
                break
        plt.savefig(folder_name + j[0:-4] + ".pdf", bbox_inches='tight', format = 'pdf')
        plt.show()
        print("\n------------------------------------------------------------------------------------------------------\n\n")

    print("Total operation time: = ", time.time()- seconds ,"seconds")


