import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SENSOR_SCRIPT = path.join(__dirname, "../service/sensor.js");

const pidPath = path.join(__dirname, 'sensor.pid');

function isSensorRunning() {
  if (!fs.existsSync(pidPath)) return false;
  
  const pid = parseInt(fs.readFileSync(pidPath, 'utf-8'));
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
export const startSensorService = (req, res) => {
    const userId = req.params.user_id;
    if (isSensorRunning()) {
        return res.json({ success: false, message: 'Sensor service sudah berjalan' });
    }

    try {
    const child = spawn("node", [SENSOR_SCRIPT, userId], {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"]
    });
    
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    child.on('error', (err) => {
      console.error('Sensor service error:', err);
    });
    
    child.unref();
    fs.writeFileSync(pidPath, child.pid.toString());
    
    return res.json({ success: true, message: "Sensor service berhasil dijalankan" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal menjalankan sensor service",
      error: err.message
    });
  }
};


export const stopSensorService = (req, res) => {
  if (!fs.existsSync(pidPath)) {
    return res.json({ success: false, message: 'Sensor service tidak berjalan' });
  }

  const pid = parseInt(fs.readFileSync(pidPath, 'utf-8'));

  try {
    process.kill(pid);
    fs.unlinkSync(pidPath);

    return res.json({ success: true, message: 'Sensor service berhasil dihentikan' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal menghentikan sensor service', error: err.message });
  }
};

