
import os
import random
import string

def generate_token(length=100):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

file_path = '/Users/p.thuyen/Documents/ProjectFBTUan/fx.html'
token = generate_token()
new_url = f'/two_step_verification/login?token={token}'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_string = "onclick=\"window.location.href='/login'\""
new_string = f"onclick=\"window.location.href='{new_url}'\""

if old_string in content:
    new_content = content.replace(old_string, new_string)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully replaced. New URL: {new_url}")
else:
    print("Pattern not found in file.")
