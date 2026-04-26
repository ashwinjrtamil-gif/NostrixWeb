import os, urllib.parse, re, sqlite3
from flask import Flask, render_template, request, jsonify
import yfinance as yf
from curl_cffi import requests as stealth_requests
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)

# --- SOVEREIGN KERNEL ---
MODEL = SentenceTransformer('all-MiniLM-L6-v2')
TECH_UNITS = r'(\d+\.?\d*\s?(kN|lbf|kg|Mach|Isp|psi|pa|rpm|V|A|MW|km/s|m/s|thrust|torque|bypass))'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/execute', methods=['POST'])
def execute():
    query = request.json.get('query', '').strip()
    q_clean = query.upper()

    # 1. INTENT REDIRECTION
    if re.match(r'^[A-Z]{1,5}$', q_clean):
        return jsonify(execute_stock(q_clean))
    else:
        return jsonify(execute_rag(query))

def execute_stock(ticker):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return {
            "intent": "FINANCE", "symbol": ticker,
            "price": info.get('currentPrice', 0),
            "mcap": round(info.get('marketCap', 0) / 1e9, 2),
            "summary": info.get('longBusinessSummary', "No profile available.")
        }
    except: return execute_rag(ticker)

def execute_rag(query):
    try:
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}+specs"
        r = stealth_requests.get(url, impersonate="chrome120", timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        
        nodes = []
        q_emb = MODEL.encode(query)
        for res in soup.select(".result")[:10]:
            a = res.select_one("a.result__a")
            if not a: continue
            href = a.get("href")
            link = urllib.parse.unquote(href.split('uddg=')[1].split('&')[0]) if 'uddg=' in href else href
            snip = res.select_one(".result__snippet").get_text().strip() if res.select_one(".result__snippet") else ""
            
            score = float(util.cos_sim(q_emb, MODEL.encode(a.get_text() + " " + snip))[0][0])
            nodes.append({"title": a.get_text(), "url": link, "snippet": snip, "score": score})

        nodes.sort(key=lambda x: x['score'], reverse=True)
        units = list(set([m[0] for m in re.findall(TECH_UNITS, " ".join([n['snippet'] for n in nodes]), re.I)]))
        
        return {
            "intent": "RESEARCH", "query": query, "results": nodes,
            "summary": " ".join([n['snippet'] for n in nodes[:3]]), "units": units
        }
    except Exception as e: return {"error": str(e)}

if __name__ == "__main__":
    app.run(debug=True, port=5000)
