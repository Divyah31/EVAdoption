import configparser

config = configparser.ConfigParser()
config.read('config.ini')

class Config:
    SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{config['database']['user']}:" \
                              f"{config['database']['password']}@" \
                              f"{config['database']['host']}/" \
                              f"{config['database']['database']}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'your-secret-key'
