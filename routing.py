import networkx as nx

def calculate_edge_cost(distance, hazard_probability, alpha=8.0):
    return distance * (1.0 + alpha * hazard_probability)

def compute_vanguard_path(peak_dbz):
    G = nx.DiGraph()
    hazard_risk = 0.95 if peak_dbz > 35.0 else 0.10

    G.add_edge('Start_Point', 'Node_North', distance=4.0, hazard_prob=0.0)
    G.add_edge('Node_North', 'Target_Destination', distance=8.0, hazard_prob=hazard_risk)
    G.add_edge('Start_Point', 'Node_South_Detour', distance=6.0, hazard_prob=0.02)
    G.add_edge('Node_South_Detour', 'Target_Destination', distance=5.0, hazard_prob=0.01)

    for u, v, data in G.edges(data=True):
        data['weight'] = calculate_edge_cost(data['distance'], data['hazard_prob'])

    return nx.shortest_path(G, source='Start_Point', target='Target_Destination', weight='weight')
