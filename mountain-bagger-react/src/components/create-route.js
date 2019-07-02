import React from 'react';
import { Link } from 'react-router-dom';
import Map from './map';
import Test from './test';
import Search from './search';
import '../styles/create-route.css';
import MapTest from './map-test';

const CreateRoute = (props) => {
  return (
    <div>
      <Link to="/">Profile Page</Link>
      <Map {...props} />
    </div>
  );
};

export default CreateRoute;
