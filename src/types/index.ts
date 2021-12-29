export interface DeploymentListData {
  items: DeploymentData[];
}

export interface DeploymentData {
  metadata: any;
  spec: any;
  status: any;
}
