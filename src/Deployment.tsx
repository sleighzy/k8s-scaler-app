import { useSWRConfig } from 'swr';
import { DeploymentData, MetaData, Spec } from './types';
import { apiServer } from './config';

interface DeploymentProps {
  deployment: DeploymentData;
}

const Deployment = ({ deployment }: DeploymentProps): JSX.Element => {
  const {
    metadata: { name, namespace },
    spec: { replicas: specReplicas },
    status: { replicas: statusReplicas },
  } = deployment;

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

  const statusText = specReplicas === 0 ? 'Inactive' : 'Available';
  const statusColor = specReplicas === 0 ? 'slate' : 'green';

  return (
    <tr key={`${name}|${namespace}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{name}</div>
        <div className="text-sm text-gray-500">
          {deployment.metadata.namespace}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800`}
        >
          {statusText}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {statusReplicas || 0} / {specReplicas}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <a
          href="#"
          className="text-gray-400 hover:text-blue-600"
          onClick={(event) => scale(event, deployment, 1)}
        >
          Up
        </a>
        {' | '}
        <a
          href="#"
          className="text-gray-400 hover:text-blue-600"
          onClick={(event) => scale(event, deployment, -1)}
        >
          Down
        </a>
      </td>
    </tr>
  );
};

export default Deployment;
