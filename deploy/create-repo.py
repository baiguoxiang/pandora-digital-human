import requests
import json

token = input('请输入你的 GitHub Personal Access Token (https://github.com/settings/tokens): ')

headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json'
}

data = {
    'name': 'pandora-digital-human',
    'description': '潘多拉数字人网站',
    'private': False
}

response = requests.post('https://api.github.com/user/repos', headers=headers, json=data)

if response.status_code == 201:
    print('仓库创建成功!')
    print('https://github.com/baiguoxiang/pandora-digital-human')
else:
    print(f'创建失败: {response.status_code}')
    print(response.text)
