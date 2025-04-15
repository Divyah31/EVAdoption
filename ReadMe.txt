Simple Web Application Using Flask Framework

Database Query: Connect to MySQL database and query data from the melbourne_cbd_shape table.
Data Display: Use Jinja2 template engine to display queried data on the webpage.
Configuration Management: Store username and password for database connection in a config.ini file.
init.py: Flask application initialization

Project Structure Introduction:
① app/templates/:
This folder contains all HTML template files. Flask uses the Jinja2 template engine to render these templates. HTML files can use Jinja2 syntax to dynamically display data passed from the backend.
Example: index.html is the main page template of the application, responsible for displaying data queried from the database.

② app/static/:
This folder stores static files such as CSS stylesheets, JavaScript files, and images.
Example: styles.css is the application's style file, defining the appearance and layout of the webpage.

③ app/models.py: (models are not mandatory)
This file contains definitions of database model classes. It's used for performing query, insert, update, and delete operations.
Example: The MelbourneCBDShape model class corresponds to the melbourne_cbd_shape table in the database, defining the type and name of each field.

④ app/routes.py:
Responsible for handling route requests.
@main_routes.route('/')
This is a route decorator used to associate the URL path '/' with the index() view function below.
When a user visits http://127.0.0.1:5000/, Flask will call this index() function to handle the request.
@main_routes.route('/about')
This is another route decorator used to associate the URL path '/about' with the about() view function.
When a user visits http://127.0.0.1:5000/about, Flask will call this about() function to handle the request.

⑤ app/shape_service.py:
One webpage, one backend, handling frontend and backend logic processing.

⑥ requirements.txt:
A list of dependency packages used to import the dependencies required by the program.



How to Run the Program:
Create a Python virtual environment in the project root directory:
Windows:
① In the Visual Studio Code terminal, enter:
venv\Scripts\activate
to create a virtual environment.
② Activate the virtual environment:
venv\Scripts\activate
③ Install dependencies:
pip install -r requirements.txt
④ Run the program:
python run.py





