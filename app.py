from flask import Flask, render_template, request, redirect, url_for
import binascii as ba
import os

from io import BytesIO
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
import util
import sqlite3
import requests

app = Flask(__name__)
app.config.update(
    TEMPLATES_AUTO_RELOAD=True,
    DEBUG=True,
    ENV='production'
)

azure_ml_service_uri = 'http://52.151.241.36:80/score'

###############################################
# Error Handling
################################################


@app.errorhandler(404)
def FUN_404(error):
    return render_template("error.html"), 404


@app.errorhandler(405)
def FUN_405(error):
    return render_template("error.html"), 405


@app.errorhandler(413)
def FUN_413(error):
    return render_template("error.html"), 413


@app.errorhandler(500)
def FUN_500(error):
    return render_template("error.html"), 500


@app.route('/results/<image_id>', methods=['GET'])
def results(image_id=None):
    # retrieve data from database
    # call out to model?
    data = {}
    if image_id:
        conn = sqlite3.connect('images.db')
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM Images WHERE image_id = '{}' LIMIT 1".format(str(image_id)))
        result = c.fetchone()

        if result:
            for key in result.keys():
                if isinstance(result[key], bytes):

                    data[key] = str(ba.b2a_base64(result[key], newline=False), 'utf-8')

                    # Prepare the digit for analysis
                    np_array = util.convert_to_28x28_image(result[key]).flatten()

                    # Call service in Azure to predict
                    headers = {'Content-Type': 'application/json'}
                    body = "{\"data\": [" + str(list(np_array)) + "]}"
                    resp = requests.post(azure_ml_service_uri,
                                         data=body,
                                         headers=headers)
                    if resp.status_code == 200:
                        data['result'] = resp.text

                else:
                    data[key] = result[key]
        else:
            return render_template('index.html')

    return render_template('index.html', data=data)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route("/about/")
def about():
    return render_template("about.html")


@app.route('/upload_image', methods=['POST', 'GET'])
def upload_image():
    if request.method == 'POST':
        canvas_data = request.form['canvas_data']
        image_url = request.form['image_url']
        image_id = request.form['image_id']
        os.makedirs('temp', exist_ok=True)

        # Store image as binary data
        binary_data = ba.a2b_base64(image_url.partition('base64,')[2])

        # image_id -> needs to be unique - got it
        # canvas_data -> so it can be redrawn - got it
        # image_blob -> saved as a blob - got it

        data = [image_id, binary_data, canvas_data, ]
        conn = sqlite3.connect('images.db')
        c = conn.cursor()
        c.execute(
            'CREATE TABLE IF NOT EXISTS Images(image_id string, image_blob blob, canvas_data text)')
        c.execute('INSERT INTO Images VALUES(?, ?, ?)', data)
        conn.commit()
        conn.close()
        return ''
    else:
        return redirect(url_for('index'))


@app.route('/canvas')
def canvas_page():
    return render_template('canvas.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
