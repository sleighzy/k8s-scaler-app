import React from 'react';
import { toast } from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import { DeploymentData } from './types';
import { apiServer } from './config';

interface DeploymentProps {
  deployment: DeploymentData;
}

const Deployment: React.FunctionComponent<DeploymentProps> = ({
  deployment,
}) => {
  const { mutate } = useSWRConfig();
  const {
    metadata: { name, namespace },
    spec: { replicas: specReplicas },
    status: { replicas: statusReplicas },
  } = deployment;

  const scaleReplicas = async (
    name: string,
    namespace: string,
    replicas: number
  ) => {
    if (replicas < 0) {
      return;
    }

    console.log(`Scaling deployment ${name}/${namespace} to ${replicas}`);

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

  const scale = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    deployment: DeploymentData,
    scale: number
  ) => {
    event.preventDefault();

    const {
      metadata: { name, namespace },
      spec: { replicas: currentReplicas },
    } = deployment;

    const replicas = currentReplicas + scale;
    if (replicas < 0 || replicas === currentReplicas) {
      return;
    }

    toast.promise(scaleReplicas(name, namespace, replicas), {
      loading: `Scaling ${name}/${namespace} to ${replicas}`,
      error: () => `Failed to scale ${name}/${namespace} to ${replicas}`,
      success: () => `Scaled ${name}/${namespace} to ${replicas}`,
    });
  };

  const statusText = specReplicas === 0 ? 'Inactive' : 'Available';
  const statusBackgroundColor =
    specReplicas === 0 ? 'bg-slate-100' : 'bg-green-100';
  const statusTextColor =
    specReplicas === 0 ? 'text-slate-800' : 'text-green-800';

  return (
    <tr key={`${name}|${namespace}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-left text-sm text-gray-900">{name}</div>
        <div className="text-left text-sm text-gray-500">{namespace}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBackgroundColor} ${statusTextColor}`}
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
          className="text-sky-500 hover:text-blue-600"
          onClick={(event) => scale(event, deployment, 1)}
        >
          Up
        </a>
        {' | '}
        <a
          href="#"
          className={
            specReplicas > 0
              ? 'text-sky-500 hover:text-blue-600'
              : 'text-gray-400 pointer-events-none'
          }
          onClick={(event) => scale(event, deployment, -1)}
        >
          Down
        </a>
      </td>
    </tr>
  );
};

export default Deployment;
