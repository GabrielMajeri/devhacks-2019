from flask import Flask, render_template, request, redirect
app = Flask(__name__)

@app.route('/')
def index():
	return render_template('index.html', parametru1="Macar", parametru2="merge")



if __name__ == '__main__':
    app.run()