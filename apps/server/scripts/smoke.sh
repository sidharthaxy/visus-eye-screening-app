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

echo "Full check (AI plan → 4 results incl. Amsler red flag → verdict)"
INTAKE='Road signs look blurry at night and headlights have halos.\nEyes: Both eyes\nHow long: A few months\nPain, redness or flashes: No'
call POST /sessions "{\"profileId\":\"$ME\",\"intake\":\"$INTAKE\",\"mode\":\"full\"}"
check "POST /sessions → plan" 201 "d['sessionId'] and len(d['plan']) >= 2 and d['summary']"
SID=$(get "d['sessionId']")
echo "        plan: $(get "', '.join(p['testId'] for p in d['plan'])")"
echo "        summary: $(get "d['summary']")"

E_GOOD='{"distanceCm":40,"calibrated":true,"trials":[{"line":"6/60","shown":"up","answer":"up"},{"line":"6/60","shown":"up","answer":"up"},{"line":"6/60","shown":"up","answer":"up"},{"line":"6/12","shown":"up","answer":"up"},{"line":"6/12","shown":"up","answer":"up"},{"line":"6/12","shown":"up","answer":"up"},{"line":"6/6","shown":"up","answer":"up"},{"line":"6/6","shown":"left","answer":"left"},{"line":"6/6","shown":"down","answer":"down"},{"line":"6/5","shown":"up","answer":"left"},{"line":"6/5","shown":"up","answer":"left"},{"line":"6/5","shown":"up","answer":"right"}]}'
E_SOFT='{"distanceCm":40,"calibrated":true,"trials":[{"line":"6/60","shown":"up","answer":"up"},{"line":"6/60","shown":"up","answer":"up"},{"line":"6/60","shown":"up","answer":"up"},{"line":"6/12","shown":"up","answer":"up"},{"line":"6/12","shown":"up","answer":"up"},{"line":"6/12","shown":"up","answer":"up"},{"line":"6/9","shown":"up","answer":"left"},{"line":"6/9","shown":"up","answer":"left"},{"line":"6/9","shown":"up","answer":"right"}]}'
call POST "/sessions/$SID/results" "{\"testId\":\"tumbling_e\",\"eye\":\"both\",\"durationSec\":95,\"answers\":{\"right\":$E_GOOD,\"left\":$E_SOFT}}"
check "result 1: tumbling_e (left eye soft) → next test" 200 "d['type'] == 'next_test' and d['result']['status'] == 'mild' and d['result']['eyes']['left']['value'] == '20/40'"
echo "        next: $(get "d['testId']") (added: $(get "d['added']"), $(get "d['reason']"))"

call POST "/sessions/$SID/results" '{"testId":"amsler","eye":"both","durationSec":60,"answers":{"right":{"gridSize":10,"marked":[],"allStraight":true},"left":{"gridSize":10,"marked":[44,45,54],"allStraight":false}}}'
check "result 2: amsler (left centre wavy) → red flag" 200 "d['type'] == 'red_flag' and 'left eye' in d['finding']"
echo "        finding: $(get "d['finding']")"

call POST "/sessions/$SID/results" '{"testId":"clock_dial","eye":"both","durationSec":40,"answers":{"right":{"darker":[],"allSame":true},"left":{"darker":["3-9"],"allSame":false}}}'
check "result 3: clock_dial" 200 "d['type'] in ('next_test', 'done') and d['result']['status'] == 'mild'"

call POST "/sessions/$SID/results" '{"testId":"contrast","eye":"both","durationSec":70,"answers":{"distanceCm":40,"calibrated":true,"letterHeightMm":5,"letters":[{"letter":"H","color":"#111111","contrast":0.994},{"letter":"O","color":"#888888","contrast":0.754},{"letter":"V","color":"#C4C4C4","contrast":0.448},{"letter":"K","color":"#E1E1E1","contrast":0.247},{"letter":"Z","color":"#F1F1F1","contrast":0.121},{"letter":"N","color":"#F8F8F8","contrast":0.061}],"faintestSeen":4,"noneSeen":false}}'
check "result 4: contrast" 200 "d['type'] in ('next_test', 'done') and d['result']['status'] == 'good'"

call POST "/sessions/$SID/verdict"
check "verdict" 200 "d['sessionId'] == '$SID' and d['headline'] and d['areas']['eye_health'] == 'see_doctor' and len(d['results']) == 4 and len(d['lens']) >= 1 and 'doctor' in d['advice'].lower()"
echo "        headline: $(get "d['headline']")"
echo "        advice: $(get "d['advice']")"
echo "        lens: $(get "', '.join(l['product'] for l in d['lens'])")"
call POST "/sessions/$SID/results" '{"testId":"amsler","eye":"both","durationSec":1,"answers":{}}'
check "result after verdict → 409" 409

echo "Other check modes"
call POST /sessions "{\"profileId\":\"$KID\",\"intake\":\"\",\"mode\":\"full\"}"
check "child's check → kids tests" 201 "[p['testId'] for p in d['plan']] == ['kids_tumbling_e', 'kids_colour_shapes']"
call POST /sessions "{\"profileId\":\"$ME\",\"intake\":\"\",\"mode\":\"glasses\"}"
check "glasses check → tumbling_e twice" 201 "[p['testId'] for p in d['plan']] == ['tumbling_e', 'tumbling_e']"
GID=$(get "d['sessionId']")
call POST "/sessions/$GID/results" "{\"testId\":\"tumbling_e\",\"eye\":\"both\",\"durationSec\":80,\"answers\":{\"right\":$E_SOFT,\"left\":$E_SOFT,\"round\":\"glasses_off\"}}"
check "glasses round 1 → round 2 next" 200 "d['type'] == 'next_test' and d['testId'] == 'tumbling_e'"
call POST "/sessions/$GID/results" "{\"testId\":\"tumbling_e\",\"eye\":\"both\",\"durationSec\":80,\"answers\":{\"right\":$E_GOOD,\"left\":$E_GOOD,\"round\":\"glasses_on\"}}"
check "glasses round 2 → done" 200 "d['type'] == 'done'"
call POST "/sessions/$GID/verdict"
check "glasses verdict" 200 "d['headline'] == 'Your glasses still work well'"
call POST /sessions "{\"profileId\":\"$ME\",\"intake\":\"\",\"mode\":\"single\",\"testId\":\"eye_strain\"}"
check "single test" 201 "[p['testId'] for p in d['plan']] == ['eye_strain']"
call POST /sessions "{\"profileId\":\"$ME\",\"intake\":\"\",\"mode\":\"single\"}"
check "single test without testId → 400" 400
call POST /sessions '{"profileId":"00000000-0000-0000-0000-000000000000","intake":"","mode":"quick"}'
check "someone else's profile → 404" 404

echo "History and sharing"
call GET /sessions
check "GET /sessions (newest first)" 200 "len(d) == 2 and d[0]['id'] == '$GID' and d[1]['id'] == '$SID' and d[1]['status'] == 'see_doctor' and d[1]['scores']['tumbling_e'] > 0"
call GET "/sessions/$SID"
check "GET /sessions/:id" 200 "d['sessionId'] == '$SID' and d['date'] and d['minutes'] >= 1"
call POST "/sessions/$SID/share"
check "share link" 200 "'/r/' in d['url'] and d['expiresAt']"
SHARE_TOKEN=$(get "d['url'].rsplit('/', 1)[1]")
SAVED_TOKEN=$TOKEN; TOKEN=""
call GET "/reports/$SHARE_TOKEN"
check "shared report opens without login" 200 "d['sessionId'] == '$SID'"
TOKEN=$SAVED_TOKEN
call GET /sessions/not-a-session
check "unknown check → 404" 404

echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" = 0 ]
