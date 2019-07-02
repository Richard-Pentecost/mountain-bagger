import React, { Component } from 'react';
import ReactMapboxG1, { Layer, Feature } from 'react-mapbox-gl';
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
      distance: null,
    };
  }

  onSelected = (viewport, item) => {
    this.setState({
      viewport: viewport,
      lng: item.center[0],
      lat: item.center[1],
    });
  };

  onMapClick = (map, evt) => {
    const coordsObj = evt.lngLat;
    const coordinates = Object.keys(coordsObj).map((key) => {
      return coordsObj[key];
    });
    const endLongitude = coordinates[0];
    const endLatitude = coordinates[1];
    const modeOfTransport = this.state.travel;

    this.getRoute(endLongitude, endLatitude, modeOfTransport);
  };

  handleModeOfTransport = (event) => {
    const endLongitude = this.state.endLng;
    const endLatitude = this.state.endLat;
    const modeOfTransport = event.target.value;

    // this.setState({
    //   ...this.state,
    //   travel: event.target.value,
    // }, () => this.getRoute());
    this.getRoute(endLongitude, endLatitude, modeOfTransport);
  };

  getRoute = (endLng, endLat, travel) => {
    const { lng, lat } = this.state;
    const token = REACT_APP_MAPBOX_TOKEN;
    const apiRequest = `${BASE_URL}/${travel}/${lng},${lat};${endLng},${endLat}${URL_QUERY}${token}`;
    fetch(apiRequest)
      .then(response => response.json())
      .then(data => data.routes[0])
      .then(data => {
        const distance = (data.distance / 1000).toFixed(3);
        const duration = Math.round(data.duration / 60);
        const route = data.geometry.coordinates;
        this.setState({
          ...this.state,
          endLng,
          endLat,
          travel,
          route,
          duration,
          distance,
        });
      });
  };

  render() {
    const { endLng, endLat, lng, lat, viewport, route, duration, travel, distance } = this.state;
    const modeOfTravel = travel.charAt(0).toUpperCase() + travel.slice(1);

    return (
      <div>
        {
          duration && (
            <div className="routeInfomation">
              <div className="modeOfTransport">
                {`${modeOfTravel}:`}
              </div>
              <div className="distance">
                {`Distance: ${distance}km`}
              </div>
              <div className="duration">
                {`Time: ${duration}mins`}
              </div>
            </div>
          )
        }
        <MapBox
          style="mapbox://styles/mapbox/outdoors-v10/"
          center={[lng, lat]}
          containerStyle={{
            height: '50vh',
            width: '50vh',
          }}
          onClick={this.onMapClick}
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

          {
            Object.keys(route).length !== 0 && (
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
                <Feature coordinates={route} />
              </Layer>
            )
          }

        </MapBox>
        <div>
          <button onClick={this.handleModeOfTransport} value="walking">Walking</button>
          <button onClick={this.handleModeOfTransport} value="cycling">Cycling</button>
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
