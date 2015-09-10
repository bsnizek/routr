from flask import Flask, render_template
import jinja2
import os
from routr.helpers import Flask

root_path = '/'.join(os.path.abspath(__file__).split('/')[:-4])
static_folder = os.path.join(root_path, 'static')

print(static_folder)

app = Flask(__name__, static_folder=static_folder)
app.config.from_yaml(app.root_path)

tmpl_dir = os.path.join(root_path, 'templates')

my_loader = jinja2.ChoiceLoader([
    app.jinja_loader,
    jinja2.FileSystemLoader(tmpl_dir),
])
app.jinja_loader = my_loader

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/hello')
def hello():
    return render_template('hello.html')


if __name__ == '__main__':
    app.run(debug=True)
