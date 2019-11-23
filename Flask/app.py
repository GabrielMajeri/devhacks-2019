from flask import Flask, render_template, request, redirect, url_for
import json
import requests
app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != 'admin' or request.form['password'] != 'admin':
            error = 'Invalid Credentials. Please try again.'
        else:
            return redirect('/dashboard')
    return render_template('index.html', error=error)



@app.route('/card/<id_card>')
def card(id_card):
    # card = carddul cu id_card
    # tranzactii de card[id_card]
    tranzactiile = []
    tranzactiile.append({
                        'valoare1': 11,
                        'valoare2': 22,
                        'valoare3': 33})
    return render_template('card.html', tranzactii=tranzactiile)


@app.route('/dashboard', methods=['GET'])
def index():
    carduri = []
    carduri.append({
        'nume': 'Popescu',
        'cifre_card': '1234 5678 9012 34',
        'valid_date': '10/22',
        'card': 'raifeissen',
        'cvv': 123,
        'valoare': 1234.56})
    carduri.append({
        'nume': 'Ionescu',
        'cifre_card': '4321 1243 2356 8655',
        'valid_date': '11/24',
        'card': 'bcr',
        'cvv': 456,
        'valoare': 509.21})
    return render_template('dashboard.html', cards=carduri)


@app.route('/dashboard', methods=['POST'])
def handle_data():
    return "'2'"



if __name__ == '__main__':
    app.run()
