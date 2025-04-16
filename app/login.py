from flask import Blueprint, render_template, request, redirect, url_for, session
from functools import wraps
import configparser

login = Blueprint('login', __name__)

config = configparser.ConfigParser()
config.read('./config.ini')
LOGIN_PASSWORD = config['login_access']['login_password']

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login.login_route'))
        return f(*args, **kwargs)
    return decorated_function

@login.route('/login', methods=['GET', 'POST'])
def login_route():
    if request.method == 'POST':
        password = request.form.get('password')
        if password == LOGIN_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('main_routes.home'))
        else:
            return render_template('login.html', error="Invalid password")
    return render_template('login.html')

@login.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('main_routes.index'))