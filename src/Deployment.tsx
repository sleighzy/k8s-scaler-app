import useSWR, { useSWRConfig } from 'swr';
import { DeploymentData } from './types';

interface DeploymentProps {
  deployment: DeploymentData;
}

const apiServer = 'http://localhost';

const Deployment = ({ deployment }: DeploymentProps): JSX.Element => {
  const { mutate } = useSWRConfig();

  const scale = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    deployment: DeploymentData,
    scale: number
  ) => {
    const { namespace, name } = deployment.metadata;

    event.preventDefault();
    const replicas = deployment.spec.replicas + scale;
    console.log(`Scaling to ${replicas}`);

    const payload = {
      spec: {
        replicas,
      },
    };

    const response = await fetch(
      `${apiServer}/apis/apps/v1/namespaces/${namespace}/deployments/${name}/scale`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          spec: {
            replicas,
          },
        }),
        headers: { 'Content-Type': 'application/strategic-merge-patch+json' },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to scale deployment ${name}/${namespace}, status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log(data);

    // trigger a re-validation so that the deployment list is fetched again and
    // the new replicas count is displayed as each item in the list is rendered
    mutate(`${apiServer}/apis/apps/v1/deployments`);
  };

  return (
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
        <a
          href="#"
          className="text-blue-600 hover:text-indigo-900"
          onClick={(event) => scale(event, deployment, 1)}
        >
          Up
        </a>
        {' | '}
        <a
          href="#"
          className="text-blue-600 hover:text-indigo-900"
          onClick={(event) => scale(event, deployment, -1)}
        >
          Down
        </a>
      </td>
    </tr>
  );
};

export default Deployment;
