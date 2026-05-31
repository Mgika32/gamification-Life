document.addEventListener('DOMContentLoaded', function() {
    // Charger les tâches depuis les données globales
    renderTasks();

    // Gérer le formulaire d'ajout de tâche
    const taskForm = document.getElementById('new-task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-description').value;
            const type = document.getElementById('task-type').value;
            const points = parseInt(document.getElementById('task-points').value) || 10;

            // Créer une nouvelle tâche
            const newTask = {
                id: Date.now(),
                title,
                description,
                type,
                points,
                completed: false,
                createdAt: new Date().toISOString()
            };

            // Ajouter à la liste des tâches
            appData.tasks.push(newTask);
            saveData();

            // Réinitialiser le formulaire
            taskForm.reset();

            // Re-rendre les tâches
            renderTasks();
        });
    }

    // Gérer les onglets de catégorie
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Désactiver tous les onglets
            categoryTabs.forEach(t => t.classList.remove('active'));

            // Activer l'onglet cliqué
            this.classList.add('active');

            // Filtrer les tâches
            const category = this.getAttribute('data-category');
            renderTasks(category);
        });
    });
});

// ===== Fonction pour afficher les tâches =====
function renderTasks(category = 'all') {
    const tasksGrid = document.getElementById('tasks-grid');
    if (!tasksGrid) return;

    // Filtrer les tâches
    let filteredTasks = appData.tasks;

    if (category !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.type === category);
    }

    // Trier les tâches (non complétées en premier, puis par date)
    filteredTasks.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    let tasksHTML = '';

    if (filteredTasks.length === 0) {
        tasksHTML = `
            <div class="no-tasks">
                <i class="fas fa-clipboard-list"></i>
                <p>Aucune tâche ${category === 'all' ? '' : category === 'daily' ? 'quotidienne' : 'ponctuelle'} trouvée.</p>
                <p>Ajoutez-en une pour commencer !</p>
            </div>
        `;
    } else {
        filteredTasks.forEach(task => {
            tasksHTML += `
                <div class="task-card ${task.completed ? 'completed' : ''}">
                    <div class="task-header">
                        <h3 class="task-title">${task.title}</h3>
                        <span class="task-points">${task.points} pts</span>
                    </div>
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    <div class="task-actions">
                        <button class="btn btn-complete" onclick="completeTask(${task.id})">
                            <i class="fas fa-check"></i> Terminer
                        </button>
                        <button class="btn btn-delete" onclick="deleteTask(${task.id})">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                    ${task.completed ? '<div class="task-completed-badge">✓</div>' : ''}
                </div>
            `;
        });
    }

    tasksGrid.innerHTML = tasksHTML;
}

// ===== Fonctions pour gérer les tâches =====
function completeTask(taskId) {
    const taskIndex = appData.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        appData.tasks[taskIndex].completed = true;
        addPoints(appData.tasks[taskIndex].points);

        // Vérifier si l'utilisateur a débloqué un badge
        if (appData.tasks[taskIndex].points >= 100) {
            awardBadge(4); // Badge "Nuit blanche"
        }

        if (appData.user.points >= 500) {
            awardBadge(5); // Badge "Marathonien"
        }

        saveData();
        renderTasks();
    }
}

function deleteTask(taskId) {
    if (confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
        appData.tasks = appData.tasks.filter(t => t.id !== taskId);
        saveData();
        renderTasks();
    }
}

// ===== Exporter les fonctions =====
window.renderTasks = renderTasks;
window.completeTask = completeTask;
window.deleteTask = deleteTask;
