
from flask import Flask
import json
app = Flask(__name__)

@app.route('/homepage')
def hello_world():
    return {"member_name": ["Member1", "Member2", "Member3"]}

if __name__ == "__main__":
    app.run(debug=True)

