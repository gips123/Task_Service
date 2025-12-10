const API_BASE_URL = 'http://localhost:8080/task-service/task';
let currentUserId = 1;
let allTasks = [];

document.addEventListener('DOMContentLoaded', () => {
    const userIdInput = document.getElementById('userIdInput');
    userIdInput.addEventListener('change', (e) => {
        currentUserId = parseInt(e.target.value) || 1;
        loadTasks();
    });
    
    loadTasks();
});

async function loadTasks() {
    const userId = document.getElementById('userIdInput').value || 1;
    currentUserId = parseInt(userId);
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/${currentUserId}`);
        if (!response.ok) throw new Error('Failed to load tasks');
        
        allTasks = await response.json();
        displayTasks(allTasks);
        updateStats(allTasks);
    } catch (error) {
        showToast('Error loading tasks', 'error');
        document.getElementById('tasksTableBody').innerHTML = 
            '<tr><td colspan="10" class="empty-state">Error loading tasks. Please try again.</td></tr>';
    }
}

function displayTasks(tasks) {
    const tbody = document.getElementById('tasksTableBody');
    
    if (tasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="empty-state">No tasks found. Create your first task!</td></tr>';
        return;
    }
    
    tbody.innerHTML = tasks.map(task => `
        <tr>
            <td>${task.id}</td>
            <td>${escapeHtml(task.description)}</td>
            <td><span class="badge badge-category">${task.category || 'N/A'}</span></td>
            <td><span class="badge badge-${task.priority?.toLowerCase() || 'medium'}">${task.priority || 'N/A'}</span></td>
            <td>${task.duration_estimation || 0} min</td>
            <td>${task.start_schedule ? formatDateTime(task.start_schedule) : '<span style="color: #999;">Not scheduled</span>'}</td>
            <td>${task.end_schedule ? formatDateTime(task.end_schedule) : '<span style="color: #999;">Not scheduled</span>'}</td>
            <td>${task.deadline ? formatDateTime(task.deadline) : 'No deadline'}</td>
            <td><span class="badge badge-${getStatusClass(task.status)}">${task.status || 'Pending'}</span></td>
            <td>
                <button onclick="editTask(${task.id})" class="btn btn-edit">Edit</button>
                <button onclick="deleteTask(${task.id})" class="btn btn-danger">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateStats(tasks) {
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('completedTasks').textContent = 
        tasks.filter(t => t.status === 'Completed').length;
    document.getElementById('inProgressTasks').textContent = 
        tasks.filter(t => t.status === 'In Progress').length;
    document.getElementById('pendingTasks').textContent = 
        tasks.filter(t => t.status === 'Pending' || !t.status).length;
}

function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Create New Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('status').value = 'Pending';
    document.getElementById('taskModal').classList.add('show');
}

async function editTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}`);
        if (!response.ok) throw new Error('Failed to load task');
        
        const task = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskId').value = task.id;
        document.getElementById('description').value = task.description;
        document.getElementById('priority').value = task.priority || 'Medium';
        document.getElementById('duration').value = task.duration_estimation || '';
        
        if (task.deadline) {
            const deadlineStr = task.deadline.replace(' ', 'T');
            const deadlineDate = new Date(deadlineStr);
            const localDateTime = new Date(deadlineDate.getTime() - deadlineDate.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            document.getElementById('deadline').value = localDateTime;
        } else {
            document.getElementById('deadline').value = '';
        }
        
        document.getElementById('isLocked').checked = Boolean(task.is_locked);
        document.getElementById('status').value = task.status || 'Pending';
        document.getElementById('taskModal').classList.add('show');
    } catch (error) {
        console.error('Error loading task:', error);
        showToast('Error loading task', 'error');
    }
}

async function saveTask(event) {
    event.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const description = document.getElementById('description').value;
    const priority = document.getElementById('priority').value;
    const duration = parseInt(document.getElementById('duration').value);
    const deadline = document.getElementById('deadline').value;
    const status = document.getElementById('status').value;
    const isLocked = document.getElementById('isLocked').checked;
    
    let formattedDeadline = null;
    if (deadline) {
        const deadlineDate = new Date(deadline);
        const year = deadlineDate.getFullYear();
        const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
        const day = String(deadlineDate.getDate()).padStart(2, '0');
        const hours = String(deadlineDate.getHours()).padStart(2, '0');
        const minutes = String(deadlineDate.getMinutes()).padStart(2, '0');
        formattedDeadline = `${year}-${month}-${day} ${hours}:${minutes}:00`;
    }
    
    const taskData = {
        user_id: currentUserId,
        description,
        priority: priority,
        duration,
        deadline: formattedDeadline,
        status: status,
        is_locked: isLocked
    };
    
    try {
        let response;
        if (taskId) {
            response = await fetch(`${API_BASE_URL}/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
        } else {
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save task');
        }
        
        const result = await response.json();
        showToast(result.message || 'Task saved successfully!', 'success');
        closeModal();
        loadTasks();
    } catch (error) {
        showToast(error.message || 'Error saving task', 'error');
    }
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) throw new Error('Failed to update task status');
        
        const result = await response.json();
        showToast(`Task status updated to ${newStatus}`, 'success');
        loadTasks();
    } catch (error) {
        showToast('Error updating task status', 'error');
        loadTasks();
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete task');
        
        const result = await response.json();
        showToast(result.message || 'Task deleted successfully!', 'success');
        loadTasks();
    } catch (error) {
        showToast('Error deleting task', 'error');
    }
}

function closeModal() {
    document.getElementById('taskModal').classList.remove('show');
}

window.onclick = function(event) {
    const modals = ['taskModal', 'workingSlotsModal', 'createWorkingSlotModal', 'blacklistModal', 'scheduleModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            if (modalId === 'taskModal') closeModal();
            if (modalId === 'workingSlotsModal') closeWorkingSlotsModal();
            if (modalId === 'createWorkingSlotModal') closeCreateWorkingSlotModal();
            if (modalId === 'blacklistModal') closeBlacklistModal();
            if (modalId === 'scheduleModal') closeScheduleModal();
        }
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusClass(status) {
    if (!status) return 'pending';
    const statusLower = status.toLowerCase().replace(' ', '');
    return statusLower === 'inprogress' ? 'progress' : statusLower;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function openWorkingSlotsModal() {
    document.getElementById('workingSlotsModal').classList.add('show');
    await loadWorkingSlots();
}

function closeWorkingSlotsModal() {
    document.getElementById('workingSlotsModal').classList.remove('show');
}

async function loadWorkingSlots() {
    try {
        const response = await fetch(`http://localhost:8080/task-service/working-slots/${currentUserId}`);
        if (!response.ok) throw new Error('Failed to load working slots');
        
        const slots = await response.json();
        const listDiv = document.getElementById('workingSlotsList');
        
        if (slots.length === 0) {
            listDiv.innerHTML = '<p class="empty-state">No working slots. Add one to start scheduling tasks.</p>';
            return;
        }
        
        listDiv.innerHTML = slots.map(slot => `
            <div class="working-slot-item">
                <div>
                    <strong>${slot.start_time} - ${slot.end_time}</strong>
                    <span class="badge badge-category">${slot.working_days}</span>
                </div>
                <button onclick="deleteWorkingSlot(${slot.id})" class="btn btn-danger" style="padding: 6px 12px; font-size: 0.9em;">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading working slots:', error);
        showToast('Error loading working slots', 'error');
    }
}

function openCreateWorkingSlotModal() {
    document.getElementById('createWorkingSlotModal').classList.add('show');
}

function closeCreateWorkingSlotModal() {
    document.getElementById('createWorkingSlotModal').classList.remove('show');
    document.getElementById('workingSlotForm').reset();
}

async function saveWorkingSlot(event) {
    event.preventDefault();
    
    const slotData = {
        user_id: currentUserId,
        start_time: document.getElementById('startTime').value + ':00',
        end_time: document.getElementById('endTime').value + ':00',
        working_days: document.getElementById('workingDays').value
    };
    
    try {
        const response = await fetch('http://localhost:8080/task-service/working-slots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slotData)
        });
        
        if (!response.ok) throw new Error('Failed to save working slot');
        
        showToast('Working slot added successfully!', 'success');
        closeCreateWorkingSlotModal();
        loadWorkingSlots();
    } catch (error) {
        showToast('Error saving working slot', 'error');
    }
}

async function deleteWorkingSlot(slotId) {
    if (!confirm('Are you sure you want to delete this working slot?')) return;
    
    try {
        const response = await fetch(`http://localhost:8080/task-service/working-slots/${slotId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete working slot');
        
        showToast('Working slot deleted successfully!', 'success');
        loadWorkingSlots();
    } catch (error) {
        showToast('Error deleting working slot', 'error');
    }
}

async function openBlacklistModal() {
    document.getElementById('blacklistModal').classList.add('show');
    await loadBlacklist();
}

function closeBlacklistModal() {
    document.getElementById('blacklistModal').classList.remove('show');
}

async function loadBlacklist() {
    try {
        const response = await fetch(`http://localhost:8080/task-service/blacklist/${currentUserId}`);
        if (!response.ok) throw new Error('Failed to load blacklist');
        
        const blacklist = await response.json();
        const listDiv = document.getElementById('blacklistList');
        
        if (blacklist.length === 0) {
            listDiv.innerHTML = '<p class="empty-state">No apps in blacklist. Add apps that distract you.</p>';
            return;
        }
        
        listDiv.innerHTML = blacklist.map(item => `
            <div class="blacklist-item">
                <span><strong>${item.app_name}</strong></span>
                <button onclick="deleteBlacklist(${item.id})" class="btn btn-danger" style="padding: 6px 12px; font-size: 0.9em;">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading blacklist:', error);
        showToast('Error loading blacklist', 'error');
    }
}

async function addToBlacklist(event) {
    event.preventDefault();
    
    const appName = document.getElementById('appName').value;
    
    const blacklistData = {
        user_id: currentUserId,
        app_name: appName
    };
    
    try {
        const response = await fetch('http://localhost:8080/task-service/blacklist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blacklistData)
        });
        
        if (!response.ok) throw new Error('Failed to add to blacklist');
        
        showToast('App added to blacklist!', 'success');
        document.getElementById('addBlacklistForm').reset();
        loadBlacklist();
    } catch (error) {
        showToast('Error adding to blacklist', 'error');
    }
}

async function deleteBlacklist(blacklistId) {
    if (!confirm('Are you sure you want to remove this app from blacklist?')) return;
    
    try {
        const response = await fetch(`http://localhost:8080/task-service/blacklist/${blacklistId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete from blacklist');
        
        showToast('App removed from blacklist!', 'success');
        loadBlacklist();
    } catch (error) {
        showToast('Error deleting from blacklist', 'error');
    }
}

async function loadSchedule() {
    document.getElementById('scheduleModal').classList.add('show');
    
    try {
        const response = await fetch(`http://localhost:8080/schedule-service/schedule/${currentUserId}`);
        if (!response.ok) throw new Error('Failed to load schedule');
        
        const data = await response.json();
        const scheduleContent = document.getElementById('scheduleContent');
        
        if (!data.schedule || data.schedule.length === 0) {
            scheduleContent.innerHTML = '<p class="empty-state">No schedule available. Create tasks and working slots first.</p>';
            return;
        }
        
        const grouped = {};
        data.schedule.forEach(item => {
            const date = item.start_time.split(' ')[0];
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(item);
        });
        
        let html = '<div class="schedule-list">';
        Object.keys(grouped).sort().forEach(date => {
            const dateObj = new Date(date);
            html += `<div class="schedule-day">
                <h3>${dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>`;
            
            grouped[date].forEach(item => {
                const startTime = item.start_time.split(' ')[1] || item.start_time;
                const endTime = item.end_time.split(' ')[1] || item.end_time;
                html += `<div class="schedule-item">
                    <div class="schedule-time">${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}</div>
                    <div class="schedule-task">
                        <strong>${escapeHtml(item.desc)}</strong>
                        <div class="schedule-meta">
                            <span class="badge badge-${item.is_locked ? 'high' : 'medium'}">${item.is_locked ? 'Locked' : 'Flexible'}</span>
                            <span class="badge badge-${item.status_deadline === 'Tepat Waktu' ? 'productive' : 'distracted'}">${item.status_deadline || 'N/A'}</span>
                            <span class="badge badge-category">${item.alokasi_menit} min</span>
                        </div>
                    </div>
                </div>`;
            });
            
            html += '</div>';
        });
        html += '</div>';
        
        scheduleContent.innerHTML = html;
    } catch (error) {
        document.getElementById('scheduleContent').innerHTML = '<p class="empty-state">Error loading schedule. Please try again.</p>';
    }
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('show');
}

async function openActivityTracker() {
    try {
        const userId = currentUserId;
        
        const response = await fetch(`http://localhost:8080/sensor-service/start/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Sensor service started. Opening Activity Tracker...', 'success');
            setTimeout(() => {
                window.open(`http://localhost:3002?user_id=${userId}`, '_blank');
            }, 500);
        } else {
            if (result.message && result.message.includes('sudah berjalan')) {
                showToast('Sensor service already running. Opening Activity Tracker...', 'success');
                setTimeout(() => {
                    window.open(`http://localhost:3002?user_id=${userId}`, '_blank');
                }, 500);
            } else {
                showToast('Failed to start sensor service', 'error');
            }
        }
    } catch (error) {
        showToast('Error starting sensor service', 'error');
    }
}

