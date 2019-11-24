from flask import Flask, render_template, request, redirect, url_for
import math
import json
import requests
import calendar
import datetime

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

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
    response = json.loads(response)
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
        if elements['bank'].lower() in ['bcr','raiffeisen']:
            carduri.append({
                'nume': elements['name'],
                'card': elements['bank'].lower(),
                'iban': elements['IBAN'],
                'sold':elements['sold'],
                'create_date':elements['createdAt'].replace('T',' ').replace('Z','').split('.')[0]
                })
        else:
            carduri.append({
                'nume': elements['name'],
                'card': 'simplu',
                'iban': elements['IBAN'],
                'sold':elements['sold'],
                'create_date':elements['createdAt'].replace('T',' ').replace('Z','').split('.')[0]
                })


    return render_template('dashboard.html', cards = carduri)


@app.route('/dashboard', methods=['POST'])
def handle_data():
    if  request.form['bank'].lowercase() in ['bcr','raiffeisen']:
        json={'accountName': request.form['name'],'IBAN': request.form['iban'],'bank': request.form['bank'].lowercase()}
    else:
        json={'accountName': request.form['name'],'IBAN': request.form['iban'],'bank': 'simplu'}

    requests.post('http://192.168.87.157:5000/accounts', json=json)
    return redirect('/dashboard')

@app.route("/profile", methods=['GET'])
def profile():
    # code
    return render_template('profile.html')

@app.route("/achievements", methods=['GET'])
def achievements():
    # code
    return render_template('achievements.html')


@app.route('/calendar', methods=['GET'])
def show_calendar():
    now = datetime.datetime.now()
    nr = calendar.monthrange(now.year, now.month)[1]
    m = now.month
    mth = calendar.month_name[m]
    progreses = [0]*31
    x=requests.get("http://192.168.87.157:5000/accounts")
    x=x.content
    x=json.loads(x)
    for e in x:
        iban_card = e['IBAN']
        data = [now.year,m,0,'00','00','00','000']
        for i in range(1, nr+1):
                data[2] += 1
                date1 = str(data[0])+"-"+str(data[1])+"-"+str(data[2])+"T"+str(data[3])+":"+str(data[4])+":"+str(data[5])+"."+str(data[6])+'Z'
                response = requests.get('http://192.168.87.157:5000/transactions/'+str(iban_card) + '/' +str(date1))
                response = response.content
                response = json.loads(response)
                response = response['transactions']
                if response == []:
                    progreses[i]+=0
                else:
                    progreses[i]+=response[0]['value']
    suma = sum(x for x in progreses)
    progreses = [round(x, 2) for x in progreses]
    return render_template('calendar.html', len = nr, month = mth, values = progreses, days_sum = round(suma, 2))

if __name__ == '__main__':
    app.run()
