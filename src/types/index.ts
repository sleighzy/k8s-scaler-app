export interface DeploymentListData {
  items: DeploymentData[];
}

export interface DeploymentData {
  metadata: MetaData;
  spec: Spec;
  status: Status;
}

export interface MetaData {
  name: string;
  namespace: string;
}

export interface Spec {
  replicas: number;
}

export interface Status {
  replicas?: number;
}
