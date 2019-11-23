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



@app.route('/card/<iban_card>')
def card(iban_card):
    # card = carddul cu id_card
    # tranzactii de card[id_card]
    tranzactiile = []
    idul = 1
    response = requests.get('http://192.168.87.157:5000/transactions/'+str(iban_card))
    response = response.content
    response = json.loads(response)[0]
    response = response['transactions']
    for elements in response:
        tranzactiile.append({
                        'id': idul,
                        'data': elements['date'].replace('T',' ').replace('Z','').split('.')[0],
                        'value': elements['value'],
                        'vendor': elements['vendor']})
        idul += 1 
                        
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
            'create_date':elements['createdAt'].replace('T',' ').replace('Z','').split('.')[0]
            })

    return render_template('dashboard.html', cards=carduri)


@app.route('/dashboard', methods=['POST'])
def handle_data():
    if  request.form['bank'].lowercase() in ['bcr','reiffeisen']:
        json={'accountName': request.form['name'],'IBAN': request.form['iban'],'bank': request.form['bank'].lowercase()}
    else:
        json={'accountName': request.form['name'],'IBAN': request.form['iban'],'bank': 'simplu'}


    requests.post('http://192.168.87.157:5000/accounts', json=json)
    return redirect('/dashboard')



if __name__ == '__main__':
    app.run()
