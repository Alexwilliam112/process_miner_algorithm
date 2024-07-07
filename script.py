import sys
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from datetime import datetime, timedelta
from collections import Counter

# Load data from stdin
input_data = sys.argv[1]
ignored_words = json.loads(sys.argv[2])
events = json.loads(input_data)

# Convert to pandas DataFrame
df = pd.DataFrame(events)

# Convert timestamp to datetime
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Extract unique activity names
activity_names = df['eventName'].unique()

# Vectorize activity names using TF-IDF
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(activity_names)

# Apply KMeans clustering
n_clusters = 5  # Choose the number of clusters based on your data
kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(X)

# Assign cluster labels to activity names
clusters = {activity_names[i]: kmeans.labels_[i] for i in range(len(activity_names))}

# Map clusters back to the DataFrame
df['cluster'] = df['eventName'].map(clusters)

# Define a function to extract the common segment from activity names dynamically, ignoring certain words
def extract_common_segment_dynamic(event_name, cluster_id):
    cluster_events = df[df['cluster'] == cluster_id]['eventName'].tolist()
    
    # Filter out ignored words from cluster events
    split_events = [[word for word in name.split() if word not in ignored_words] for name in cluster_events]
    min_length = min(len(parts) for parts in split_events)
    
    common_prefix = []
    for i in range(min_length):
        words_at_position = [parts[i] for parts in split_events if len(parts) > i]
        if words_at_position:
            most_common_word, count = Counter(words_at_position).most_common(1)[0]
            if count == len(cluster_events):
                common_prefix.append(most_common_word)
            else:
                break
    
    if common_prefix:
        return ' '.join(common_prefix)
    
    # If no common prefix found, fall back to using the most frequent word, excluding ignored words
    words = [word for word in event_name.split() if word not in ignored_words]
    common_word = max(set(words), key=words.count)
    return common_word

# Apply the function to create a new column for case IDs
df['case_id'] = df.apply(lambda row: extract_common_segment_dynamic(row['eventName'], row['cluster']), axis=1)

# Sort by timestamp to maintain chronological order
df = df.sort_values(by='timestamp')

# Convert timestamps to a human-readable format
df['timestamp'] = df['timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S')

# Output the result
output_data = df.to_json(orient='records', date_format='iso')
print(output_data)
