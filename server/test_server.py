from flask import Flask, render_template, request, jsonify
import google.generativeai as genai

app = Flask(__name__)


#API_KEY = 'your_api_key_here'

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route('/check_relevance', methods=['POST'])
def check_relevance():
    
    data = request.json
    context_data = data["context"]
    url =  data["url"]
    
    
    text = "{}\ncan you say whether the content of the website with the following URL is relevant to the intention stated (yes/no)?:\n{}".format(context_data, url)
    
    response = model.generate_content(text)
    
    
    flag = False
    
    if("yes" in response.text.lower().strip()):
        flag = True
        
    print("\ncontext:{}\nurl:{}\nrelevance{}\n".format(context_data, url, flag))
    
    return jsonify({"relevance": flag}), 200


if __name__ == '__main__':
    app.run(debug=True)