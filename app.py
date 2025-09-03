from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app)

DJ_COLORS = [
    '#FF0000',  # Red
    '#FF7F00',  # Orange
    '#FFFF00',  # Yellow
    '#00FF00',  # Green
    '#0000FF',  # Blue
    '#4B0082',  # Indigo
    '#9400D3'   # Violet
]

# This global variable will remember which color was shown last
current_color_index = -1

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected!')

@socketio.on('audio_data')
def handle_audio_data(data):
    global current_color_index  # Tell the function to use the global variable
    volume = data.get('volume', 0)

    # Only change the color if the sound is loud enough
    if volume > 20:  # You can adjust this volume threshold
        # Move to the next color in the list, wrapping around to the start
        current_color_index = (current_color_index + 1) % len(DJ_COLORS)
        color = DJ_COLORS[current_color_index]
        
        # Send the new color to the browser
        emit('color_change', {'color': color})
    # If the sound is quiet, we don't send anything, so the color stays the same
    # You could add an 'else' block here to make it go black when quiet

if __name__ == '__main__':
    socketio.run(app, debug=True)