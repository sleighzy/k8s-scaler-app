import { DeploymentData } from './types';

interface DeploymentProps {
  deployment: DeploymentData;
}

const Deployment = ({ deployment }: DeploymentProps): JSX.Element => (
  <tr key={`${deployment.metadata.namespace}|${deployment.metadata.name}`}>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">{deployment.metadata.name}</div>
      <div className="text-sm text-gray-500">
        {deployment.metadata.namespace}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        Available
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {deployment.status.replicas} / {deployment.spec.replicas}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <a href="#" className="text-indigo-600 hover:text-indigo-900">
        Up
      </a>
      {' | '}
      <a href="#" className="text-indigo-600 hover:text-indigo-900">
        Down
      </a>
    </td>
  </tr>
);

export default Deployment;
