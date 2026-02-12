
import re

filepath = '/Users/p.thuyen/Documents/ProjectFBTUan/index.html'
with open(filepath, 'r') as f:
    content = f.read()

# Look for "Log in with Facebook" and surrounding tags to find the link
match = re.search(r'<a[^>]*href="([^"]*)"[^>]*>.*?Log in with Facebook.*?</a>', content, re.DOTALL | re.IGNORECASE)

if match:
    print(f"Found link: {match.group(0)}")
    print(f"Current href: {match.group(1)}")
else:
    # It might be in a different structure, maybe a button or div with onclick
    # Let's search for just the text and a bit of context
    idx = content.find("Log in with Facebook")
    if idx != -1:
        start = max(0, idx - 500)
        end = min(len(content), idx + 500)
        print(f"Context around 'Log in with Facebook':\n{content[start:end]}")
    else:
        print("Text 'Log in with Facebook' not found.")
