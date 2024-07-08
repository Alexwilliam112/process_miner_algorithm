import sys
import json
import pandas as pd
import pm4py
from pm4py.objects.conversion.log import converter as log_converter
from pm4py.algo.discovery.inductive import algorithm as inductive_miner
from pm4py.objects.petri_net import utils as petri_utils
from pm4py.statistics.service_time.log import get as service_time_get
from datetime import datetime

def calculate_average_times(event_log):
    average_times = {}
    for case in event_log:
        for i in range(len(case) - 1):
            event_1 = case[i]
            event_2 = case[i + 1]
            place_name = event_1['concept:name']
            timestamp_1 = event_1['time:timestamp']
            timestamp_2 = event_2['time:timestamp']
            delta = (timestamp_2 - timestamp_1).total_seconds()
            if place_name not in average_times:
                average_times[place_name] = []
            average_times[place_name].append(delta)
    
    for place in average_times:
        times = average_times[place]
        average_times[place] = sum(times) / len(times) if times else 0

    return average_times

def convert_to_petri_net(df):
    log = pm4py.format_dataframe(df, case_id='caseId', activity_key='eventName', timestamp_key='timestamp')
    event_log = log_converter.apply(log)
    process_tree = inductive_miner.apply(event_log)
    net, initial_marking, final_marking = pm4py.objects.conversion.process_tree.converter.apply(process_tree)
    return net, event_log

def rename_places(net, df):
    event_names = df['eventName'].unique().tolist()
    for place in net.places:
        if event_names:
            place.name = event_names.pop(0)
    return net

def annotate_places_with_times(net, average_times):
    for place in net.places:
        place_name = place.name
        place.average_time = average_times.get(place_name, 0)
    return net

def prepare_result(net):
    return {
        "places": [{"name": place.name, "average_time": place.average_time} for place in net.places]
    }

def main():
    data_str = sys.argv[1]
    data = json.loads(data_str.replace("null", "null").replace("'", '"'))

    df = pd.DataFrame(data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    results = {}

    for case_id, case_df in df.groupby('caseId'):
        net, event_log = convert_to_petri_net(case_df)
        average_times = calculate_average_times(event_log)
        net = rename_places(net, case_df)
        net = annotate_places_with_times(net, average_times)
        results[case_id] = prepare_result(net)

    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
