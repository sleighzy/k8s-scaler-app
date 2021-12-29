import Deployment from './Deployment';
import useSWR from 'swr';
import { DeploymentListData } from './types';

const apiServer = 'http://localhost';

const fetcher = async (url: string): Promise<DeploymentListData> => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}, status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

const DeploymentList = (): JSX.Element => {
  const { data, error } = useSWR<DeploymentListData, Error>(
    `${apiServer}/apis/apps/v1/deployments`,
    fetcher
  );

  if (error) return <div>Failed to retrieve deployment information</div>;

  if (!data) return <div>Retrieving deployment information...</div>;

  return (
    <div>
      <h1>Deployment List</h1>
      {data.items.map((deployment) => (
        <Deployment deployment={deployment} />
      ))}
    </div>
  );
};

export default DeploymentList;
