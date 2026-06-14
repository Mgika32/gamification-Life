// ===================================================
// ============== DONNÉES & STOCKAGE =================
// ===================================================

const STORAGE_KEYS = {
    tasks: 'tasks',
    points: 'totalPoints',
    badges: 'badges',
    streak: 'streak',
    lastTaskDate: 'lastTaskDate'
};

const ALL_BADGES = [
    {
        id: "first-step",
        name: "Premier Pas",
        description: "Avoir 10 points d'expérience",
        icon: "fa-star",
        color: "#f59e0b",
        points: 10,
        condition: (xp) => xp >= 10
    },
    {
        id: "adventurer",
        name: "Aventurier",
        description: "Avoir 50 points d'expérience",
        icon: "fa-hiking",
        color: "#10b981",
        points: 50,
        condition: (xp) => xp >= 50
    },
    {
        id: "quest-master",
        name: "Maître des Quêtes",
        description: "Avoir 100 points d'expérience",
        icon: "fa-crown",
        color: "#8b5cf6",
        points: 100,
        condition: (xp) => xp >= 100
    },
    {
        id: "dragon-slayer",
        name: "Tueur de Dragon",
        description: "Terminer une quête quotidienne",
        icon: "fa-dragon",
        color: "#ef4444",
        points: 25,
        condition: (xp, completedTasks) => completedTasks.some(t => t.category === 'daily')
    },
    {
        id: "legendary",
        name: "Légendaire",
        description: "Terminer 5 quêtes",
        icon: "fa-fire",
        color: "#f97316",
        points: 50,
        condition: (xp, completedTasks) => completedTasks.length >= 5
    },
    {
        id: "streak-master",
        name: "Maître de la Streak",
        description: "Terminer 7 quêtes quotidiennes d'affilée",
        icon: "fa-infinity",
        color: "#06b6d4",
        points: 100,
        condition: (xp, completedTasks, currentStreak) => currentStreak >= 7
    },
    {
        id: "mercenary",
        name: "Mercenaire",
        description: "Terminer 10 quêtes ponctuelles",
        icon: "fa-coins",
        color: "#84cc16",
        points: 75,
        condition: (xp, completedTasks) => completedTasks.filter(t => t.category === 'once').length >= 10
    },
    {
        id: "collector",
        name: "Collectionneur",
        description: "Avoir 5 succès différents",
        icon: "fa-layer-group",
        color: "#ec4899",
        points: 50,
        condition: (xp, completedTasks, currentStreak, currentBadges) => currentBadges.length >= 5
    },
    {
        id: "speedrunner",
        name: "Speedrunner",
        description: "Terminer 3 quêtes en 1 jour",
        icon: "fa-bolt",
        color: "#f59e0b",
        points: 40,
        condition: (xp, completedTasks) => {
            const today = new Date().toDateString();
            return completedTasks.filter(t => {
                return t.completedDate && new Date(t.completedDate).toDateString() === today;
            }).length >= 3;
        }
    },
    {
        id: "perfectionist",
        name: "Perfectionniste",
        description: "Avoir un taux de réussite de 100%",
        icon: "fa-check-double",
        color: "#10b981",
        points: 60,
        condition: (xp, completedTasks, currentStreak, currentBadges, allTasks) => {
            return allTasks.length > 0 && completedTasks.length === allTasks.length;
        }
    }
];

// ===================================================
// =============== FONCTIONS UTILITAIRES =============
// ===================================================

function loadData() {
    return {
        tasks:        JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks))    || [],
        totalPoints:  parseInt(localStorage.getItem(STORAGE_KEYS.points))     || 0,
        badges:       JSON.parse(localStorage.getItem(STORAGE_KEYS.badges))   || [],
        streak:       parseInt(localStorage.getItem(STORAGE_KEYS.streak))     || 0,
        lastTaskDate: localStorage.getItem(STORAGE_KEYS.lastTaskDate)         || null
    };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEYS.tasks,        JSON.stringify(data.tasks));
    localStorage.setItem(STORAGE_KEYS.points,       data.totalPoints);
    localStorage.setItem(STORAGE_KEYS.badges,       JSON.stringify(data.badges));
    localStorage.setItem(STORAGE_KEYS.streak,       data.streak);
    localStorage.setItem(STORAGE_KEYS.lastTaskDate, data.lastTaskDate);
}

function calculateLevel(xp) {
    let level = 1;
    let xpForLevel = 100;
    while (xp >= xpForLevel) {
        level++;
        xpForLevel += 50 * level;
    }
    return level;
}

function getXpForLevel(level) {
    let xp = 0;
    for (let i = 2; i <= level; i++) xp += 50 * i;
    return xp;
}

function checkStreak(data) {
    const today = new Date().toDateString();

    // Déjà compté aujourd'hui
    if (data.lastTaskDate === today) return data;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = data.lastTaskDate === yesterday.toDateString();

    data.streak      = wasYesterday ? data.streak + 1 : 1;
    data.lastTaskDate = today;

    return data;
}

function checkBadges(data) {
    const completedTasks = data.tasks.filter(t => t.completed);
    const newBadges      = [];

    ALL_BADGES.forEach(badge => {
        // Déjà obtenu ?
        if (data.badges.some(b => b.id === badge.id)) return;

        const earned = badge.condition(
            data.totalPoints,
            completedTasks,
            data.streak,
            data.badges,
            data.tasks
        );

        if (earned) {
            const newBadge = {
                id:          badge.id,
                name:        badge.name,
                description: badge.description,
                icon:        badge.icon,
                color:       badge.color,
                points:      badge.points
            };
            data.badges.push(newBadge);
            newBadges.push(newBadge);
        }
    });

    return { data, newBadges };
}

function showBadgeNotification(badge) {
    // Créer la notification
    const notif = document.createElement('div');
    notif.className = 'badge-notification';
    notif.innerHTML = `
        <div class="badge-notif-icon" style="background-color: ${badge.color}">
            <i class="fas ${badge.icon}"></i>
        </div>
        <div class="badge-notif-text">
            <strong>Succès débloqué !</strong>
            <p>${badge.name}</p>
        </div>
    `;

    document.body.appendChild(notif);

    // Retirer après 3 secondes
    setTimeout(() => {
        notif.classList.add('badge-notif-hide');
        setTimeout(() => notif.remove(), 500);
    }, 3000);
}

// ===================================================
// ================== PAGE : INDEX ===================
// ===================================================

function initIndexPage() {
    let data = loadData();
    renderIndexTasks(data);
    renderIndexBadges(data);
    updateIndexPoints(data);
}

function updateIndexPoints(data) {
    const xpEl    = document.getElementById('xp-points');
    const levelEl = document.getElementById('player-level');
    if (xpEl)    xpEl.textContent    = data.totalPoints;
    if (levelEl) levelEl.textContent = calculateLevel(data.totalPoints);
}

function renderIndexTasks(data) {
    const grid = document.getElementById('tasks-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (data.tasks.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-compass"></i></div>
                <h3>Pas de quêtes actives</h3>
                <p>Vous n'avez aucune quête en cours. Lancez-en une pour commencer votre aventure !</p>
                <a href="tasks.html" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Ajouter une quête
                </a>
            </div>
        `;
        return;
    }

    // 3 dernières tâches, index correct dans le tableau original
    const lastThreeIndexes = data.tasks
        .map((task, index) => ({ task, index }))
        .slice(-3)
        .reverse();

    lastThreeIndexes.forEach(({ task, index }) => {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.completed ? 'task-completed' : ''}`;
        taskCard.innerHTML = `
            <div class="task-header">
                <div class="task-icon">
                    ${task.completed
                        ? '<i class="fas fa-check-circle"></i>'
                        : '<i class="fas fa-circle"></i>'}
                </div>
                <h3 class="task-title">${task.title}</h3>
                <span class="task-category ${task.category}">
                    ${task.category === 'daily' ? 'Quête Quotidienne' : 'Quête Ponctuelle'}
                </span>
            </div>
            <p class="task-description">${task.description || 'Aucune description'}</p>
            <div class="task-footer">
                <div class="task-meta">
                    <span class="task-points">+${task.points} XP</span>
                    <span class="task-difficulty">
                        ${task.category === 'daily' ? '⚔️⚔️⚔️' : '⚔️⚔️'}
                    </span>
                </div>
                <button class="btn ${task.completed ? 'btn-success' : 'btn-primary'}"
                        onclick="indexToggleTask(${index})">
                    ${task.completed
                        ? '<i class="fas fa-check"></i> Accomplie'
                        : '<i class="fas fa-flag"></i> Terminer'}
                </button>
            </div>
        `;
        grid.appendChild(taskCard);
    });
}

function renderIndexBadges(data) {
    const grid = document.getElementById('recent-badges');
    if (!grid) return;

    grid.innerHTML = '';

    if (data.badges.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-medal"></i></div>
                <h3>Aucune récompense</h3>
                <p>Terminez des quêtes pour débloquer des badges légendaires !</p>
                <a href="tasks.html" class="btn btn-warning">
                    <i class="fas fa-sword"></i> Voir les quêtes
                </a>
            </div>
        `;
        return;
    }

    [...data.badges].reverse().slice(0, 3).forEach(badge => {
        const card = document.createElement('div');
        card.className = 'badge-card';
        card.innerHTML = `
            <div class="badge-icon" style="background-color: ${badge.color}">
                <i class="fas ${badge.icon}"></i>
            </div>
            <h3 class="badge-name">${badge.name}</h3>
            <p class="badge-description">${badge.description}</p>
            <span class="badge-points">+${badge.points} XP</span>
        `;
        grid.appendChild(card);
    });
}

function indexToggleTask(index) {
    let data = loadData();
    const task = data.tasks[index];
    if (!task) return;

    task.completed = !task.completed;

    if (task.completed) {
        task.completedDate  = new Date().toISOString();
        data.totalPoints   += task.points;
        data                = checkStreak(data);
    } else {
        data.totalPoints   -= task.points;
        task.completedDate  = null;

        // Annuler la streak seulement si c'était aujourd'hui
        const today = new Date().toDateString();
        const wasToday = task.completedDate &&
            new Date(task.completedDate).toDateString() === today;
        if (wasToday) {
            data.streak       = 0;
            data.lastTaskDate = null;
        }
    }

    const { data: updatedData, newBadges } = checkBadges(data);
    saveData(updatedData);

    newBadges.forEach(showBadgeNotification);

    renderIndexTasks(updatedData);
    renderIndexBadges(updatedData);
    updateIndexPoints(updatedData);
}

// ===================================================
// ================== PAGE : TASKS ===================
// ===================================================

function initTasksPage() {
    const form = document.getElementById('new-task-form');
    if (form) form.addEventListener('submit', addTask);

    let data = loadData();
    renderTasks(data);
    updateTasksPoints(data);
    renderTasksBadges(data);
}

function updateTasksPoints(data) {
    const xpEl    = document.getElementById('xp-points');
    const levelEl = document.getElementById('player-level');
    if (xpEl)    xpEl.textContent    = data.totalPoints;
    if (levelEl) levelEl.textContent = calculateLevel(data.totalPoints);
}

function renderTasks(data) {
    const grid = document.getElementById('tasks-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const completedCount = data.tasks.filter(t => t.completed).length;
    const header = document.querySelector('.tasks-list h3');
    if (header) {
        header.textContent = `Quêtes en Cours (${completedCount}/${data.tasks.length})`;
    }

    if (data.tasks.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-compass"></i></div>
                <h3>Pas de quêtes actives</h3>
                <p>Vous n'avez aucune quête en cours. Ajoutez-en une pour commencer votre aventure !</p>
                <button class="btn btn-primary" onclick="document.getElementById('task-title').focus()">
                    <i class="fas fa-plus"></i> Ajouter une quête
                </button>
            </div>
        `;
        return;
    }

    data.tasks.forEach((task, index) => {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.completed ? 'task-completed' : ''}`;
        taskCard.innerHTML = `
            <div class="task-header">
                <div class="task-icon">
                    ${task.completed
                        ? '<i class="fas fa-check-circle"></i>'
                        : '<i class="fas fa-circle"></i>'}
                </div>
                <h3 class="task-title">${task.title}</h3>
                <span class="task-category ${task.category}">
                    ${task.category === 'daily' ? 'Quête Quotidienne' : 'Quête Ponctuelle'}
                </span>
            </div>
            <p class="task-description">${task.description || 'Aucune description'}</p>
            <div class="task-footer">
                <div class="task-meta">
                    <span class="task-points">+${task.points} XP</span>
                    <span class="task-difficulty">
                        ${task.category === 'daily' ? '⚔️⚔️⚔️' : '⚔️⚔️'}
                    </span>
                </div>
                <div class="task-actions">
                    <button class="btn ${task.completed ? 'btn-success' : 'btn-primary'}"
                            onclick="toggleTask(${index})">
                        ${task.completed
                            ? '<i class="fas fa-check"></i> Accomplie'
                            : '<i class="fas fa-flag"></i> Terminer'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteTask(${index})">
                        <i class="fas fa-trash"></i> Abandonner
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(taskCard);
    });
}

function renderTasksBadges(data) {
    const grid = document.getElementById('success-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (data.badges.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-medal"></i></div>
                <h3>Aucun succès débloqué</h3>
                <p>Terminez des quêtes pour débloquer des récompenses!</p>
                <button class="btn btn-primary" onclick="document.getElementById('task-title').focus()">
                    <i class="fas fa-plus"></i> Ajouter une quête
                </button>
            </div>
        `;
        return;
    }

    data.badges.forEach(badge => {
        const card = document.createElement('div');
        card.className = 'badge-card';
        card.innerHTML = `
            <div class="badge-icon" style="background-color: ${badge.color}">
                <i class="fas ${badge.icon}"></i>
            </div>
            <h3 class="badge-name">${badge.name}</h3>
            <p class="badge-description">${badge.description}</p>
            <span class="badge-points">+${badge.points} XP</span>
        `;
        grid.appendChild(card);
    });
}

function addTask(e) {
    e.preventDefault();
    const title       = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const category    = document.getElementById('task-category').value;

    if (!title) return;

    let data = loadData();

    data.tasks.push({
        title,
        description,
        category,
        completed:     false,
        points:        category === 'daily' ? 10 : 20,
        completedDate: null
    });

    saveData(data);
    renderTasks(data);
    e.target.reset();
}

function toggleTask(index) {
    let data = loadData();
    const task = data.tasks[index];
    if (!task) return;

    task.completed = !task.completed;

    if (task.completed) {
        task.completedDate  = new Date().toISOString();
        data.totalPoints   += task.points;
        data                = checkStreak(data);
    } else {
        // Soustraire les points seulement si la tâche avait des points
        data.totalPoints  -= task.points;
        task.completedDate = null;

        // Annuler la streak si c'était la seule tâche du jour
        const today        = new Date().toDateString();
        const todayTasks   = data.tasks.filter(t =>
            t.completed && t.completedDate &&
            new Date(t.completedDate).toDateString() === today
        );
        if (todayTasks.length === 0) {
            data.streak       = 0;
            data.lastTaskDate = null;
        }
    }

    const { data: updatedData, newBadges } = checkBadges(data);
    saveData(updatedData);

    newBadges.forEach(showBadgeNotification);

    renderTasks(updatedData);
    updateTasksPoints(updatedData);
    renderTasksBadges(updatedData);
}

function deleteTask(index) {
    let data = loadData();
    const task = data.tasks[index];
    if (!task) return;

    if (task.completed) {
        data.totalPoints -= task.points;
    }

    data.tasks.splice(index, 1);
    saveData(data);
    renderTasks(data);
    updateTasksPoints(data);
    renderTasksBadges(data);
}

// ===================================================
// ================= PAGE : BADGES ===================
// ===================================================

function initBadgesPage() {
    const data = loadData();
    renderAllBadges(data);
}

function renderAllBadges(data) {
    const grid = document.getElementById('badges-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const unlockedIds = data.badges.map(b => b.id);

    if (data.badges.length === 0 && ALL_BADGES.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-medal"></i></div>
                <h3>Aucun succès débloqué</h3>
                <p>Terminez des quêtes pour débloquer des récompenses légendaires !</p>
                <a href="tasks.html" class="btn btn-primary">
                    <i class="fas fa-sword"></i> Voir les quêtes
                </a>
            </div>
        `;
        return;
    }

    // Badges obtenus en premier
    data.badges.forEach(badge => {
        const card = document.createElement('div');
        card.className = 'badge-card';
        card.innerHTML = `
            <div class="badge-icon" style="background-color: ${badge.color}">
                <i class="fas ${badge.icon}"></i>
            </div>
            <h3 class="badge-name">${badge.name}</h3>
            <p class="badge-description">${badge.description}</p>
            <span class="badge-points">+${badge.points} XP</span>
        `;
        grid.appendChild(card);
    });

    // Séparateur seulement si on a des deux
    const lockedBadges = ALL_BADGES.filter(b => !unlockedIds.includes(b.id));
    if (data.badges.length > 0 && lockedBadges.length > 0) {
        const divider = document.createElement('div');
        divider.className = 'section-divider';
        grid.appendChild(divider);
    }

    // Badges verrouillés
    lockedBadges.forEach(badge => {
        const card = document.createElement('div');
        card.className = 'badge-card badge-locked';
        card.innerHTML = `
            <div class="badge-icon" style="background-color: #e5e7eb; position: relative;">
                <i class="fas ${badge.icon}"></i>
                <i class="fas fa-lock badge-lock-overlay"></i>
            </div>
            <h3 class="badge-name">${badge.name}</h3>
            <p class="badge-description">${badge.description}</p>
            <span class="badge-points">+${badge.points} XP</span>
        `;
        grid.appendChild(card);
    });
}

// ===================================================
// ================= PAGE : PROFILE ==================
// ===================================================

function initProfilePage() {
    const data = loadData();
    updateProfile(data);

    const resetBtn = document.querySelector('[onclick="resetProgress()"]');
    if (resetBtn) {
        resetBtn.removeAttribute('onclick');
        resetBtn.addEventListener('click', resetProgress);
    }
}

function updateProfile() {
    const tasks = getData().tasks;
    const totalPoints = getData().points;
    const badges = getData().badges;
    const streak = getData().streak;

    const completedTasks = tasks.filter(t => t.completed);
    const dailyTasks     = tasks.filter(t => t.category === 'daily');
    const onceTasks      = tasks.filter(t => t.category === 'once');
    const dailyCompleted = dailyTasks.filter(t => t.completed).length;
    const onceCompleted  = onceTasks.filter(t => t.completed).length;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set('xp-points',       totalPoints);
    set('player-level',    calculateLevel(totalPoints));
    set('completed-tasks', completedTasks.length);
    set('total-badges',    badges.length);
    set('current-streak',  streak);

    // Barres de progression
    const dailyPct = dailyTasks.length > 0 ? Math.round((dailyCompleted / dailyTasks.length) * 100) : 0;
    const oncePct  = onceTasks.length  > 0 ? Math.round((onceCompleted  / onceTasks.length)  * 100) : 0;
    const streakPct = Math.min(Math.round((streak / 7) * 100), 100);
    const successRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

    const setWidth = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = pct + '%'; };
    setWidth('daily-progress',  dailyPct);
    setWidth('once-progress',   oncePct);
    setWidth('streak-progress', streakPct);
    setWidth('success-rate',    successRate);

    set('daily-value',        `${dailyCompleted} / ${dailyTasks.length}`);
    set('once-value',         `${onceCompleted} / ${onceTasks.length}`);
    set('streak-value',       `${streak} jours`);
    set('success-rate-value', `${successRate}%`);

    // Barre XP vers le prochain niveau
    const currentLevel = calculateLevel(totalPoints);
    const xpStart = getXpForLevel(currentLevel);
    const xpEnd   = getXpForLevel(currentLevel + 1);
    const xpPct   = Math.round(((totalPoints - xpStart) / (xpEnd - xpStart)) * 100);

    const xpBar  = document.getElementById('xp-bar');
    const xpText = document.getElementById('xp-progress-text');
    if (xpBar)  xpBar.style.width = xpPct + '%';
    if (xpText) xpText.textContent = `${totalPoints - xpStart} / ${xpEnd - xpStart} XP`;

    // Succès récents
    renderRecentSuccess(badges);
}


function renderRecentSuccess(badges) {
    const grid = document.getElementById('recent-success-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!badges || badges.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-medal"></i>
                <p>Terminez des quêtes pour voir vos récompenses ici !</p>
            </div>
        `;
        return;
    }

    badges.slice().reverse().forEach(badge => {
        const card = document.createElement('div');
        card.className = 'recent-badge-card';
        card.innerHTML = `
            <div class="recent-badge-icon" style="background-color: ${badge.color || '#f59e0b'}">
                <i class="fas ${badge.icon}"></i>
            </div>
            <div class="recent-badge-info">
                <h4>${badge.name}</h4>
                <p>${badge.description || ''}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}


function resetProgress() {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser toutes vos données ?")) return;

    localStorage.clear();
    const emptyData = {
        tasks:        [],
        totalPoints:  0,
        badges:       [],
        streak:       0,
        lastTaskDate: null
    };
    updateProfile(emptyData);
    alert("Vos données ont été réinitialisées avec succès !");
}

// ===================================================
// ================= ROUTEUR =========================
// ===================================================

document.addEventListener('DOMContentLoaded', function () {
    const page = window.location.pathname.split('/').pop();

    if (page === 'index.html' || page === '') {
        initIndexPage();
    } else if (page === 'tasks.html') {
        initTasksPage();
    } else if (page === 'badges.html') {
        initBadgesPage();
    } else if (page === 'profile.html') {
        initProfilePage();
    }
});

// ===== FONCTIONS DE CUSTOMISATION =====

// Sauvegarder la sélection
function saveCustomization(category, id) {
    localStorage.setItem(`selected${category.charAt(0).toUpperCase() + category.slice(1)}`, id);

    // Mettre à jour les styles
    const selectedColor = localStorage.getItem('selectedColor') || '#f59e0b';
    document.documentElement.style.setProperty('--current-accent', selectedColor);

    // Rafraîchir le profil si ouvert
    if (document.querySelector('.profile-hero')) {
        updateProfileVisuals();
    }
}

// Charger la customisation existante
function loadCustomization() {
    const selectedTitle = localStorage.getItem('selectedTitle') || 'Débutant';
    const selectedColor = localStorage.getItem('selectedColor') || '#f59e0b';

    document.documentElement.style.setProperty('--current-accent', selectedColor);

    // Appliquer au profil si présent
    if (document.querySelector('.profile-hero')) {
        updateProfileVisuals();
    }
}

// Mettre à jour les éléments visuels du profil
function updateProfileVisuals() {
    const selectedTitle = localStorage.getItem('selectedTitle') || 'Débutant';
    const selectedAvatar = localStorage.getItem('selectedAvatar') || 'fa-dragon';

    // Avatar
    const avatarElement = document.querySelector('.profile-hero-avatar i');
    if (avatarElement) {
        avatarElement.className = '';
        avatarElement.classList.add('fas', selectedAvatar);
    }

    // Titre
    const titleElement = document.querySelector('.profile-hero-title');
    if (titleElement) {
        titleElement.textContent = selectedTitle;
    }

    // Cadre
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        const selectedColor = localStorage.getItem('selectedColor') || '#f59e0b';
        profileCard.style.border = `3px solid ${selectedColor}`;
    }

    // Hero
    const hero = document.querySelector('.profile-hero');
    if (hero) {
        const selectedColor = localStorage.getItem('selectedColor') || '#f59e0b';
        hero.style.background = `linear-gradient(135deg, var(--primary-color), ${selectedColor})`;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadCustomization();

    // Écouter les changements dans localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'selectedTitle' || e.key === 'selectedAvatar' ||
            e.key === 'selectedColor' || e.key === 'selectedFrame') {
            loadCustomization();
        }
    });
});
