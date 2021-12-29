import './App.css';
import { Toaster } from 'react-hot-toast';
import DeploymentList from './DeploymentList';

const App = (): JSX.Element => (
  <div className="App">
    <Toaster />
    <DeploymentList />
  </div>
);

export default App;
