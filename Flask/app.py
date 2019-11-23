from flask import Flask, render_template, request, redirect, url_for
app = Flask(__name__)


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != 'admin' or request.form['password'] != 'admin':
            error = 'Invalid Credentials. Please try again.'
        else:
            return redirect('/')
    return render_template('index.html', error=error)


@app.route('/')
def index():
    return render_template('dashboard.html')



if __name__ == '__main__':
    app.run()