
from flask import Flask, request, redirect, url_for
import sys
import json
import pandas as pd
import os

app = Flask(__name__)
@app.route('/')
def hello_world():
    dataset = pd.read_csv(r"C:\Users\aviv\OneDrive\Desktop\highlights-extract-app\data_for_mturk.csv")
    id = request.args.get('id', default = 0, type = int)
    print(len(request.args))
    sys.stdout.flush()
    print(f"AVIVSL!!!")
    print(f"id is {str(id)}")
    sys.stdout.flush()
    curr_json = (dataset[dataset["id"] == int(id)]["json"]).item()
    return redirect(url_for(os.path.join("..", "public", "index.html"))) #redirect(url_for('homepage'))
if __name__ == "__main__":
    app.run(debug=True)

