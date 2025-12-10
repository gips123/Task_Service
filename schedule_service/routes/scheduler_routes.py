from flask import Blueprint
from controller.scheduller_controller import get_schedule

schedule_bp = Blueprint("schedule", __name__, url_prefix="/schedule")

@schedule_bp.route("/<int:user_id>", methods=["GET"])
def schedule(user_id):
    return get_schedule(user_id)
