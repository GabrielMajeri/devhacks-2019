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


@app.route('/cards', methods=['GET', 'POST'])
def cards():
    carduri = []
    carduri.append({
        'nume': 'Popescu',
        'ultimele_4_cifre_card': '1234',
        'valid_date': '10/22',
        'valoare': 1234.56})
    carduri.append({
        'nume': 'Ionescu',
        'ultimele_4_cifre_card': '4321',
        'valid_date': '11/24',
        'valoare': 509.21})

    return render_template('carduri.html', cards=carduri)


@app.route('/')
def index():
    return render_template('dashboard.html')



if __name__ == '__main__':
    app.run()