import requests
import json
from datetime import datetime

# Microservice URLs
a = "https://nodejs-final-project-202602.onrender.com/logs"
b = "https://nodejs-final-project-202602.onrender.com/users"
c = "https://nodejs-final-project-202602.onrender.com/costs"
d = "https://nodejs-final-project-202602.onrender.com/about"

print("==================================================")
print("     COMPREHENSIVE FINAL PROJECT TEST SUITE       ")
print("==================================================")
print(f"Logs URL (a):  {a}")
print(f"Users URL (b): {b}")
print(f"Costs URL (c): {c}")
print(f"About URL (d): {d}")
print("==================================================\n")

def run_test(test_name, action):
    try:
        action()
    except Exception as e:
        print(f"[\u001b[31mFAIL\u001b[0m] {test_name}")
        print(f"      Error: {e}\n")

# 1. Test Getting About
def test_about():
    url = f"{d}/api/about/"
    res = requests.get(url)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    team = res.json()
    assert isinstance(team, list) and len(team) > 0, "Team structure is incorrect"
    assert "firstName" in team[0] and "lastName" in team[0], "Team member keys are missing"
    print(f"[\u001b[32mPASS\u001b[0m] 1. Get About Endpoint: {team}")

run_test("Get About Details", test_about)

# 2. Test User Casing Normalization (kebab-case & UPPERCASE)
def test_user_normalization():
    url = f"{b}/api/add/"
    payload = {
        "ID": 987654,
        "first-name": "Test",
        "LAST_NAME": "User",
        "birth-day": "1995-05-15"
    }
    res = requests.post(url, json=payload)
    if res.status_code == 400 and "duplicate" in res.text.lower():
        print(f"[\u001b[32mPASS\u001b[0m] 2. User Casing Normalization: User already exists, duplication handled correctly")
        return
    
    assert res.status_code == 200, f"Expected 200, got {res.status_code}. Response: {res.text}"
    user = res.json()
    assert user["id"] == 987654, "ID was not saved correctly"
    assert user["firstName"] == "Test", "firstName normalization failed"
    assert user["lastName"] == "User", "lastName normalization failed"
    print(f"[\u001b[32mPASS\u001b[0m] 2. User Casing Normalization: Successfully normalized & created user 987654")

run_test("User Normalization", test_user_normalization)

# 3. Test Cost Casing Normalizations (camelCase, snake_case, kebab-case, lowercase)
def test_cost_normalization_camelcase():
    url = f"{c}/api/add/"
    payload = {
        "userId": 123123,
        "description": "camelCase test",
        "category": "health",
        "sum": 15
    }
    res = requests.post(url, json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}. Response: {res.text}"
    assert res.json()["userId"] == 123123
    print(f"[\u001b[32mPASS\u001b[0m] 3a. Cost Casing: camelCase (userId) works")

run_test("Cost Casing: camelCase", test_cost_normalization_camelcase)

def test_cost_normalization_lowercase():
    url = f"{c}/api/add/"
    payload = {
        "userid": 123123,
        "description": "lowercase test",
        "category": "food",
        "sum": 10
    }
    res = requests.post(url, json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}. Response: {res.text}"
    assert res.json()["userId"] == 123123
    print(f"[\u001b[32mPASS\u001b[0m] 3b. Cost Casing: lowercase (userid) works")

run_test("Cost Casing: lowercase", test_cost_normalization_lowercase)

def test_cost_normalization_kebabcase():
    url = f"{c}/api/add/"
    payload = {
        "user-id": 123123,
        "desc": "kebab-case test",
        "category": "housing",
        "amount": 250
    }
    res = requests.post(url, json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}. Response: {res.text}"
    data = res.json()
    assert data["userId"] == 123123, "user-id normalization failed"
    assert data["description"] == "kebab-case test", "desc -> description normalization failed"
    assert data["sum"] == 250, "amount -> sum normalization failed"
    print(f"[\u001b[32mPASS\u001b[0m] 3c. Cost Casing: kebab-case (user-id, desc, amount) works")

run_test("Cost Casing: kebab-case", test_cost_normalization_kebabcase)

def test_cost_normalization_snakecase():
    url = f"{c}/api/add/"
    payload = {
        "user_id": 123123,
        "description": "snake_case test",
        "category": "sports",
        "sum": 45,
        "created_at": datetime.now().isoformat()
    }
    res = requests.post(url, json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}. Response: {res.text}"
    assert res.json()["userId"] == 123123
    print(f"[\u001b[32mPASS\u001b[0m] 3d. Cost Casing: snake_case (user_id, created_at) works")

run_test("Cost Casing: snake_case", test_cost_normalization_snakecase)

# 4. Test Validation Errors
def test_validation_missing_fields():
    url = f"{c}/api/add/"
    payload = {
        "userId": 123123,
        "category": "food"
    }
    res = requests.post(url, json=payload)
    assert res.status_code == 400, f"Expected 400 for missing fields, got {res.status_code}"
    print(f"[\u001b[32mPASS\u001b[0m] 4a. Validation: Rejects missing fields correctly")

run_test("Validation: Missing Fields", test_validation_missing_fields)

def test_validation_invalid_category():
    url = f"{c}/api/add/"
    payload = {
        "userId": 123123,
        "description": "invalid category test",
        "category": "travel",
        "sum": 8
    }
    res = requests.post(url, json=payload)
    assert res.status_code == 400, f"Expected 400 for invalid category, got {res.status_code}"
    print(f"[\u001b[32mPASS\u001b[0m] 4b. Validation: Rejects invalid category ('travel') correctly")

run_test("Validation: Invalid Category", test_validation_invalid_category)

def test_validation_past_date():
    url = f"{c}/api/add/"
    payload = {
        "userId": 123123,
        "description": "past date test",
        "category": "food",
        "sum": 8,
        "createdAt": "2000-01-01T00:00:00.000Z"
    }
    res = requests.post(url, json=payload)
    assert res.status_code == 400, f"Expected 400 for past date backdating, got {res.status_code}"
    print(f"[\u001b[32mPASS\u001b[0m] 4c. Validation: Prevents backdating to the past correctly")

run_test("Validation: Backdating Prevention", test_validation_past_date)

def test_validation_non_existent_user():
    url = f"{c}/api/add/"
    payload = {
        "userId": 999999,
        "description": "ghost cost",
        "category": "food",
        "sum": 8
    }
    res = requests.post(url, json=payload)
    assert res.status_code == 400, f"Expected 400 for non-existent user, got {res.status_code}"
    print(f"[\u001b[32mPASS\u001b[0m] 4d. Validation: Rejects non-existent user correctly")

run_test("Validation: Non-existent User", test_validation_non_existent_user)

# 5. Test Reports & Computed Design Pattern
def test_empty_report():
    url = f"{c}/api/report/?id=123123&year=2026&month=1"
    res = requests.get(url)
    assert res.status_code == 200
    report = res.json()
    assert report["userId"] == 123123
    assert report["year"] == 2026
    assert report["month"] == 1
    for cat_data in report["costs"]:
        for cat, items in cat_data.items():
            assert len(items) == 0
    print(f"[\u001b[32mPASS\u001b[0m] 5a. Computed Report: January 2026 report is empty as expected")

run_test("Computed Report: Empty month", test_empty_report)

def test_populated_report():
    current_year = datetime.now().year
    current_month = datetime.now().month
    url = f"{c}/api/report/?id=123123&year={current_year}&month={current_month}"
    res = requests.get(url)
    assert res.status_code == 200
    report = res.json()
    assert report["userId"] == 123123
    assert report["year"] == current_year
    assert report["month"] == current_month
    
    categories_found = []
    for cat_data in report["costs"]:
        for cat, items in cat_data.items():
            if len(items) > 0:
                categories_found.append(cat)
    
    assert len(categories_found) > 0
    print(f"[\u001b[32mPASS\u001b[0m] 5b. Computed Report: Current month ({current_year}/{current_month}) contains the normalized costs: {categories_found}")

run_test("Computed Report: Populated month", test_populated_report)

# 6. Verify System Logs
def test_logs():
    url = f"{a}/api/logs/"
    res = requests.get(url)
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    print(f"[\u001b[32mPASS\u001b[0m] 6. System Logs: Logs retrieved successfully. Total logs: {len(logs)}")

run_test("System Logs Retrieval", test_logs)

# ================= ADVANCED BOUNDARY & SECURITY TESTS =================

# 7. Boundary Conditions: Missing Query Parameter in Report
def test_missing_report_param():
    url = f"{c}/api/report/?id=123123&month=1"  # missing 'year'
    res = requests.get(url)
    # Your integration tests explicitly expect a 500 status code for missing report parameters.
    assert res.status_code == 500, f"Expected 500 for missing param, got {res.status_code}"
    print(f"[\u001b[32mPASS\u001b[0m] 7. Boundary Case: Missing 'year' correctly returns 500")

run_test("Report Parameter Boundary", test_missing_report_param)

# 8. Type Safety: Non-numeric Sum in Cost payload
def test_non_numeric_sum():
    url = f"{c}/api/add/"
    payload = {
        "userId": 123123,
        "description": "text sum test",
        "category": "food",
        "sum": "ten dollars"  # non-numeric string
    }
    res = requests.post(url, json=payload)
    assert res.status_code == 400, f"Expected 400 for string sum, got {res.status_code}"
    print(f"[\u001b[32mPASS\u001b[0m] 8. Type Safety: Non-numeric 'sum' string is safely rejected with 400")

run_test("Type Safety: Non-numeric Sum", test_non_numeric_sum)

# 9. CORS Policy check
def test_cors_headers():
    url = f"{d}/api/about/"
    res = requests.get(url)
    cors_header = res.headers.get("Access-Control-Allow-Origin", "")
    assert cors_header == "*", f"Expected Access-Control-Allow-Origin: *, got '{cors_header}'"
    print(f"[\u001b[32mPASS\u001b[0m] 9. CORS Policy: Access-Control-Allow-Origin: * header is present")

run_test("CORS Header Verification", test_cors_headers)

# 10. NoSQL Query Injection Block
def test_nosql_injection():
    url = f"{c}/api/add/"
    payload = {
        "userId": {"$ne": None},  # NoSQL injection attempt
        "description": "NoSQL Injection Test",
        "category": "food",
        "sum": 10
    }
    res = requests.post(url, json=payload)
    # The server should safely reject this query with 400 Bad Request
    assert res.status_code == 400, f"Expected 400 for NoSQL injection, got {res.status_code}"
    print(f"[\u001b[32mPASS\u001b[0m] 10. Security: NoSQL Operator Injection is safely blocked")

run_test("Security: NoSQL Injection Block", test_nosql_injection)

# 11. Wrong HTTP Method Safety
def test_wrong_http_method():
    url = f"{c}/api/add/"  # POST-only route
    res = requests.get(url)
    # Express will return a 404 for GET /api/add as it's not defined
    assert res.status_code == 404, f"Expected 404 for GET on POST-only route, got {res.status_code}"
    print(f"[\u001b[32mPASS\u001b[0m] 11. Endpoint Safety: GET on POST-only route correctly yields 404")

run_test("Endpoint Safety: Wrong HTTP Method", test_wrong_http_method)

print("\n==================================================")
print("              TESTING SUITE COMPLETE              ")
print("==================================================")
