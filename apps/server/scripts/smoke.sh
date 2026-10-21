#!/usr/bin/env bash
# Smoke test for the whole API. Start the server first (bun run dev), then:
#   bun run smoke                      # against http://localhost:8787
#   API=https://visus-api.<you>.workers.dev bun run smoke
# Needs curl and python3 (both ship with macOS). Creates a new test account every run.
set -uo pipefail

API="${API:-http://localhost:8787}"
PASS=0
FAIL=0
TOKEN=""
BODY=""
CODE=""

# call METHOD PATH [JSON] → sets BODY and CODE
call() {
  local args=(-s -o /tmp/visus-smoke.json -w '%{http_code}' -X "$1" "$API$2" -H 'Content-Type: application/json')
  [ -n "$TOKEN" ] && args+=(-H "Authorization: Bearer $TOKEN")
  [ $# -ge 3 ] && args+=(-d "$3")
  CODE=$(curl "${args[@]}")
  BODY=$(cat /tmp/visus-smoke.json)
}

# get FIELD → reads a value from BODY with a Python expression on `d`
get() { python3 -c "import json,sys; d=json.loads(sys.argv[1]); print($1)" "$BODY" 2>/dev/null; }

# check NAME EXPECTED_CODE [PYTHON_CONDITION on d]
check() {
  local ok=1
  [ "$CODE" = "$2" ] || ok=0
  if [ $ok = 1 ] && [ $# -ge 3 ]; then
    [ "$(get "bool($3)" 2>/dev/null)" = "True" ] || ok=0
  fi
  if [ $ok = 1 ]; then
    PASS=$((PASS + 1)); echo "  ok    $1"
  else
    FAIL=$((FAIL + 1)); echo "  FAIL  $1 (HTTP $CODE): ${BODY:0:300}"
  fi
}

echo "Visus smoke test → $API"
EMAIL="smoke-$(date +%s)-$RANDOM@visus.test"

echo "Health and auth"
call GET /health;                                  check "GET /health" 200 "d['ok'] is True"
call POST /auth/signup "{\"name\":\"Smoke Test\",\"identifier\":\"$EMAIL\",\"password\":\"secret123\"}"
check "signup" 201 "d['token'] and d['user']['identifier'] == '$EMAIL'"
call POST /auth/signup "{\"name\":\"Smoke Test\",\"identifier\":\"$EMAIL\",\"password\":\"secret123\"}"
check "signup twice → 409" 409 "'error' in d"
call POST /auth/login "{\"identifier\":\"$EMAIL\",\"password\":\"wrong-password\"}"
check "login with wrong password → 401" 401 "'error' in d"
LONG=$(python3 -c 'print("a" * 129)')
call POST /auth/login "{\"identifier\":\"$EMAIL\",\"password\":\"$LONG\"}"
check "password over 128 chars → 400" 400 "'error' in d"
call GET /me;                                      check "GET /me without token → 401" 401
UPPER=$(echo "$EMAIL" | tr a-z A-Z)
call POST /auth/login "{\"identifier\":\"  $UPPER\",\"password\":\"secret123\"}"
check "login (any case)" 200 "d['token']"
TOKEN=$(get "d['token']")
call GET /me;                                      check "GET /me" 200 "d['user']['identifier'] == '$EMAIL' and d['profiles'] == []"

echo "Profiles"
call POST /profiles '{"name":"Smoke Test","age":34,"isChild":false,"wearsGlasses":true,"healthConditions":["diabetes"],"screenHoursPerDay":6,"eyewear":"glasses","pastEyeTest":"yes"}'
check "create owner profile" 201 "d['relation'] == 'self' and d['age'] == 34"
ME=$(get "d['id']")
call POST /profiles '{"name":"Riya","age":8,"isChild":true,"wearsGlasses":false,"healthConditions":[],"screenHoursPerDay":2,"relation":"child"}'
check "create child profile" 201 "d['relation'] == 'child' and d['isChild']"
KID=$(get "d['id']")
call PATCH "/profiles/$ME" '{"prescription":{"right":{"sph":-1.25,"cyl":-0.5,"axis":90},"left":{"sph":-1,"cyl":0,"axis":0},"updatedAt":"2026-10-21T10:00:00.000Z"}}'
check "update glasses prescription" 200 "d['prescription']['right']['sph'] == -1.25"
call PATCH "/profiles/$ME" '{"prescription":null}'
check "\"I don't know\" prescription" 200 "d['prescription'] is None"
call PATCH "/profiles/not-a-real-id" '{"age":40}'
check "update unknown profile → 404" 404
call GET /profiles;                                check "GET /profiles (owner first)" 200 "len(d) == 2 and d[0]['id'] == '$ME'"

echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" = 0 ]
