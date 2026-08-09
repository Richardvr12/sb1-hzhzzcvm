import L from 'leaflet';

type TileCoords = { x: number; y: number; z: number };

const RainViewerTileLayer = (L.TileLayer as any).extend({
  getTileUrl: function (coords: TileCoords) {
    const maxApiZoom = 7; // RainViewer's strict API cap
    const z = Math.min(coords.z, maxApiZoom);

    // Calculate tile coordinate translation for scaled zooms
    const zoomDiff = coords.z - z;
    const x = Math.floor(coords.x / Math.pow(2, zoomDiff));
    const y = Math.floor(coords.y / Math.pow(2, zoomDiff));

    const time = this.options && this.options.time ? this.options.time : '0';

    // Construct request strictly targeting zoom 7 grid
    return `https://tilecache.rainviewer.com/v2/radar/${time}/256/${z}/${x}/${y}/1/1_1.png`;
  }
});

export default RainViewerTileLayer;
