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
    response = requests.get('http://192.168.87.157:5000/cards')
    response = response.content
    response = json.loads(response)[0]
    for elements in response:
        carduri.append({
            'nume': elements['name'],
            'cifre_card': elements['number'],
            'valid_date': elements['expiryDate'],
            'card': elements['bank'],
            'cvv': elements['CVV'],
            'valoare': elements[''],
            'id': elements['_id'],
            'iban': elements['attachedIBAN']
            })

    return render_template('dashboard.html', cards=carduri)


@app.route('/dashboard', methods=['POST'])
def handle_data():
    return "'2'"



if __name__ == '__main__':
    app.run()
