import os

workflow_content = '''name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/checkout@v4

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
'''

target_dir = r'D:\Backup\Documents\数字人\codes\matesx\.github\workflows'
os.makedirs(target_dir, exist_ok=True)

filepath = os.path.join(target_dir, 'deploy-gh-pages.yml')
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(workflow_content)

print(f'Written to: {filepath}')
print('Done!')
