# DEMO Checklist: Expense Tracker

### 1. Set up local environment & Install Cluster
```bash
aws --version
kubectl version --client
eksctl version

# Install cluster
eksctl create cluster --name [clustername] --region us-east-1 --nodegroup-name ng-1 --node-type t3.small --nodes 3 --nodes-min 1 --nodes-max 3 --managed
```

### 2. Connect to EKS Cluster
```sh
aws eks --region us-east-1 update-kubeconfig --name [clustername]
```

### 3. Apply Everything to EKS Cluster
```sh
kubectl apply -f secrets.yaml
kubectl apply -f pvc.yaml
kubectl apply -f deployments.yaml
kubectl apply -f services.yaml
kubectl apply -f horizontal-scaling.yaml
```

## 4. Verify Everything
```sh
kubectl get secret
kubectl get pods
kubectl get pvc
kubectl get deployments
kubectl get hpa
kubectl get svc
# Use public LoadBalancer endpoint
# http://a7e08240a0f27491fabab00e1f8f8f89-1172888179.us-east-1.elb.amazonaws.com:8080

```

### 5. To Test Autoscaling
```sh
# Use kubectl run to generate load
kubectl run -i --tty load-generator --image=busybox /bin/sh
# while true; do wget -q -O- http://<your-service-name>:<port>; done
while true; do wget -q -O- http://show-results-service:5002; done
# Check status
kubectl get hpa
```

### 6. Delete Cluster
```bash
eksctl delete cluster --region=us-east-1  --name=[clustername]
```
---
# Troubleshooting
```sh
# Check logs
kubectl get pods
kubectl describe pvc mysql-pvc
kubectl logs deploy/show-results-backend
```