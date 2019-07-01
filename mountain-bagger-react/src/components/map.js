import React, { Component } from 'react';
import ReactMapboxG1, { Layer, Feature, } from 'react-mapbox-gl';
import '../styles/map.css';
import Geocoder from 'react-mapbox-gl-geocoder';

const REACT_APP_MAPBOX_TOKEN = 'pk.eyJ1IjoidGhlcHVua3lvbmUiLCJhIjoiY2p4MzJjd3g1MG9wZDN5cGtwb2VwY2x0NyJ9.S0cbsxNX2LA2_Zcud97cYw';
const MapBox = ReactMapboxG1({
  accessToken: REACT_APP_MAPBOX_TOKEN,
});

const BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';
const URL_QUERY = '?steps=true&geometries=geojson&access_token=';

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {},
      lng: -3.2116,
      lat: 54.4542,
      zoom: 1.5,
      endLng: null,
      endLat: null,
      travel: 'walking',
      route: {},
      duration: null,
    };
  }

  onSelected = (viewport, item) => {
    this.setState({
      viewport: viewport,
      lng: item.center[0],
      lat: item.center[1],
    });
  };

  onClick = (map, evt) => {
    const coordsObj = evt.lngLat;
    const coordinates = Object.keys(coordsObj).map((key) => {
      return coordsObj[key];
    });
    this.setState({
      ...this.state,
      endLng: coordinates[0],
      endLat: coordinates[1],
    });
    this.getRoute();
  };

  handleActivity = (event) => {
    this.setState({
      ...this.state,
      travel: event.target.value,
    });
    this.getRoute();
  };

  getRoute = () => {
    const { lng, lat, endLng, endLat, travel } = this.state;
    const token = REACT_APP_MAPBOX_TOKEN;
    const apiRequest = `${BASE_URL}/${travel}/${lng},${lat};${endLng},${endLat}${URL_QUERY}${token}`;
    console.log(apiRequest);
    fetch(apiRequest)
      .then(response => response.json())
      .then(data => data.routes[0])
      .then(data => {
        const duration = Math.round(data.duration / 60);
        const route = data.geometry.coordinates;
        const geojson = {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route,
            },
          },
        };

        this.setState({
          ...this.state,
          route: geojson,
          duration,
        });
        console.log(this.state);
      });
  };

  render() {
    const { endLng, endLat, lng, lat, viewport, route, duration, travel } = this.state;
    if (Object.keys(route).length !== 0) {
      console.log(duration);
    }
    // console.log(`${lat}, ${lng}: Starting latitude and longitude`);
    // console.log(`${endLat}, ${endLng}: Ending latitude and longitude`);
    // console.log(process.env.REACT_APP_MAPBOX_TOKEN);
    return (
      <div>
        <div>
          {/* <div>{`Longitude: ${lng} Latitude: ${lat} Zoom: ${zoom}`}</div> */}
          <div>{`${travel} this route will take ${duration} mins`}</div>
        </div>
        <MapBox
          style="mapbox://styles/mapbox/outdoors-v10/"
          center={[lng, lat]}
          containerStyle={{
            height: '50vh',
            width: '50vh',
          }}
          onClick={this.onClick}
        >
          <Layer
            type="symbol"
            id="marker-start"
            layout={{ 'icon-image': 'marker-15' }}
          >
            <Feature coordinates={[lng, lat]} />
          </Layer>

          {
            { endLng } &&
            (
              <Layer
                type="symbol"
                id="marker-end"
                layout={{ 'icon-image': 'marker-15' }}
              >
                <Feature coordinates={[endLng, endLat]} />
              </Layer>
            )
          }

          {/* {
            Object.keys(route).length !== 0 && (
            // prevRoute !== route && (
              <Layer
                id="route"
                type="line"
                sourceId={route}
                layout={{
                  'line-join': 'round',
                  'line-cap': 'round',
                }}
                paint={{
                  'line-color': '#3887b4',
                  'line-width': 5,
                  'line-opacity': 0.75,
                }}
              />
            )
          } */}
          {Object.keys(route).length !== 0 && (
            <Layer
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
              paint={{
                'line-color': '#3887b4',
                'line-width': 5,
                'line-opacity': 0.75,
              }}
            >
              <Feature coordinates={route.data.geometry.coordinates} />
            </Layer>
          )}
          
        </MapBox>
        <div>
          <button onClick={this.handleActivity} value="walking">Walking</button>
          <button onClick={this.handleActivity} value="cycling">Cycling</button>
        </div>
        <Geocoder
          viewport={viewport}
          onSelected={this.onSelected}
          mapboxApiAccessToken={REACT_APP_MAPBOX_TOKEN}
        />
      </div>
    );
  }
}

export default Map;
