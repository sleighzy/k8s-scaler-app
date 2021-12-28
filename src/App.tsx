import logo from './logo.svg';
import './App.css';
import DeploymentList from './DeploymentList';

const App = (): JSX.Element => (
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <DeploymentList />
    </header>
  </div>
);

export default App;
