// ===== CHARGEMENT DES DONNÉES =====
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
let badges = JSON.parse(localStorage.getItem('badges')) || [];
let streak = parseInt(localStorage.getItem('streak')) || 0;

// ===== CALCUL DU NIVEAU =====
function calculateLevel(xp) {
    let level = 1;
    let xpForLevel = 100;
    while (xp >= xpForLevel) {
        level++;
        xpForLevel += 50 * level;
    }
    return level;
}

function getXpForNextLevel(xp) {
    let level = 1;
    let xpForLevel = 100;
    while (xp >= xpForLevel) {
        level++;
        xpForLevel += 50 * level;
    }
    return xpForLevel;
}

// ===== MISE À JOUR DU PROFIL =====
function updateProfile() {
    const completedTasks = tasks.filter(t => t.completed);
    const dailyTasks = tasks.filter(t => t.category === 'daily');
    const onceTasks = tasks.filter(t => t.category === 'once');
    const dailyCompleted = dailyTasks.filter(t => t.completed).length;
    const onceCompleted = onceTasks.filter(t => t.completed).length;

    // Stats cards
    document.getElementById('xp-points').textContent = totalPoints;
    document.getElementById('completed-tasks').textContent = completedTasks.length;
    document.getElementById('total-badges').textContent = badges.length;
    document.getElementById('current-streak').textContent = streak;

    // Niveau + barre XP
    const level = calculateLevel(totalPoints);
    const nextLevelXp = getXpForNextLevel(totalPoints);
    const prevLevelXp = nextLevelXp - (50 * level); // XP du niveau précédent
    const progress = Math.min(((totalPoints - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100, 100);

    document.getElementById('player-level').textContent = level;
    document.getElementById('xp-bar').style.width = progress + '%';
    document.getElementById('xp-progress-text').textContent = `${totalPoints} / ${nextLevelXp} XP`;

    // Stats avancées
    const dailyPercent = dailyTasks.length > 0 ? (dailyCompleted / dailyTasks.length) * 100 : 0;
    const oncePercent = onceTasks.length > 0 ? (onceCompleted / onceTasks.length) * 100 : 0;
    const streakPercent = Math.min((streak / 7) * 100, 100); // objectif 7 jours
    const successRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    document.getElementById('daily-value').textContent = `${dailyCompleted} / ${dailyTasks.length}`;
    document.getElementById('daily-progress').style.width = dailyPercent + '%';

    document.getElementById('once-value').textContent = `${onceCompleted} / ${onceTasks.length}`;
    document.getElementById('once-progress').style.width = oncePercent + '%';

    document.getElementById('streak-value').textContent = `${streak} jours`;
    document.getElementById('streak-progress').style.width = streakPercent + '%';

    document.getElementById('success-rate-value').textContent = Math.round(successRate) + '%';
    document.getElementById('success-rate').style.width = successRate + '%';

    // Succès récents
    renderRecentBadges();
}

// ===== SUCCÈS RÉCENTS =====
function renderRecentBadges() {
    const grid = document.getElementById('recent-success-grid');

    if (badges.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-medal"></i>
                <p>Terminez des quêtes pour voir vos récompenses ici !</p>
            </div>
        `;
        return;
    }

    const recentBadges = [...badges].reverse().slice(0, 3);
    grid.innerHTML = recentBadges.map(badge => `
        <div class="badge-card unlocked">
            <div class="badge-icon" style="color: ${badge.color || '#f59e0b'}">
                <i class="fas ${badge.icon || 'fa-trophy'}"></i>
            </div>
            <div class="badge-name">${badge.name}</div>
        </div>
    `).join('');
}

// ===== RÉINITIALISATION =====
function resetProgress() {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser toutes vos données ?")) {
        localStorage.clear();
        tasks = [];
        totalPoints = 0;
        badges = [];
        streak = 0;
        updateProfile();
        alert("Données réinitialisées !");
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    updateProfile();
});
