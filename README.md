# Kubernetes Deployment Scaling Application

The Kubectl command below can be used to scale applications to a desired number
of replicas.

```plain
kubectl scale deployment/my-app --replicas=1
```

Whilst this is straightforward enough it is tedious to retrieve all deployments
and scale each one down, especially if they need to be in a specific order, for
the complete (or subset) list of deployments.

This is a situation I occasionally find myself in when wanting to shutdown my
cluster and scale down most of the deployments to zero first. Failing to do so
can lead to a) services starting before their dependant services and erroring,
b) crash-back-off loops, c) pods jumping between nodes due to failing leading to
imbalance in utilisation, d) and more. This can lead to a cluster that is flakey
and taking a long time to recover (including some manual intervention).

This repository contains a basic web application that displays all deployments
in the cluster and can easily scale them up and down from a single list. This
is a standalone app and does not need to be deployed into the cluster itself.
This means it can be used locally with little effort.

I additionally wanted to play around with a few technologies so this was a good
pet project to try them out on.

- [Kubernetes API](https://kubernetes.io/docs/reference/) (vs just using the
  kubectl CLI)
- [React](https://create-react-app.dev/docs/adding-typescript/) (using Typescript
  with Create React App)
- [SWR](https://swr.vercel.app/) for API calls (React Hooks for Data Fetching)
- [Tailwind CSS](https://tailwindcss.com/) for styling the React components

## Proxying API Calls

There are a few ways to make API calls in Kubernetes. The most common is to use
the kubectl CLI. Calling the API server directly is a bit cumbersome, especially
the complexities of authentication and authorization. This along with CORS issues
can be a bit of a pain when running locally. The simplest way to get around this
is to proxy the API calls through `kubectl` as this handles all the authentication
and authorization for you.

In the below example we are using the `kubectl proxy` command to proxy the API
calls to the API server. This is listening on the default port 8001 and is
accessible from the local machine. The `curl` command then makes a REST call to
scale a deployment, with this being proxied via kubectl so doesn't require
authentication headers, certificates, or additional Kubernetes configuration.

```plain
kubectl proxy &

curl -X PATCH \
  -H 'Content-Type: application/strategic-merge-patch+json' \
  --data '{"spec":{"replicas": 0}}' \
  http://localhost:8001/apis/apps/v1/namespaces/default/deployments/my-app/scale
```

This web application itself does however still need an additional component,
Nginx has been used here, for applying CORS headers in the responses and handling
the `OPTIONS` calls made by the browser for preflight checks which is not
supported by `kubectl`. The web application makes API calls via Nginx which then
proxies them through `kubectl`.

## Running the Deployment in Dev Mode

In the project directory, you can run the following commands to start the web
application and make API calls to display the list of Kubernetes deployments:

Run the below command to proxy API requests via kubectl:

- this will start listening on port `8001` by default
- the `--api-prefix=/k8s-api` flag is used by `kubectl` to serve the API under `/k8s-api`.
  This is required as by default this is normally served up from `/` so clashes
  with the web application and the associated Nginx config.
- API calls made from the browser on `localhost:3000` (app running in dev mode)
  will be allowed due to the `--disable-filter=true` flag as otherwise only calls
  from `localhost` are accepted.

```plain
kubectl proxy --api-prefix=/k8s-api --disable-filter=true
```

Run the below command to start an Nginx container with proxy configuration that
adds the required CORS headers to the responses. This will also bind mount the
`nginx/templates/` directory containing the `default.conf.template` file as this
contains the default configuration for:

- the `PROXY_PORT` environment variable which is used to specify the port the
  `kubectl` proxy is listening on
- returning hardcoded response for `OPTIONS` requests, which aren't supported by
  `kubectl`
- setting the CORS headers in the response

```plain
docker run --rm \
  --name nginx \
  -p 80:80 \
  -e PROXY_PORT=8001 \
  -v $(pwd)/nginx/templates:/etc/nginx/templates \
  nginx:alpine
```

Run the below command to start the web application running in development mode.

```plain
npm start
```

Navigate to <http://localhost:3000> to view the list of Kubernetes deployments.

The **Up** and **Down** links can be used to scale each deployment up and down.

## Building and Running the Production Docker Image

This web application can be built and run as a Docker image in production mode.
The [Dockerfile](./Dockerfile) file contains a multi-stage build process. The
first stage performs a production build of the React components and the second
stage copies these into an Nginx image.

This can be built and run using Docker Compose by running the below command.

```plain
docker-compose up -d && docker-compose logs -f
```

Navigate to <http://localhost> to view the list of Kubernetes deployments.

## Available Scripts

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests)
for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the
best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## License

[![MIT license]](https://lbesson.mit-license.org/)

[mit license]: https://img.shields.io/badge/License-MIT-blue.svg
