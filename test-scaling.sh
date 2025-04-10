#!/bin/bash

AUTH_URL=http://<auth-lb>.us-east-1.elb.amazonaws.com:5000 # should be changed!
ENTER_URL=http://<enter-lb>.us-east-1.elb.amazonaws.com:5001 # should be changed!

for i in {1..50}
do
  echo "[$i] Testing user load..."

  # 1. Register
  curl -s -X POST "$AUTH_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"user_id":"user'$i'","password":"pass123"}' > /dev/null

  # 2. Login to get token
  TOKEN=$(curl -s -X POST "$AUTH_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"user_id":"user'$i'","password":"pass123"}' | jq -r .token)

  # 3. Send /expense with token
  curl -s -X POST "$ENTER_URL/expense" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"amount": 100, "category": "test", "description": "scale test", "date": "2024-04-09"}' > /dev/null

done
