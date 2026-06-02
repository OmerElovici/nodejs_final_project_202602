import requests

# The first will handle the logs. (a)
# The second will handle all user-related tasks. (b)
# The third will handle all cost-related tasks. (c)
# The fourth will handle any admin-related tasks (e.g. developers details) (d)

a = "https://nodejs-final-project-202602.onrender.com/logs"
b = "https://nodejs-final-project-202602.onrender.com/users"
c = "https://nodejs-final-project-202602.onrender.com/costs"
d = "https://nodejs-final-project-202602.onrender.com/about"

print("a=" + a)
print("b=" + b)
print("c=" + c)
print("d=" + d)
print()

print("testing getting the about")
print("-------------------------")
try:
 text = ""
 # getting details of team manager
 url = d + "/api/about/"
 data = requests.get(url)
 print("url=" + url)
 print("data.status_code=" + str(data.status_code))
 print(data.content)
 print("data.text=" + data.text)
 print(data.json())
except Exception as e:
 print("problem")
 print(e)

print("")
print()

print("testing getting the report - 1")
print("------------------------------")
try:
 text = ""
 # getting the report
 url = c + "/api/report/?id=123123&year=2026&month=1"
 data = requests.get(url)
 print("url=" + url)
 print("data.status_code=" + str(data.status_code))
 print(data.content)
 print("data.text=" + data.text)
 print(text)
except Exception as e:
 print("problem")
 print(e)

print("")
print()

print("testing adding cost item")
print("----------------------------------")
try:
 text = ""
 url = c + "/api/add/"
 data = requests.post(url,
       json={'userid': 123123, 'description': 'milk 9', 'category': 'food', 'sum': 8})
 print("url=" + url)
 print("data.status_code=" + str(data.status_code))
 print(data.content)
except Exception as e:
 print("problem")
 print(e)

print("")
print()

print("testing getting the report - 2")
print("------------------------------")
try:
 text = ""
 # getting the report
 url = c + "/api/report/?id=123123&year=2026&month=5"
 data = requests.get(url)
 print("url=" + url)
 print("data.status_code=" + str(data.status_code))
 print(data.content)
 print("data.text=" + data.text)
 print(text)
except Exception as e:
 print("problem")
 print(e)

print("")

print("testing adding user with missing birthday")
print("-----------------------------------------")
try:
 url = b + "/api/add/"
 data = requests.post(url,
       json={'id': 999999, 'firstName': 'David', 'lastName': 'Yakhin'})
 print("url=" + url)
 print("data.status_code=" + str(data.status_code))
 print(data.content)
except Exception as e:
 print("problem")
 print(e)

print("")
print()

print("testing adding cost item with negative sum")
print("------------------------------------------")
try:
 url = c + "/api/add/"
 data = requests.post(url,
       json={'userid': 123123, 'description': 'negative item', 'category': 'food', 'sum': -10})
 print("url=" + url)
 print("data.status_code=" + str(data.status_code))
 print(data.content)
except Exception as e:
 print("problem")
 print(e)

print("")
print()

print("testing adding cost item with invalid category")
print("----------------------------------------------")
try:
 url = c + "/api/add/"
 data = requests.post(url,
       json={'userid': 123123, 'description': 'invalid category', 'category': 'invalid_cat', 'sum': 20})
 print("url=" + url)
 print("data.status_code=" + str(data.status_code))
 print(data.content)
except Exception as e:
 print("problem")
 print(e)

print("")
print()

print("testing adding user with non-numeric ID")
print("---------------------------------------")
try:
 url = b + "/api/add/"
 data = requests.post(url,
       json={'id': 'abc', 'firstName': 'David', 'lastName': 'Yakhin', 'birthday': '1990-01-01'})
 print("url=" + url)
 print("data.status_code=" + str(data.status_code))
 print(data.content)
except Exception as e:
 print("problem")
 print(e)

print("")
print()

print("testing adding user with non-positive ID")
print("----------------------------------------")
try:
 url = b + "/api/add/"
 data = requests.post(url,
       json={'id': -123, 'firstName': 'David', 'lastName': 'Yakhin', 'birthday': '1990-01-01'})
 print("url=" + url)
 print("data.status_code=" + str(data.status_code))
 print(data.content)
except Exception as e:
 print("problem")
 print(e)

print("")
print()

print("testing adding cost item with non-numeric userId")
print("------------------------------------------------")
try:
 url = c + "/api/add/"
 data = requests.post(url,
       json={'userid': 'abc', 'description': 'milk', 'category': 'food', 'sum': 10})
 print("url=" + url)
 print("data.status_code=" + str(data.status_code))
 print(data.content)
except Exception as e:
 print("problem")
 print(e)

print("")
print()

print("testing adding cost item with non-positive userId")
print("-------------------------------------------------")
try:
 url = c + "/api/add/"
 data = requests.post(url,
       json={'userid': -123, 'description': 'milk', 'category': 'food', 'sum': 10})
 print("url=" + url)
 print("data.status_code=" + str(data.status_code))
 print(data.content)
except Exception as e:
 print("problem")
 print(e)

print("")


