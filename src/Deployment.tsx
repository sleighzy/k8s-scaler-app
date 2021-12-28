interface DeploymentProps {
  namespace: string;
  name: string;
  replicas: number;
}

const Deployment = ({
  namespace,
  name,
  replicas,
}: DeploymentProps): JSX.Element => (
  <div>
    {namespace}/{name}: {replicas}
  </div>
);

export default Deployment;
