import json
import os
import pika
from db import get_db_connection
from service.scheduler import jadwalkan_water_filling

RABBIT_URL = os.environ.get("RABBIT_URL", "amqp://localhost")
EXCHANGE = "task_events"

def update_task_schedule_to_db(task_id, start, end, sequence_order):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE tasks
                SET start_schedule=%s, end_schedule=%s, sequence_order=%s
                WHERE id=%s
            """
            cursor.execute(sql, (start, end, sequence_order, task_id))
            conn.commit()
    except Exception as e:
        conn.rollback()
    finally:
        conn.close()


def process_task_created(task_data):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM working_slots WHERE user_id=%s", (task_data["user_id"],))
            slots = cursor.fetchall()
            
            working_days = {day: [] for day in ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']}
            
            for slot in slots:
                start_time = slot["start_time"]
                end_time = slot["end_time"]
                
                if hasattr(start_time, 'total_seconds'):
                    total_seconds = int(start_time.total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    seconds = total_seconds % 60
                    start_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
                else:
                    start_str = str(start_time) if isinstance(start_time, str) else start_time.strftime("%H:%M:%S")
                
                if hasattr(end_time, 'total_seconds'):
                    total_seconds = int(end_time.total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    seconds = total_seconds % 60
                    end_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
                else:
                    end_str = str(end_time) if isinstance(end_time, str) else end_time.strftime("%H:%M:%S")
                
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
            
            cursor.execute("""
                SELECT * FROM tasks 
                WHERE user_id=%s AND (start_schedule IS NULL OR status='Pending')
                ORDER BY deadline ASC
            """, (task_data["user_id"],))
            tasks = cursor.fetchall()
            
            raw_tasks = []
            for t in tasks:
                deadline_str = t["deadline"].strftime("%Y-%m-%d %H:%M:%S") if t["deadline"] else None
                raw_tasks.append({
                    "id": t["id"],
                    "desc": t["description"],
                    "duration": t["duration_estimation"],
                    "deadline": deadline_str or "2099-12-31 23:59:59",
                    "locked": bool(t["is_locked"]),
                    "priority": t["priority"]
                })
        
        conn.close()
        
        payload = {
            "user_id": task_data["user_id"],
            "working_days": working_days,
            "raw_tasks": raw_tasks
        }
        
        hasil = jadwalkan_water_filling(payload)
        
        if not hasil:
            return
        
        sequence = 0
        for slot in hasil:
            sequence += 1
            update_task_schedule_to_db(
                slot["id"],
                slot["start_time"],
                slot["end_time"],
                sequence
            )
        
    except Exception as e:
        import traceback
        traceback.print_exc()


def start_consumer():
    try:
        params = pika.URLParameters(RABBIT_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.exchange_declare(
            exchange=EXCHANGE,
            exchange_type="topic",
            durable=True
        )

        queue_name = "schedule_service_queue"
        channel.queue_declare(queue=queue_name, durable=True)
        channel.queue_bind(
            exchange=EXCHANGE,
            queue=queue_name,
            routing_key="task.created"
        )

        def callback(ch, method, properties, body):
            try:
                task_data = json.loads(body.decode())
                process_task_created(task_data)
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

        channel.basic_consume(
            queue=queue_name,
            on_message_callback=callback
        )

        channel.start_consuming()
        
    except KeyboardInterrupt:
        if 'connection' in locals():
            connection.close()
    except Exception as e:
        import traceback
        traceback.print_exc()
