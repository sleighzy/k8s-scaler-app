import React from 'react';
import './App.css';
import { Toaster } from 'react-hot-toast';
import DeploymentList from './DeploymentList';

const App: React.FunctionComponent = () => (
  <div className="App">
    <Toaster />
    <DeploymentList />
  </div>
);

export default App;
