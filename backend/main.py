from flask import Flask

app = Flask(__name__)

#store games
games = {};


# API Route (Test)
@app.route("/tests")
def tests():
    return {"tests": ["Hi I am Test 1", "And I am Test 2", "And don't forget test 3"]}

if __name__ == "__main__":
    app.run(debug = True)
