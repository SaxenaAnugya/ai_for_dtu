# import requests as re
# response = re.get("https://dtu.bestbookbuddies.com/cgi-bin/koha/opac-user.pl")
# print(response.text)
# 
import requests

response = requests.get('https://dtu.bestbookbuddies.com/cgi-bin/koha/opac-user.pl')
print(response.text)