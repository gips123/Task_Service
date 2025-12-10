from datetime import datetime as date, timedelta

def hitung_kapasitas_harian_menit(slots):
    total_menit = 0
    for slot in slots:
        start = date.strptime(slot["start_time"], "%H:%M:%S")
        end = date.strptime(slot["end_time"], "%H:%M:%S")
        total_menit += (end - start).total_seconds() / 60
    return int(total_menit)

def hitung_skor_prioritas(tugas):
    priority_map = {"High":3, "Medium":2, "Low":1}
    return priority_map.get(tugas["priority"],1)

def jadwalkan_water_filling(payload, tanggal_mulai_str=None):
    TANGGAL_MULAI = date.strptime(tanggal_mulai_str or date.now().strftime("%Y-%m-%d"), "%Y-%m-%d")
    kapasitas_terpakai = {}
    kapasitas_max = {}

    def get_day_capacity(date_obj):
        day_name = date_obj.strftime("%A")
        slots = payload["working_days"].get(day_name, [])
        max_cap = hitung_kapasitas_harian_menit(slots)
        kapasitas_max[date_obj.strftime("%Y-%m-%d")] = max_cap
        return max_cap

    tugas_terkunci = []
    tugas_fleksibel = []

    for t in payload["raw_tasks"]:
        t["deadline_dt"] = date.strptime(t["deadline"], "%Y-%m-%d %H:%M:%S")
        t["priority_score"] = hitung_skor_prioritas(t)
        waktu_ke_deadline = (t["deadline_dt"] - TANGGAL_MULAI).total_seconds() / 3600
        t["heuristic_score"] = waktu_ke_deadline / t["priority_score"]
        if t["locked"]:
            tugas_terkunci.append(t)
        else:
            tugas_fleksibel.append(t)

    semua_tugas = sorted(tugas_terkunci, key=lambda x: x["deadline_dt"]) + \
                  sorted(tugas_fleksibel, key=lambda x: x["heuristic_score"])

    jadwal_final = []
    max_deadline = max([t["deadline_dt"] for t in semua_tugas]).date() if semua_tugas else TANGGAL_MULAI.date()

    for t in semua_tugas:
        durasi_sisa = t["duration"]
        while durasi_sisa > 0:
            tanggal_mulai_cari = TANGGAL_MULAI
            hari_optimal = None
            min_load = float('inf')
            current_date = tanggal_mulai_cari
            while current_date.date() <= max_deadline:
                day_str = current_date.strftime("%Y-%m-%d")
                max_cap = get_day_capacity(current_date)
                if max_cap > 0:
                    current_load = kapasitas_terpakai.get(day_str,0)
                    available_cap = max_cap - current_load
                    if available_cap>0 and current_load<min_load:
                        if current_date.date()<=t["deadline_dt"].date():
                            min_load = current_load
                            hari_optimal = current_date
                current_date += timedelta(days=1)

            if hari_optimal:
                day_str = hari_optimal.strftime("%Y-%m-%d")
                max_cap = kapasitas_max[day_str]
                current_load = kapasitas_terpakai.get(day_str,0)
                available_cap = max_cap - current_load
                alokasi = min(durasi_sisa, available_cap)
                waktu_mulai = hari_optimal.replace(hour=8, minute=0, second=0) + timedelta(minutes=current_load)
                waktu_selesai = waktu_mulai + timedelta(minutes=alokasi)
                jadwal_final.append({
                    "id": t["id"],
                    "desc": t["desc"],
                    "alokasi_menit": alokasi,
                    "start_time": waktu_mulai.strftime("%Y-%m-%d %H:%M:%S"),
                    "end_time": waktu_selesai.strftime("%Y-%m-%d %H:%M:%S"),
                    "is_locked": t["locked"],
                    "deadline": t["deadline"],
                    "status_deadline": "TERLAMBAT" if waktu_selesai > t["deadline_dt"] else "Tepat Waktu"
                })
                durasi_sisa -= alokasi
                kapasitas_terpakai[day_str] = current_load + alokasi
            else:
                break
    return jadwal_final
