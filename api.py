from flask import Flask, request
from pymongo import MongoClient
from bson.json_util import dumps, object_hook
from flask_cors import CORS
import datetime
import requests
import json


app = Flask(__name__)
CORS(app)

client = MongoClient()
db = client['assets']

api_key = 'bntabkgzjfwtblbko25g34b8'

# def toJson(data):
#     return json.dumps(data, default=json_util.default)


@app.route('/generate')
def _generate():

    url = 'https://openapi.etsy.com/v2/guests/generator?api_key=%s' % api_key
    r = requests.get(url)
    guest_data = json.loads(r.text)['results'][0]  # guest_id, checkout_url

    return dumps(guest_data)


@app.route('/cart/<etsy_guest_id>', methods=['GET', 'POST'])
def _cart(etsy_guest_id):
    # doc = db.carts.find_one({'etsy_guest_id': etsy_guest_id})

    if request.method == "GET":
        if doc:
            return dumps(doc)
        else:
            return "Cart %s does not exist." % etsy_guest_id

    if request.method == "POST":       # if the Cart exists, empty it and...

        # if doc:
        #     cart_data = request.get_json()
        #
        #     if not cart_data:
        #         return "Bad Request. JSON not found in POST"
        #
        #     db.carts.update({'etsy_guest_id': etsy_guest_id},
        #                     {'$set':
        #                         {
        #                             'cart': cart_data,
        #                             'date': datetime.datetime.utcnow()
        #                         }
        #                     })
        # else:   # If this is a new Cart
        #     doc = {
        #         "etsy_guest_id": etsy_guest_id,
        #         "created": datetime.datetime.utcnow(),
        #         "date": datetime.datetime.utcnow(),
        #         "cart": {
        #             'quantity': 3,
        #             'total': '1.99',
        #             'listings': [
        #                 {'listing_id': '153546379',
        #                  'price': '3.00',
        #                  'quantity': 1,
        #                  'selected_variations': {},
        #                  },
        #                 {'listing_id': '270332398',
        #                  'price': '2.00',
        #                  'quantity': 2,
        #                  'selected_variations': {},
        #                  }]}

        # cart_data = request.get_json()
        # return dumps(cart_data)
        # doc = {
        #     "etsy_guest_id": etsy_guest_id,
        #     "created": datetime.datetime.utcnow(),
        #     "date": datetime.datetime.utcnow(),
        #     "cart": json.loads(cart_data, object_hook=object_hook)
        # }
        #
        # db.carts.insert_one(doc)

        cart_data = request.get_json()
        db.carts.insert_one(cart_data)

        return dumps(cart_data)
        # return "Posted Cart %s" % etsy_guest_id


@app.route('/carts')
def _carts():

    cursor = db.carts.find()
    docs = [doc for doc in cursor]

    return dumps(docs)


@app.route('/listing/<etsy_listing_id>', methods=['GET', 'POST'])
def _listing(etsy_listing_id):

    if request.method == 'GET':
        doc = db.listings.find({'etsy_listing_id': etsy_listing_id})

        return dumps(doc)

    if request.method == 'POST':
        listing_data = request.get_json()
        db.listings.insert_one(listing_data)

        return dumps(listing_data)

@app.route('/listings', methods=['GET'])
def _listings():

    cursor = db.listings.find()
    docs = [doc for doc in cursor]

    return dumps(docs)


@app.route('/checkout/<etsy_guest_id>', methods=['POST'])
def _checkout(etsy_guest_id):

    # Only add to Etsy GuestCart when we hit /checkout
    # If we add to EtsyCart on every ADD/EDIT, we need to dynamically edit EtsyCart

    doc = db.carts.find_one({'etsy_guest_id': etsy_guest_id})

    api_key = 'bntabkgzjfwtblbko25g34b8'
    url = 'https://openapi.etsy.com/v2/guests/%s/carts' % etsy_guest_id
    print doc
    listings = doc['cart']['listings']

    for listing in listings:
        payload = {
            'api_key': api_key,
            'guest_id': etsy_guest_id,
            'listing_id': listing['listing_id'],
            'quantity': listing['quantity'],  # optional
            'selected_variations': listing['selected_variations']  # optional
        }

        requests.post(url, params=payload)

    return "Finished"

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
    # app.run(host="0.0.0.0", debug=True)