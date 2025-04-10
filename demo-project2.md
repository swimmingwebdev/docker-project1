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

### 5. To Test Autoscaling simply
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

---
# Horizontal Scaling Test Scenario
### Description
Simulate a high number of users using the system by sending many login and expense storage requests at the same time.

1. 50+ users are registered and logged in.

2. Each user receives a JWT token from the Authentication Service.

3. Using the token, they send a POST /expense request to the Enter Data Service, which saves data into MySQL.

### What it simulates
- Multiple users using the system concurrently
- Authentication traffic + expense submission
- CPU and memory load on both:
  - authentication pods
  - enter-data-backend pods

### Expected Outcome
- HPA observes CPU or memory over the threshold (70% CPU, 75% memory).
- It increases the number of pods for those services automatically (scaling out).
- After the load stops, unused pods are scaled down again (shrink back to minReplicas)