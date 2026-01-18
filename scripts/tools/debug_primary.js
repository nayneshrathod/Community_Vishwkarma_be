
#!/bin/bash
LOGIN_RESP = $(curl - s - X POST https://vishwa-backend-wggt.vercel.app/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}')

TOKEN = $(echo $LOGIN_RESP | grep - o '"token":"[^"]*' | cut - d'"' - f4)

if [-z "$TOKEN"]; then
    echo "Login Failed"
    exit 1
fi

curl - s - X GET "https://vishwa-backend-wggt.vercel.app/api/members?isPrimary=true" \
-H "Authorization: Bearer $TOKEN" \
  > primary_members.json

cat primary_members.json
