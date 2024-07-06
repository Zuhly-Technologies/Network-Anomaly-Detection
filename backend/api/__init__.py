from api.endpoints import *

def add_resource(api):
    
    api.add_resource(GenerateAttackMetrics, "/generate_attack_metrics")
    api.add_resource(GetAttackMetrics, "/get_attack_metrics")

    api.add_resource(GenerateAllMetrics, "/generate_all_metrics")
    api.add_resource(GetAllMetrics, "/get_all_metrics")

    api.add_resource(Sampledataset, "/sample_dataset/<int:sample_size>")

    api.add_resource(FeatureSelection, "/feature_selection/<string:target_feature>")



    