// ===== Données de l'application =====
let appData = {
    user: {
        id: 1,
        name: "Invité",
        email: "invite@example.com",
        points: 0,
        streak: {
            count: 0,
            days: [],
            lastActive: null
        },
        badges: []
    },
    tasks: [],
    badges: [
        { id: 1, name: "Débutant", description: "A accompli sa première tâche", icon: "🌱", pointsRequired: 10, obtained: false },
        { id: 2, name: "Motivé", description: "A accompli 5 tâches", icon: "💪", pointsRequired: 50, obtained: false },
        { id: 3, name: "Expert", description: "A accompli 20 tâches", icon: "🏆", pointsRequired: 200, obtained: false },
        { id: 4, name: "Nuit blanche", description: "A accompli une tâche à 3h du matin", icon: "🌙", pointsRequired: 150, obtained: false },
        { id: 5, name: "Marathonien", description: "A accompli 10 tâches en une journée", icon: "🏃", pointsRequired: 300, obtained: false },
        { id: 6, name: "Routine parfaite", description: "A accompli toutes ses tâches quotidiennes pendant 7 jours", icon: "⏰", pointsRequired: 500, obtained: false }
    ]
};

// ===== Initialisation =====
document.addEventListener('DOMContentLoaded', function() {
    // Charger les données depuis localStorage
    loadData();

    // Mettre à jour l'affichage des points
    updatePointsDisplay();

    // Vérifier la série (streak)
    checkStreak();

    // Mettre à jour les badges
    updateBadges();
});

// ===== Fonctions utilitaires =====
function saveData() {
    localStorage.setItem('gamificationAppData', JSON.stringify(appData));
}

function loadData() {
    const savedData = localStorage.getItem('gamificationAppData');
    if (savedData) {
        appData = JSON.parse(savedData);
    }
}

function updatePointsDisplay() {
    // Mettre à jour tous les affichages de points
    document.querySelectorAll('#user-points').forEach(el => {
        el.textContent = appData.user.points;
    });

    document.querySelectorAll('#total-points').forEach(el => {
        el.textContent = appData.user.points;
    });
}

function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format YYYY-MM-DD
}

function checkStreak() {
    const today = getCurrentDate();
    const lastActive = appData.user.streak.lastActive;

    if (lastActive === today) {
        // Déjà actif aujourd'hui, rien à faire
        return;
    }

    if (lastActive === null) {
        // Premier jour
        appData.user.streak.count = 1;
        appData.user.streak.days = [today];
        appData.user.streak.lastActive = today;
    } else {
        const lastDate = new Date(lastActive);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Série continue
            appData.user.streak.count++;
            appData.user.streak.days.push(today);
            appData.user.streak.lastActive = today;
        } else {
            // Série brisée
            appData.user.streak.count = 1;
            appData.user.streak.days = [today];
            appData.user.streak.lastActive = today;
        }
    }

    // Sauvegarder les changements
    saveData();
}

function updateBadges() {
    appData.badges.forEach(badge => {
        if (!badge.obtained) {
            const userHasBadge = appData.user.badges.some(b => b.id === badge.id);
            if (userHasBadge) {
                badge.obtained = true;
            }
        }
    });

    saveData();
}

function awardBadge(badgeId) {
    const badge = appData.badges.find(b => b.id === badgeId);
    if (badge && !badge.obtained) {
        appData.user.badges.push(badge);
        badge.obtained = true;
        saveData();

        // Notification
        alert(`🎉 Félicitations ! Vous avez débloqué le badge : "${badge.name}"`);
    }
}

function addPoints(points) {
    appData.user.points += points;
    saveData();
    updatePointsDisplay();
    checkStreak();
}

// ===== Export des fonctions =====
window.appData = appData;
window.saveData = saveData;
window.loadData = loadData;
window.updatePointsDisplay = updatePointsDisplay;
window.checkStreak = checkStreak;
window.updateBadges = updateBadges;
window.awardBadge = awardBadge;
window.addPoints = addPoints;
