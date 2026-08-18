import re

with open('frontend/e2e/real-auth.spec.ts', 'r') as f:
    content = f.read()

# Fix getByText('Student') which matched multiple elements (student role vs Student Tester)
content = content.replace(
    "expect(page.getByText('Student')).toBeVisible()",
    "expect(page.getByText('Student Tester')).toBeVisible()"
)

with open('frontend/e2e/real-auth.spec.ts', 'w') as f:
    f.write(content)
