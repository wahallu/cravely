#!/bin/bash
# filepath: /Users/nisalfonseka/Documents/GitHub/cravely/build-for-minikube.sh

# Function to display status messages
log() {
  echo "$(date +"%T") - $1"
}

# Verify Minikube is running
if ! minikube status | grep -q "Running"; then
  log "Minikube is not running. Starting Minikube..."
  minikube start
fi

# Configure shell to use Minikube's Docker daemon
log "Configuring shell to use Minikube's Docker daemon..."
eval $(minikube docker-env)

# Verify we're using Minikube's Docker
log "Verifying Docker configuration..."
DOCKER_HOST_INFO=$(docker info 2>/dev/null | grep "Name:" | head -n 1)
if ! echo $DOCKER_HOST_INFO | grep -q "minikube"; then
  log "ERROR: Not connected to Minikube's Docker daemon. Please run 'eval \$(minikube docker-env)' and try again."
  exit 1
fi

# Build Docker images in Minikube's environment
log "Building Docker images in Minikube's environment..."

# Build Delivery service image
log "Building Delivery service image..."
docker build -t cravely/delivery:latest ./backend/Delivery/

# Build Order service image
log "Building Order service image..."
docker build -t cravely/order:latest ./backend/Order/

# Build Restaurant service image
log "Building Restaurant service image..."
docker build -t cravely/restaurant:latest ./backend/Restaurant/

# Build User service image
log "Building User service image..."
docker build -t cravely/user:latest ./backend/User/

# Build Notification service image
log "Building Notification service image..."
docker build -t cravely/notification:latest ./backend/Notification/

# Build Frontend service image
log "Building Frontend service image..."
docker build -t cravely/frontend:latest ./frontend/

# Verify images were built
log "Verifying images..."
docker images | grep "cravely"

# Ensure all deployment files use imagePullPolicy: Never
log "Ensuring all deployment files use imagePullPolicy: Never..."
DEPLOYMENT_FILES=$(find ./Kubernates -name "deployment.yaml")
for file in $DEPLOYMENT_FILES; do
  sed -i.bak 's/imagePullPolicy: Always/imagePullPolicy: Never/g' "$file"
  rm -f "${file}.bak"
done

# Delete existing deployments if they exist
log "Cleaning up any existing deployments..."
kubectl delete deployment --all 2>/dev/null

# Apply Kubernetes configurations
log "Applying Kubernetes manifests..."
kubectl apply -f Kubernates/secrets.yaml
kubectl apply -f Kubernates/configmap.yaml
kubectl apply -f Kubernates/delivery/
kubectl apply -f Kubernates/order/
kubectl apply -f Kubernates/restaurant/
kubectl apply -f Kubernates/user/
kubectl apply -f Kubernates/notification/
kubectl apply -f Kubernates/frontend/

# Wait for pods to be ready
log "Waiting for pods to start..."
sleep 10

# Display pod status
log "Current pod status:"
kubectl get pods

log "Deployment process completed!"
log "Note: If pods are still in ImagePullBackOff state, verify that the images are correctly built and tagged."
log "To access the frontend service, run: minikube service frontend-service"