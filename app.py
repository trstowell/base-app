from flask import Flask, render_template

app = Flask(__name__, static_url_path="/static")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return render_template('index.html')

if __name__ == '__main__':
    app.run(port=8888, debug=True)
