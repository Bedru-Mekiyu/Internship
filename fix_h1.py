import re

with open('frontend/src/pages/main/MarketingHomepagePage.tsx', 'r') as f:
    content = f.read()

# Replace <Typography variant="h2" with <Typography variant="h1" component="h1" for the hero section
content = content.replace(
    '<Typography variant="h2"',
    '<Typography variant="h1"'
)

with open('frontend/src/pages/main/MarketingHomepagePage.tsx', 'w') as f:
    f.write(content)
