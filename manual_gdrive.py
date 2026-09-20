import requests
import re
import os

def download_file_from_google_drive(id, destination):
    URL = "https://docs.google.com/uc?export=download"

    session = requests.Session()

    response = session.get(URL, params = { 'id' : id }, stream = True)
    token = get_confirm_token(response)
    
    if token:
        params = { 'id' : id, 'confirm' : token }
        response = session.get(URL, params = params, stream = True)
        
    print(f"Status Code: {response.status_code}")
    
    cd = response.headers.get('Content-Disposition')
    if cd:
        print("Content-Disposition:", cd)
        fname = re.findall(r'filename=\"?([^\"]+)\"?', cd)
        if not fname:
            fname = re.findall(r'filename=([^;]+)', cd)
        if fname:
            destination = 'temp_missing/' + fname[0].strip('\"\'')
            
    print(f"Downloading to {destination}...")
    save_response_content(response, destination)    

def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            return value
    return None

def save_response_content(response, destination):
    CHUNK_SIZE = 32768
    with open(destination, "wb") as f:
        for chunk in response.iter_content(CHUNK_SIZE):
            if chunk: # filter out keep-alive new chunks
                f.write(chunk)

os.makedirs('temp_missing', exist_ok=True)
download_file_from_google_drive('1CTyxkuRunbTaZdIoZDrsvIvy-fV9Gu2s', 'temp_missing/test.png')
