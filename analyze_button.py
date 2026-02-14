
filepath = '/Users/p.thuyen/Documents/ProjectFBTUan/fx.html'

key_phrase = 'Log in with Facebook'

with open(filepath, 'r') as f:
    content = f.read()

index = content.find(key_phrase)
if index == -1:
    print("Phrase not found")
else:
    # Search backwards for the opening div with role="button"
    start_search = max(0, index - 2000)
    chunk = content[start_search:index]
    
    # We are looking for the last <div ... role="button" ...> before the text
    # It seems the text is inside several nested divs.
    # The structure looks like:
    # <div class="..." role="button" tabindex="0">
    #   <div role="none" ...>
    #     ... Log in with Facebook ...
    #   </div>
    # </div>
    
    # Let's find the pos of 'role="button"' before the text
    role_button_pos = chunk.rfind('role="button"')
    
    if role_button_pos != -1:
        # Find the start of the tag containing this role="button"
        open_tag_pos = chunk.rfind('<div', 0, role_button_pos)
        if open_tag_pos != -1:
            full_pos = start_search + open_tag_pos
            print(f"Found potential button start at index: {full_pos}")
            print(f"Snippet starting there: {content[full_pos:full_pos+300]}...")
            
            # Use BeautifulSoup or simple string manip to wrap or replace
            # Since I don't have bs4 installed in this environment usually, I'll stick to string manip if simple
            
            # I will try to replace the 'role="button"' with 'role="link"' and add an onclick or wrap it.
            # Actually, simply adding onclick="window.location.href='/login'" to the div might be the easiest way 
            # without breaking the complex CSS class structure.
            
            # Let's see if we can just add the onclick attribute.
            tag_end = content.find('>', full_pos)
            print(f"Tag ends at: {tag_end}")
            
            # Check if onclick already exists
            tag_content = content[full_pos:tag_end]
            if 'onclick' in tag_content:
                print("Element already has onclick")
            else:
                print("Element does not have onclick")
        else:
            print("Could not find <div before role='button'")
    else:
        print("Could not find role='button' before text")
