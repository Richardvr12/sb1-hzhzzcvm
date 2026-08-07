import nexradaws
import pyart
import numpy as np
import torch

def fetch_and_process_radar(site='KTLX', year=2013, month=5, day=20):
    conn = nexradaws.NexradAwsInterface()
    scans = conn.get_avail_scans(year, month, day, site)
    results = conn.download(scans[0], '/tmp/radar_data')
    
    radar = pyart.io.read_nexrad_archive(results.success[0].filepath)
    grid = pyart.map.grid_from_radars(
        (radar,),
        grid_shape=(1, 256, 256),
        grid_limits=((0, 10000), (-100000, 100000), (-100000, 100000)),
        fields=['reflectivity']
    )
    
    reflectivity_data = grid.fields['reflectivity']['data'][0]
    reflectivity_clean = np.nan_to_num(reflectivity_data, nan=0.0)
    
    tensor_input = torch.tensor(reflectivity_clean, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
    return tensor_input
