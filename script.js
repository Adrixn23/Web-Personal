const DEFAULT_PROFILE = {
  name: "Adrian Francisco Brito Nelkitts",
  role: "Software Developer (.NET 9 & C#)",
  bio: "Desarrollador de software proactivo, enfocado en el ecosistema .NET 9, C#, Onion / Clean Architecture, Entity Framework Core, SQL Server y desarrollo de software escalable. Disciplinado, constante y curioso por la ingeniería y el aprendizaje continuo."
};

const DEFAULT_GOALS = [
  { id: "1", text: "Dominar concurrencia y optimización de microservicios en .NET 9", completed: true },
  { id: "2", text: "Implementar arquitecturas RAG avanzadas con bases de datos vectoriales", completed: true },
  { id: "3", text: "Profundizar en Domain-Driven Design (DDD) y Onion Architecture", completed: false },
  { id: "4", text: "Construir APIs reactivas y flujos asíncronos en tiempo real con WebSockets", completed: false }
];

const storage = {
  get: (key, fallback) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  getString: (key, fallback) => {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch {}
  }
};

const dom = {
  themeToggle: document.getElementById("theme-toggle"),
  profileName: document.getElementById("profile-name"),
  profileRole: document.getElementById("profile-role"),
  profileBio: document.getElementById("profile-bio"),
  editProfileBtn: document.getElementById("edit-profile-btn"),
  profileModal: document.getElementById("profile-modal"),
  closeModalBtn: document.getElementById("close-modal-btn"),
  cancelProfileBtn: document.getElementById("cancel-profile-btn"),
  profileForm: document.getElementById("profile-form"),
  inputName: document.getElementById("input-name"),
  inputRole: document.getElementById("input-role"),
  inputBio: document.getElementById("input-bio"),
  goalForm: document.getElementById("goal-form"),
  goalInput: document.getElementById("goal-input"),
  goalsList: document.getElementById("goals-list")
};

let currentProfile = storage.get("profileData", DEFAULT_PROFILE);
let currentGoals = storage.get("techGoals", DEFAULT_GOALS);

const updateThemeUI = (theme) => {
  const isLight = theme === "light";
  document.body.classList.toggle("light-theme", isLight);
  if (dom.themeToggle) {
    dom.themeToggle.setAttribute("aria-label", isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
    dom.themeToggle.textContent = isLight ? "🌙" : "☀️";
  }
};

const initTheme = () => {
  const savedTheme = storage.getString("theme", "dark");
  updateThemeUI(savedTheme);
};

const toggleTheme = () => {
  const isCurrentlyLight = document.body.classList.contains("light-theme");
  const nextTheme = isCurrentlyLight ? "dark" : "light";
  storage.set("theme", nextTheme);
  updateThemeUI(nextTheme);
};

const renderProfile = (data) => {
  if (dom.profileName) dom.profileName.textContent = data.name;
  if (dom.profileRole) dom.profileRole.textContent = data.role;
  if (dom.profileBio) dom.profileBio.textContent = data.bio;
};

const openModal = () => {
  if (!dom.profileModal) return;
  if (dom.inputName) dom.inputName.value = currentProfile.name;
  if (dom.inputRole) dom.inputRole.value = currentProfile.role;
  if (dom.inputBio) dom.inputBio.value = currentProfile.bio;
  dom.profileModal.classList.add("active");
  dom.profileModal.setAttribute("aria-hidden", "false");
  if (dom.inputName) dom.inputName.focus();
};

const closeModal = () => {
  if (!dom.profileModal) return;
  dom.profileModal.classList.remove("active");
  dom.profileModal.setAttribute("aria-hidden", "true");
};

const handleProfileSubmit = (e) => {
  e.preventDefault();
  const updatedProfile = {
    name: dom.inputName ? dom.inputName.value.trim() || DEFAULT_PROFILE.name : DEFAULT_PROFILE.name,
    role: dom.inputRole ? dom.inputRole.value.trim() || DEFAULT_PROFILE.role : DEFAULT_PROFILE.role,
    bio: dom.inputBio ? dom.inputBio.value.trim() || DEFAULT_PROFILE.bio : DEFAULT_PROFILE.bio
  };
  currentProfile = updatedProfile;
  storage.set("profileData", currentProfile);
  renderProfile(currentProfile);
  closeModal();
};

const createGoalElement = (goal) => {
  const li = document.createElement("li");
  li.className = `goal-item ${goal.completed ? "completed" : ""}`;
  li.dataset.id = goal.id;

  const content = document.createElement("div");
  content.className = "goal-content";
  content.dataset.action = "toggle";

  const checkbox = document.createElement("span");
  checkbox.className = "goal-checkbox";
  checkbox.setAttribute("aria-hidden", "true");
  checkbox.textContent = "✓";

  const text = document.createElement("span");
  text.className = "goal-text";
  text.textContent = goal.text;

  content.appendChild(checkbox);
  content.appendChild(text);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn-icon-danger";
  deleteBtn.dataset.action = "delete";
  deleteBtn.setAttribute("aria-label", `Eliminar meta: ${goal.text}`);
  deleteBtn.textContent = "✕";

  li.appendChild(content);
  li.appendChild(deleteBtn);

  return li;
};

const renderGoals = (goals) => {
  if (!dom.goalsList) return;
  dom.goalsList.innerHTML = "";
  if (goals.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No hay metas técnicas registradas. Añade una arriba.";
    dom.goalsList.appendChild(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  goals.forEach((goal) => {
    fragment.appendChild(createGoalElement(goal));
  });
  dom.goalsList.appendChild(fragment);
};

const handleAddGoal = (e) => {
  e.preventDefault();
  if (!dom.goalInput) return;
  const text = dom.goalInput.value.trim();
  if (!text) return;

  const newGoal = {
    id: Date.now().toString(),
    text,
    completed: false
  };

  currentGoals = [newGoal, ...currentGoals];
  storage.set("techGoals", currentGoals);
  renderGoals(currentGoals);
  dom.goalInput.value = "";
  dom.goalInput.focus();
};

const handleGoalAction = (e) => {
  const target = e.target;
  const actionElement = target.closest("[data-action]");
  if (!actionElement) return;

  const goalItem = target.closest(".goal-item");
  if (!goalItem || !goalItem.dataset.id) return;

  const goalId = goalItem.dataset.id;
  const action = actionElement.dataset.action;

  if (action === "toggle") {
    currentGoals = currentGoals.map((g) => (g.id === goalId ? { ...g, completed: !g.completed } : g));
    storage.set("techGoals", currentGoals);
    renderGoals(currentGoals);
  } else if (action === "delete") {
    currentGoals = currentGoals.filter((g) => g.id !== goalId);
    storage.set("techGoals", currentGoals);
    renderGoals(currentGoals);
  }
};

const bindEvents = () => {
  if (dom.themeToggle) {
    dom.themeToggle.addEventListener("click", toggleTheme);
  }

  if (dom.editProfileBtn) {
    dom.editProfileBtn.addEventListener("click", openModal);
  }

  if (dom.closeModalBtn) {
    dom.closeModalBtn.addEventListener("click", closeModal);
  }

  if (dom.cancelProfileBtn) {
    dom.cancelProfileBtn.addEventListener("click", closeModal);
  }

  if (dom.profileModal) {
    dom.profileModal.addEventListener("click", (e) => {
      if (e.target === dom.profileModal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dom.profileModal && dom.profileModal.classList.contains("active")) {
      closeModal();
    }
  });

  if (dom.profileForm) {
    dom.profileForm.addEventListener("submit", handleProfileSubmit);
  }

  if (dom.goalForm) {
    dom.goalForm.addEventListener("submit", handleAddGoal);
  }

  if (dom.goalsList) {
    dom.goalsList.addEventListener("click", handleGoalAction);
  }
};

const init = () => {
  initTheme();
  renderProfile(currentProfile);
  renderGoals(currentGoals);
  bindEvents();
};

document.addEventListener("DOMContentLoaded", init);
