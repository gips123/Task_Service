from flask import Flask
import threading
from messageBroker import start_consumer
from routes.scheduler_routes import schedule_bp

app = Flask(__name__)
app.register_blueprint(schedule_bp)

def start_rabbitmq_consumer():
    t = threading.Thread(target=start_consumer, daemon=True)
    t.start()

start_rabbitmq_consumer()

@app.route("/")
def home():
    return {"message": "Flask Scheduler Service Running"}

if __name__ == "__main__":
    port = 3001
    print(f"Schedule Service berjalan pada port {port}")
    print(f"URL: http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
