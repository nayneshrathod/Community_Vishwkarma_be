
#!/bin/bash
LOGIN_RESP = $(curl - s - X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}')

TOKEN = $(echo $LOGIN_RESP | grep - o '"token":"[^"]*' | cut - d'"' - f4)

if [-z "$TOKEN"]; then
    echo "Login Failed"
    exit 1
fi

curl - s - X GET "http://localhost:3000/api/members?isPrimary=true" \
-H "Authorization: Bearer $TOKEN" \
  > primary_members.json

cat primary_members.json
