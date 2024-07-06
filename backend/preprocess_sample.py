import pandas as pd

def SampleDataset(dataset_sample_size=2672997):

    all_data = pd.read_csv('all_data_default.csv')
    sample_df = all_data.sample(n=dataset_sample_size, random_state=42)
    print("SAMPLE SHAPE:", sample_df.shape)
    sample_df.to_csv('all_data.csv', index=False)

