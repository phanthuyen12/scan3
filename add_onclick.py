
filepath = '/Users/p.thuyen/Documents/ProjectFBTUan/index.html'

with open(filepath, 'r') as f:
    content = f.read()

# Find "Log in with Facebook"
target_text = "Log in with Facebook"
idx = content.find(target_text)

if idx == -1:
    print("Target text not found")
else:
    # Search backwards for the opening tag of the button container
    # It should be a <div ... role="button" ...
    # We'll search backwards for 'role="button"' then the '<div' before it
    
    # define search area before text
    search_limit = 5000
    pre_text = content[max(0, idx-search_limit):idx]
    
    # Find the last occurrence of 'role="button"'
    role_btn_idx = pre_text.rfind('role="button"')
    
    if role_btn_idx != -1:
        # Find the start of the tag containing this attribute
        tag_start_rel = pre_text.rfind('<div', 0, role_btn_idx)
        
        if tag_start_rel != -1:
            abs_tag_start = max(0, idx-search_limit) + tag_start_rel
            
            # Now find where this tag ends (the first '>' after tag_start)
            tag_end = content.find('>', abs_tag_start)
            
            if tag_end != -1:
                original_tag = content[abs_tag_start:tag_end+1]
                
                # Check if we are modifying the correct button
                print(f"Found tag: {original_tag[:100]}...")
                
                # Verify this is indeed the container for our text (heuristic: it's the closest role=button)
                
                # Inject onclick
                if 'onclick' not in original_tag:
                    new_tag = original_tag[:-1] + ' onclick="window.location.href=\'/login\'">'
                    new_content = content[:abs_tag_start] + new_tag + content[tag_end+1:]
                    
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print("Successfully added onclick handler.")
                else:
                    print("Tag already has onclick handler.")
            else:
                print("Could not find end of tag.")
        else:
            print("Could not find <div start.")
    else:
        print("Could not find role='button'.")
