import random
import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor
import time
from sklearn.ensemble import ExtraTreesClassifier
import sklearn as sk

def AttackFilter():

    # Start timing
    seconds = time.time()

    # Ensure matplotlib inline is used only in Jupyter Notebook
    # %matplotlib inline

    def folder(f_name):  # This function creates a folder named "attacks" in the program directory.
        try:
            if not os.path.exists(f_name):
                os.makedirs(f_name)
        except OSError:
            print("The folder could not be created!")

    # Create the attacks folder
    folder("./attacks/")

    print("This process may take 3 to 8 minutes, depending on the performance of your computer.\n\n\n")

    # Headers of columns
    main_labels = ["Flow ID", "Source IP", "Source Port", "Destination IP", "Destination Port", "Protocol", "Timestamp", "Flow Duration",
                "Total Fwd Packets", "Total Backward Packets", "Total Length of Fwd Packets", "Total Length of Bwd Packets",
                "Fwd Packet Length Max", "Fwd Packet Length Min", "Fwd Packet Length Mean", "Fwd Packet Length Std",
                "Bwd Packet Length Max", "Bwd Packet Length Min", "Bwd Packet Length Mean", "Bwd Packet Length Std", "Flow Bytes/s",
                "Flow Packets/s", "Flow IAT Mean", "Flow IAT Std", "Flow IAT Max", "Flow IAT Min", "Fwd IAT Total", "Fwd IAT Mean",
                "Fwd IAT Std", "Fwd IAT Max", "Fwd IAT Min", "Bwd IAT Total", "Bwd IAT Mean", "Bwd IAT Std", "Bwd IAT Max", "Bwd IAT Min",
                "Fwd PSH Flags", "Bwd PSH Flags", "Fwd URG Flags", "Bwd URG Flags", "Fwd Header Length", "Bwd Header Length",
                "Fwd Packets/s", "Bwd Packets/s", "Min Packet Length", "Max Packet Length", "Packet Length Mean", "Packet Length Std",
                "Packet Length Variance", "FIN Flag Count", "SYN Flag Count", "RST Flag Count", "PSH Flag Count", "ACK Flag Count",
                "URG Flag Count", "CWE Flag Count", "ECE Flag Count", "Down/Up Ratio", "Average Packet Size", "Avg Fwd Segment Size",
                "Avg Bwd Segment Size", "Fwd Avg Bytes/Bulk", "Fwd Avg Packets/Bulk", "Fwd Avg Bulk Rate", "Bwd Avg Bytes/Bulk",
                "Bwd Avg Packets/Bulk", "Bwd Avg Bulk Rate", "Subflow Fwd Packets", "Subflow Fwd Bytes", "Subflow Bwd Packets",
                "Subflow Bwd Bytes", "Init_Win_bytes_forward", "Init_Win_bytes_backward", "act_data_pkt_fwd", "min_seg_size_forward",
                "Active Mean", "Active Std", "Active Max", "Active Min", "Idle Mean", "Idle Std", "Idle Max", "Idle Min", "Label", "External IP"]
    main_labels = ",".join(main_labels)

    attacks = ["BENIGN", "Bot", "DDoS", "DoS GoldenEye", "DoS Hulk", "DoS Slowhttptest", "DoS slowloris", "FTP-Patator", "Heartbleed", "Infiltration",
            "PortScan", "SSH-Patator", "Web Attack – Brute Force", "Web Attack – Sql Injection", "Web Attack – XSS"]

    benign = 2359289

    dict_attack = {
        "Bot": 1966,
        "DDoS": 41835,
        "DoS GoldenEye": 10293,
        "DoS Hulk": 231073,
        "DoS Slowhttptest": 5499,
        "DoS slowloris": 5796,
        "FTP-Patator": 7938,
        "Heartbleed": 11,
        "Infiltration": 36,
        "PortScan": 158930,
        "SSH-Patator": 5897,
        "Web Attack - Brute Force": 1507,
        "Web Attack - XSS": 652,
        "Web Attack - Sql Injection": 21
    }

    for attack in dict_attack:
        attack_count = dict_attack[attack]
        benign_num = int(benign / (attack_count * (7 / 3)))
        attack_file_path = os.path.join("attacks", f"{attack}.csv")

        with open(attack_file_path, "w") as ths:
            ths.write(main_labels + "\n")
            attack_count_in_file, benign_count_in_file = 0, 0

            with open("all_data.csv", "r") as file:
                for line in file:
                    line = line.strip()
                    k = line.split(",")
                    if k[-2] == "BENIGN":
                        if random.randint(1, benign_num) == 1:
                            ths.write(line + "\n")
                            benign_count_in_file += 1
                    elif k[-2] == attack:
                        ths.write(line + "\n")
                        attack_count_in_file += 1

        print(f"{attack} file is completed\n attack: {attack_count_in_file}\n benign: {benign_count_in_file}\n\n")

    # All web attack files are merged into a single file.
    webs = ["Web Attack - Brute Force", "Web Attack - XSS", "Web Attack - Sql Injection"]
    merged_web_attacks_path = os.path.join("attacks", "Web Attack.csv")
    flag = True

    for web_attack in webs:
        web_attack_file_path = os.path.join("attacks", f"{web_attack}.csv")
        if os.path.exists(web_attack_file_path):
            df = pd.read_csv(web_attack_file_path)
            if flag:
                df.to_csv(merged_web_attacks_path, index=False)
                flag = False
            else:
                df.to_csv(merged_web_attacks_path, index=False, header=False, mode="a")
            os.remove(web_attack_file_path)

    print("operation time: = ", time.time() - seconds, "seconds")

def folder(f_name):  # This function creates a folder named "feature_pics" in the program directory.
    try:
        if not os.path.exists(f_name):
            os.makedirs(f_name)
    except OSError:
        print("The folder could not be created!")

def FeatureSelectionAttack():

    # Start timing
    seconds = time.time()

    # CSV files names:
    csv_files = os.listdir("attacks")  # It creates a list of file names in the "attacks" folder.
    print("CSV files to process:", csv_files)  # Debug print to check files

    # Headers of column
    main_labels = ["Flow Duration","Total Fwd Packets","Total Backward Packets","Total Length of Fwd Packets","Total Length of Bwd Packets",
                "Fwd Packet Length Max","Fwd Packet Length Min","Fwd Packet Length Mean","Fwd Packet Length Std","Bwd Packet Length Max",
                "Bwd Packet Length Min","Bwd Packet Length Mean","Bwd Packet Length Std","Flow Bytes/s","Flow Packets/s","Flow IAT Mean",
                "Flow IAT Std","Flow IAT Max","Flow IAT Min","Fwd IAT Total","Fwd IAT Mean","Fwd IAT Std","Fwd IAT Max","Fwd IAT Min",
                "Bwd IAT Total","Bwd IAT Mean","Bwd IAT Std","Bwd IAT Max","Bwd IAT Min","Fwd PSH Flags","Bwd PSH Flags","Fwd URG Flags",
                "Bwd URG Flags","Fwd Header Length","Bwd Header Length","Fwd Packets/s","Bwd Packets/s","Min Packet Length","Max Packet Length",
                "Packet Length Mean","Packet Length Std","Packet Length Variance","FIN Flag Count","SYN Flag Count","RST Flag Count",
                "PSH Flag Count","ACK Flag Count","URG Flag Count","CWE Flag Count","ECE Flag Count","Down/Up Ratio","Average Packet Size",
                "Avg Fwd Segment Size","Avg Bwd Segment Size","Fwd Avg Bytes/Bulk","Fwd Avg Packets/Bulk","Fwd Avg Bulk Rate","Bwd Avg Bytes/Bulk",
                "Bwd Avg Packets/Bulk","Bwd Avg Bulk Rate","Subflow Fwd Packets","Subflow Fwd Bytes","Subflow Bwd Packets","Subflow Bwd Bytes",
                "Init_Win_bytes_forward","Init_Win_bytes_backward","act_data_pkt_fwd","min_seg_size_forward","Active Mean","Active Std",
                "Active Max","Active Min","Idle Mean","Idle Std","Idle Max","Idle Min","Label"]

    ths = open("importance_list_for_attack_files.csv", "w")
    folder("./feature_pics/")

    for j in csv_files:
        file_path = os.path.join("attacks", j)
        print("Processing file:", file_path)  # Debug print to check file being processed

        try:
            df = pd.read_csv(file_path, usecols=main_labels)
            print("Read file successfully:", file_path)  # Debug print to confirm file read

            df = df.fillna(0)
            attack_or_not = []
            for i in df["Label"]:  # it changes the normal label to "1" and the attack tag to "0" for use in the machine learning algorithm
                if i == "BENIGN":
                    attack_or_not.append(1)
                else:
                    attack_or_not.append(0)
            df["Label"] = attack_or_not

            y = df["Label"].values
            del df["Label"]
            X = df.values

            X = np.float32(X)
            X[np.isnan(X)] = 0
            X[np.isinf(X)] = 0

            # computing the feature importances
            forest = RandomForestRegressor(n_estimators=250, random_state=0)
            forest.fit(X, y)
            importances = forest.feature_importances_
            std = np.std([tree.feature_importances_ for tree in forest.estimators_], axis=0)
            indices = np.argsort(importances)[::-1]
            refclasscol = list(df.columns.values)
            impor_bars = pd.DataFrame({'Features': refclasscol[0:20], 'importance': importances[0:20]})
            impor_bars = impor_bars.sort_values('importance', ascending=False).set_index('Features')
            plt.rcParams['figure.figsize'] = (10, 5)
            impor_bars.plot.bar()

            # printing the feature importances  
            count = 0
            fea_ture = j[0:-4] + "=["
            for i in impor_bars.index:
                fea_ture = fea_ture + "\"" + str(i) + "\","
                count += 1
                if count == 5:
                    fea_ture = fea_ture[0:-1] + "]"
                    break

            print(j[0:-4], "importance list:")
            print(j[0:-4], "\n", impor_bars.head(20), "\n\n\n")
            print(fea_ture)

            plt.title(j[0:-4] + " Attack - Feature Importance")
            plt.ylabel('Importance')
            plt.savefig(os.path.join("feature_pics", j[0:-4] + ".pdf"), bbox_inches='tight', format='pdf')
            ths.write(fea_ture)
            plt.tight_layout()
            plt.show()
            print("-----------------------------------------------------------------------------------------------\n\n\n\n")
        except Exception as e:
            print("Failed to process file:", file_path)
            print(e)

    print("Total operation time: = ", time.time() - seconds, "seconds")
    ths.close()


def FeatureSelectionAllData():

    seconds = time.time()

    # CSV files names:
    csv_files=["all_data.csv"] # It creates a list of file names in the "attacks" folder.

    # Headers of columns
    main_labels=["Flow Duration","Total Fwd Packets",   "Total Backward Packets","Total Length of Fwd Packets","Total Length of Bwd Packets","Fwd Packet Length Max","Fwd Packet Length Min",
    "Fwd Packet Length Mean","Fwd Packet Length Std","Bwd Packet Length Max","Bwd Packet Length Min","Bwd Packet Length Mean","Bwd Packet Length Std",
    "Flow Bytes/s","Flow Packets/s","Flow IAT Mean","Flow IAT Std","Flow IAT Max","Flow IAT Min","Fwd IAT Total","Fwd IAT Mean","Fwd IAT Std","Fwd IAT Max",
    "Fwd IAT Min","Bwd IAT Total","Bwd IAT Mean","Bwd IAT Std","Bwd IAT Max","Bwd IAT Min","Fwd PSH Flags","Bwd PSH Flags","Fwd URG Flags","Bwd URG Flags",
    "Fwd Header Length","Bwd Header Length","Fwd Packets/s","Bwd Packets/s","Min Packet Length","Max Packet Length","Packet Length Mean","Packet Length Std",
    "Packet Length Variance","FIN Flag Count","SYN Flag Count","RST Flag Count","PSH Flag Count","ACK Flag Count","URG Flag Count","CWE Flag Count",
    "ECE Flag Count","Down/Up Ratio","Average Packet Size","Avg Fwd Segment Size","Avg Bwd Segment Size","Fwd Avg Bytes/Bulk",
    "Fwd Avg Packets/Bulk","Fwd Avg Bulk Rate","Bwd Avg Bytes/Bulk","Bwd Avg Packets/Bulk","Bwd Avg Bulk Rate","Subflow Fwd Packets","Subflow Fwd Bytes",
    "Subflow Bwd Packets","Subflow Bwd Bytes","Init_Win_bytes_forward","Init_Win_bytes_backward","act_data_pkt_fwd",
    "min_seg_size_forward","Active Mean","Active Std","Active Max","Active Min",
        "Idle Mean","Idle Std","Idle Max", "Idle Min","Label"]

    ths = open("importance_list_all_data.csv", "w")
    folder("./feature_pics/")
    for j in csv_files:
        df=pd.read_csv(j,usecols=main_labels)
        df=df.fillna(0)
        attack_or_not=[]
        for i in df["Label"]: # it changes the normal label to "1" and the attack tag to "0" for use in the machine learning algorithm
            if i =="BENIGN":
                attack_or_not.append(1)
            else:
                attack_or_not.append(0)           
        df["Label"]=attack_or_not

        y = df["Label"].values
        del df["Label"]
        X = df.values
    
    
        X = np.float32(X)
        X[np.isnan(X)] = 0
        X[np.isinf(X)] = 0


        # computing the feature importances
        forest = sk.ensemble.RandomForestRegressor(n_estimators=50,random_state=0)
        forest.fit(X, y)
        importances = forest.feature_importances_
        std = np.std([tree.feature_importances_ for tree in forest.estimators_],
                    axis=0)
        indices = np.argsort(importances)[::-1]
        refclasscol=list(df.columns.values)
        impor_bars = pd.DataFrame({'Features':refclasscol[0:20],'importance':importances[0:20]})
        impor_bars = impor_bars.sort_values('importance',ascending=False).set_index('Features')
        plt.rcParams['figure.figsize'] = (10, 5)
        impor_bars.plot.bar();
        # printing the feature importances  
        count=0
        fea_ture=j[0:-4]+"=["
        for i in impor_bars.index:
            fea_ture=fea_ture+"\""+str(i)+"\","
            count+=1
            if count==5:
                fea_ture=fea_ture[0:-1]+"]"
                break     
        print(j[0:-4],"importance list:")
        print(j[0:-4],"\n",impor_bars.head(20),"\n\n\n")
        print(fea_ture)
        plt.title(j[0:-4]+" Attack - Feature Importance")
        plt.ylabel('Importance')
        plt.savefig("./feature_pics/"+j[0:-4]+".pdf",bbox_inches='tight', format='pdf')
        ths.write((  fea_ture ) )
        plt.tight_layout()
        #plt.show()
        print("-----------------------------------------------------------------------------------------------\n\n\n\n")

        
    print("mission accomplished!")
    print("Total operation time: = ",time.time()- seconds ,"seconds")
    ths.close()