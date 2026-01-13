
#!/bin/bash

# Login
LOGIN_RESP=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

TOKEN=$(echo $LOGIN_RESP | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed"
  echo $LOGIN_RESP
  exit 1
fi

echo "Auth Token: $TOKEN"

# Test 1: Create Main Member
echo ">>> Testing Main Member Upload..."
curl -v -X POST http://localhost:3000/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -F "firstName=TestMain" \
  -F "lastName=User" \
  -F "gender=Male" \
  -F "dob=1990-01-01" \
  -F "maritalStatus=Married" \
  -F "familyId=FNew" \
  -F "photo=@test_image.jpg" \
  -F "spousePhoto=@test_image.jpg" \
  > main_response.json 2>&1

cat main_response.json
echo ""

# Test 2: Create Child
echo ">>> Testing Child Upload..."
curl -v -X POST http://localhost:3000/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -F "firstName=TestChild" \
  -F "lastName=User" \
  -F "gender=Male" \
  -F "dob=2010-01-01" \
  -F "maritalStatus=Single" \
  -F "familyId=FTest" \
  -F "photo=@test_image.jpg" \
  > child_response.json 2>&1

cat child_response.json
echo ""
