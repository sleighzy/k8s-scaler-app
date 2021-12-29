import { DeploymentData } from './types';

interface DeploymentProps {
  deployment: DeploymentData;
}

const Deployment = ({ deployment }: DeploymentProps): JSX.Element => (
  <div>
    {deployment.metadata.namespace}/{deployment.metadata.name}:{' '}
    {deployment.spec.replicas}
  </div>
);

export default Deployment;
