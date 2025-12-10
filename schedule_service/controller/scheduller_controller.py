from flask import jsonify
from db import get_db_connection
from service.scheduler import jadwalkan_water_filling

def time_to_str(time_val):
    if isinstance(time_val, str):
        return time_val
    total_seconds = int(time_val.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

def get_schedule(user_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM working_slots WHERE user_id=%s", (user_id,))
            slots = cursor.fetchall()

            if not slots:
                return jsonify({
                    "status": "error",
                    "message": "No working slots found. Please add working slots first.",
                    "schedule": []
                }), 400

            working_days = {day: [] for day in ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']}

            for slot in slots:
                start_str = time_to_str(slot["start_time"])
                end_str = time_to_str(slot["end_time"])

                if slot["working_days"] == "All Day":
                    for day in working_days.keys():
                        working_days[day].append({
                            "start_time": start_str,
                            "end_time": end_str
                        })
                else:
                    working_days[slot["working_days"]].append({
                        "start_time": start_str,
                        "end_time": end_str
                    })

            cursor.execute("SELECT * FROM tasks WHERE user_id=%s", (user_id,))
            tasks = cursor.fetchall()

            if not tasks:
                return jsonify({
                    "status": "error",
                    "message": "No tasks found. Please create tasks first.",
                    "schedule": []
                }), 400

            raw_tasks = []
            for t in tasks:
                if t["deadline"] is None:
                    from datetime import datetime, timedelta
                    future_deadline = datetime.now() + timedelta(days=365)
                    deadline_str = future_deadline.strftime("%Y-%m-%d %H:%M:%S")
                else:
                    deadline_str = t["deadline"].strftime("%Y-%m-%d %H:%M:%S")
                
                raw_tasks.append({
                    "id": t["id"],
                    "desc": t["description"],
                    "duration": t["duration_estimation"],
                    "deadline": deadline_str,
                    "locked": bool(t["is_locked"]),
                    "priority": t["priority"]
                })

        payload = {
            "user_id": user_id,
            "working_days": working_days,
            "raw_tasks": raw_tasks
        }

        jadwal = jadwalkan_water_filling(payload)

        return jsonify({"status": "success", "schedule": jadwal})

    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": f"Error generating schedule: {error_msg}",
            "schedule": []
        }), 500
    finally:
        conn.close()
