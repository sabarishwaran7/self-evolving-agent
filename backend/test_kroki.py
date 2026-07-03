import urllib.request, zlib, base64

code = """graph LR
    classDef green fill:#8bc34a,stroke:#fff,color:#fff;
    classDef blue fill:#03a9f4,stroke:#fff,color:#fff;
    classDef purple fill:#9c27b0,stroke:#fff,color:#fff;
    classDef grey fill:#e0e0e0,stroke:#9e9e9e,color:#000;

    Landing[Landing Screen]:::green --> Login{Log In}:::blue
    Login --> Profile[Profile]:::green
    Profile --> Edit[Edit Profile]:::purple
    Register[Register Account]:::green --> Login
    Login --> Error[Login Error]:::green
    Error --> Email{Email}:::blue
    Email --> Register
    Email --> DB[(Database)]:::grey
    DB --> Send[Send Temporary Password]:::green
    Send --> Register"""

compressed = zlib.compress(code.encode('utf-8'), 9)
encoded = base64.urlsafe_b64encode(compressed).decode('utf-8')
url = f"https://kroki.io/mermaid/svg/{encoded}"

print("KROKI URL:", url)

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    urllib.request.urlopen(req)
    print("SUCCESS KROKI")
except Exception as e:
    print("ERROR KROKI:", e.read().decode('utf-8'))
