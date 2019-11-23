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
                        'id': 1,
                        'data': 2,
                        'value': 22,
                        'vendor': 11,
                        })

    tranzactiile.append({
                        'id': 1,
                        'data': 2,
                        'value': 22,
                        'vendor': 11,
                        })

    tranzactiile.append({
                        'id': 1,
                        'data': 2,
                        'value': 22,
                        'vendor': 11,
                        })
                        
    return render_template('card.html', tranzactii=tranzactiile)


@app.route('/dashboard', methods=['GET'])
def index():
    carduri = []
    response = requests.get('http://192.168.87.157:5000/accounts')
    response = response.content
    response = json.loads(response)
    for elements in response:
        carduri.append({
            'nume': elements['name'],
            'card': elements['bank'],
            'iban': elements['IBAN'],
            'sold':elements['sold'],
            'create_date':elements['createdAt']
            })

    return render_template('dashboard.html', cards=carduri)


@app.route('/dashboard', methods=['POST'])
def handle_data():
    return "'2'"



if __name__ == '__main__':
    app.run()
