import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from sense_hat import SenseHat
from time import time, sleep
import os
import sys
import random
from math import floor, ceil

# constants
COLOR_BLUE = (0, 0, 255)
COLOR_BLACK = (0, 0, 0)

# get random arcade matrix

# get API key from json
serviceAccountKey = "../keys/serviceAccountKey.json"
databaseURL = "https://character-generator-134dc.firebaseio.com"

try:
    # fetch the service account key JSON file contents
    firebase_cred = credentials.Certificate(serviceAccountKey)

    firebase_admin.initialize_app(firebase_cred, {
        "databaseURL": databaseURL
    })

    firebase_ref_pi_arcade_characters = db.reference("patterns")
except:
    print('Unable to initialize Firebase: {}'.format(sys.exc_info()[0]))
    sys.exit(1)


def get_random_arcade_matrix(pattern):
    matrix = []
    for r in range(0, 8):
        temp_str = ''
        for c in range(0, 4):
            temp_str = temp_str + str(round(random.random()))

        temp_str = temp_str + temp_str[::-1]
        pattern = pattern + temp_str

    for p in range(0, 64):
        bit = int(pattern[p])
        color = COLOR_BLUE if bit == 1 else COLOR_BLACK
        matrix.append(color)

    return(matrix)


def get_pattern_from_db():
    patterns = firebase_ref_pi_arcade_characters.get()
    i = 0
    pattern = []
    if patterns is not None:
        for key, val in patterns.items():
            pattern.append(val)

        while i < len(pattern):
            character = get_random_arcade_matrix(pattern[i])
            sense_hat.set_pixels(character)
            i += 1
            sleep(3)
            if i > len(pattern):
                i = 0
    else:
        sense_hat.show_message("There are no patterns saved yet")


try:
    # SenseHat
    sense_hat = SenseHat()
    sense_hat.set_imu_config(False, False, False)
except:
    print('Unable to initialize the Sense Hat library: {}'.format(
        sys.exc_info()[0]))
    sys.exit(1)


def main():
    while True:
        get_pattern_from_db()


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, SystemExit):
        print('Interrupt received! Stopping the application...')
    finally:
        print('Cleaning up the mess...')
        sense_hat.cle