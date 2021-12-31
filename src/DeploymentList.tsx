import React from 'react';
import Deployment from './Deployment';
import useSWR from 'swr';
import { DeploymentListData } from './types';
import { apiServer } from './config';

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

const DeploymentList: React.FunctionComponent = () => {
  const { data, error } = useSWR<DeploymentListData, Error>(
    `${apiServer}/apis/apps/v1/deployments`,
    fetcher
  );

  if (error) return <div>Failed to retrieve deployment information</div>;

  if (!data) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        <h2 className="text-center text-white text-xl font-semibold">
          Loading...
        </h2>
        <p className="w-1/3 text-center text-white">
          Retrieving Kubernetes deployments
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Replicas
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.items
                    .sort((a, b) => {
                      return a.metadata.namespace.localeCompare(
                        b.metadata.namespace
                      );
                    })
                    .map((deployment) => (
                      <Deployment
                        key={`${deployment.metadata.name}|${deployment.metadata.namespace}`}
                        deployment={deployment}
                      />
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentList;
