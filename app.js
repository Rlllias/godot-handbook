// State
let db = { categories: [], articles: [] };
let currentCategoryId = 'all';
let currentNodeFilter = 'all';
let currentArticleId = null;
let currentLang = 'ru';
let currentTheme = 'godot';
let bookmarks = new Set();
let userNotes = {}; // { [articleId]: [ { id, title, text, code, createdAt } ] }
let editingNoteId = null;
let isNoteFormOpen = false;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// UI Localization Dictionary
const i18n = {
  ru: {
    app_title: 'Godot 4.x',
    app_subtitle: 'Справочник',
    search_placeholder: 'Поиск по темам, коду, тегам...',
    articles: 'Статьи',
    search_results: 'Результаты поиска',
    no_results: 'Ничего не найдено по запросу',
    no_bookmarks: 'Нет статей в закладках',
    no_category_articles: 'Нет статей в этом разделе',
    copy_code: 'Копировать',
    copied: 'Скопировано!',
    bookmark_add: '☆ В закладки',
    bookmark_saved: '★ В закладках',
    toast_copied: 'Код скопирован в буфер обмена',
    toast_bookmarked: 'Добавлено в закладки',
    toast_unbookmarked: 'Удалено из закладок',
    toast_theme_changed: 'Тема оформления изменена',
    toast_lang_changed: 'Язык переключен',
    settings_title: 'Настройки оформления и языка',
    theme_setting: 'Стиль интерфейса',
    theme_godot_name: '🔷 Classic Godot',
    theme_godot_desc: 'Тёмный сине-серый технологичный стиль редактора',
    theme_mexico_name: '🌵 Desierto Mexicano',
    theme_mexico_desc: 'Тёплый закат, песок, кактусы и ночная пустыня',
    lang_setting: 'Язык справочника и интерфейса',
    done: 'Готово',
    // Export Code
    export_gd: 'Сохранить .gd',
    export_template: '📥 Экспорт шаблона (.gd)',
    toast_file_saved: 'Файл .gd успешно сохранён!',
    toast_file_error: 'Не удалось сохранить файл',
    // Node Filter
    node_filter_label: 'Тип узла:',
    node_all: 'Все',
    node_filter_empty: 'Нет статей для выбранного типа узла',
    // Notes
    notes_title: 'Мои заметки и сниппеты',
    notes_add_btn: '+ Добавить заметку',
    notes_empty: 'У вас пока нет личных заметок к этой теме. Нажмите «+ Добавить заметку», чтобы записать идеи или сохранить свой сниппет!',
    notes_new_title: 'Новая заметка / сниппет',
    notes_edit_title: 'Редактирование заметки',
    notes_lbl_title: 'Заголовок / Тема',
    notes_placeholder_title: 'Например: Мои настройки прыжка или параметры тайлов',
    notes_lbl_desc: 'Описание / Заметки',
    notes_placeholder_desc: 'Пояснения, формулы, логика...',
    notes_lbl_code: 'GDScript сниппет (необязательно)',
    notes_placeholder_code: '# func custom_method():\n#     pass',
    notes_save_btn: 'Сохранить',
    notes_cancel_btn: 'Отмена',
    notes_edit_btn: '✏️ Изменить',
    notes_delete_btn: '🗑️ Удалить',
    toast_note_saved: 'Заметка сохранена',
    toast_note_deleted: 'Заметка удалена',
    confirm_delete_note: 'Вы уверены, что хотите удалить эту заметку?'
  },
  en: {
    app_title: 'Godot 4.x',
    app_subtitle: 'Handbook',
    search_placeholder: 'Search topics, code, tags...',
    articles: 'Articles',
    search_results: 'Search Results',
    no_results: 'No matching articles found',
    no_bookmarks: 'No bookmarked articles',
    no_category_articles: 'No articles in this category',
    copy_code: 'Copy',
    copied: 'Copied!',
    bookmark_add: '☆ Bookmark',
    bookmark_saved: '★ Bookmarked',
    toast_copied: 'Code copied to clipboard',
    toast_bookmarked: 'Added to bookmarks',
    toast_unbookmarked: 'Removed from bookmarks',
    toast_theme_changed: 'Theme updated',
    toast_lang_changed: 'Language updated',
    settings_title: 'Appearance & Language Settings',
    theme_setting: 'Interface Style',
    theme_godot_name: '🔷 Classic Godot',
    theme_godot_desc: 'Dark technical editor theme',
    theme_mexico_name: '🌵 Mexican Desert',
    theme_mexico_desc: 'Warm sunset sand, cacti, and deep dusk tones',
    lang_setting: 'Handbook & UI Language',
    done: 'Done',
    // Export Code
    export_gd: 'Save .gd',
    export_template: '📥 Export Template (.gd)',
    toast_file_saved: '.gd file saved successfully!',
    toast_file_error: 'Failed to save file',
    // Node Filter
    node_filter_label: 'Node Domain:',
    node_all: 'All',
    node_filter_empty: 'No articles found for selected node type',
    // Notes
    notes_title: 'My Notes & Snippets',
    notes_add_btn: '+ Add Note',
    notes_empty: 'No personal notes for this topic yet. Click "+ Add Note" to write ideas or attach your custom code snippet!',
    notes_new_title: 'New Note / Snippet',
    notes_edit_title: 'Edit Note',
    notes_lbl_title: 'Title / Subject',
    notes_placeholder_title: 'e.g. Custom jump velocity or tile layer settings',
    notes_lbl_desc: 'Description / Notes',
    notes_placeholder_desc: 'Explanations, formulas, design notes...',
    notes_lbl_code: 'GDScript snippet (optional)',
    notes_placeholder_code: '# func custom_logic():\n#     pass',
    notes_save_btn: 'Save Note',
    notes_cancel_btn: 'Cancel',
    notes_edit_btn: '✏️ Edit',
    notes_delete_btn: '🗑️ Delete',
    toast_note_saved: 'Note saved',
    toast_note_deleted: 'Note deleted',
    confirm_delete_note: 'Are you sure you want to delete this note?'
  },
  'es-mx': {
    app_title: 'Godot 4.x',
    app_subtitle: 'Guía Perrona 🌵',
    search_placeholder: 'Buscar temas, código, tags...',
    articles: 'Temas y Guías',
    search_results: 'Resultados de búsqueda',
    no_results: 'No encontramos nada con esa búsqueda, compa',
    no_bookmarks: 'No tienes nada en favoritos todavía',
    no_category_articles: 'No hay temas en esta sección',
    copy_code: 'Copiar',
    copied: '¡Copiado!',
    bookmark_add: '☆ Guardar',
    bookmark_saved: '★ Guardado',
    toast_copied: 'Código copiado al portapapeles',
    toast_bookmarked: 'Guardado en tus favoritos 🌵',
    toast_unbookmarked: 'Quitado de favoritos',
    toast_theme_changed: 'Estilo visual actualizado 🌵',
    toast_lang_changed: 'Idioma cambiado a Español Mexicano',
    settings_title: 'Configuración de Estilo e Idioma',
    theme_setting: 'Estilo de la Interfaz',
    theme_godot_name: '🔷 Godot Clásico',
    theme_godot_desc: 'Estilo técnico azul oscuro original del editor',
    theme_mexico_name: '🌵 Desierto Mexicano',
    theme_mexico_desc: 'Atardecer cálido, arena dorada, cactáceas y noche norteña',
    lang_setting: 'Idioma de la Guía y la Interfaz',
    done: '¡Listo, vámonos!',
    // Export Code
    export_gd: 'Guardar .gd',
    export_template: '📥 Exportar Plantilla (.gd) 🌵',
    toast_file_saved: '¡Archivo .gd guardado con madre! 🌵',
    toast_file_error: 'No se pudo guardar el archivo',
    // Node Filter
    node_filter_label: 'Tipo de Nodo:',
    node_all: 'Todos',
    node_filter_empty: 'No hay temas con este tipo de nodo',
    // Notes
    notes_title: 'Mis Notas y Snippets Perrones 🌵',
    notes_add_btn: '+ Agregar Nota',
    notes_empty: 'Todavía no tienes notas aquí, compa. ¡Dale a "+ Agregar Nota" para guardar tus ideas o snippets!',
    notes_new_title: 'Nueva Nota / Snippet',
    notes_edit_title: 'Editar Nota',
    notes_lbl_title: 'Título de la nota',
    notes_placeholder_title: 'Ej: Ajustes de salto perrones o configuración de tiles',
    notes_lbl_desc: 'Descripción / Apuntes',
    notes_placeholder_desc: 'Apuntes, fórmulas o recordatorios...',
    notes_lbl_code: 'Código GDScript (opcional)',
    notes_placeholder_code: '# func mi_logica_perrona():\n#     pass',
    notes_save_btn: 'Guardar Nota',
    notes_cancel_btn: 'Cancelar',
    notes_edit_btn: '✏️ Editar',
    notes_delete_btn: '🗑️ Borrar',
    toast_note_saved: '¡Nota guardada, compadre!',
    toast_note_deleted: 'Nota eliminada',
    confirm_delete_note: '¿Seguro que quieres borrar esta nota, compa?'
  },
  es: {
    app_title: 'Godot 4.x',
    app_subtitle: 'Manual',
    search_placeholder: 'Buscar temas, código, etiquetas...',
    articles: 'Artículos',
    search_results: 'Resultados de la búsqueda',
    no_results: 'No se encontraron artículos',
    no_bookmarks: 'No hay artículos en favoritos',
    no_category_articles: 'No hay artículos en esta categoría',
    copy_code: 'Copiar',
    copied: '¡Copiado!',
    bookmark_add: '☆ Guardar',
    bookmark_saved: '★ Guardado',
    toast_copied: 'Código copiado al portapapeles',
    toast_bookmarked: 'Añadido a favoritos',
    toast_unbookmarked: 'Eliminado de favoritos',
    toast_theme_changed: 'Tema actualizado',
    toast_lang_changed: 'Idioma actualizado',
    settings_title: 'Ajustes de Apariencia e Idioma',
    theme_setting: 'Tema de la Interfaz',
    theme_godot_name: '🔷 Godot Clásico',
    theme_godot_desc: 'Tema técnico oscuro del editor',
    theme_mexico_name: '🌵 Desierto Mexicano',
    theme_mexico_desc: 'Tonos cálidos de arena, cactus y noche desértica',
    lang_setting: 'Idioma del Manual y la Interfaz',
    done: 'Aceptar',
    // Export Code
    export_gd: 'Guardar .gd',
    export_template: '📥 Exportar Plantilla (.gd)',
    toast_file_saved: '¡Archivo .gd guardado con éxito!',
    toast_file_error: 'Error al guardar el archivo',
    // Node Filter
    node_filter_label: 'Tipo de Nodo:',
    node_all: 'Todos',
    node_filter_empty: 'No hay artículos para este tipo de nodo',
    // Notes
    notes_title: 'Mis Notas y Snippets',
    notes_add_btn: '+ Añadir Nota',
    notes_empty: 'No tienes notas personales en este tema. ¡Pulsa "+ Añadir Nota" para guardar tus apuntes o código!',
    notes_new_title: 'Nueva Nota / Snippet',
    notes_edit_title: 'Editar Nota',
    notes_lbl_title: 'Título / Asunto',
    notes_placeholder_title: 'Ej: Ajustes de física o capas de colisión',
    notes_lbl_desc: 'Descripción / Apuntes',
    notes_placeholder_desc: 'Explicaciones, fórmulas o enlaces...',
    notes_lbl_code: 'Fragmento GDScript (opcional)',
    notes_placeholder_code: '# func mi_metodo():\n#     pass',
    notes_save_btn: 'Guardar Nota',
    notes_cancel_btn: 'Cancelar',
    notes_edit_btn: '✏️ Editar',
    notes_delete_btn: '🗑️ Eliminar',
    toast_note_saved: 'Nota guardada',
    toast_note_deleted: 'Nota eliminada',
    confirm_delete_note: '¿Estás seguro de que deseas eliminar esta nota?'
  }
};

const quickKeywordsData = {
  ru: [
    { label: '#CharacterBody', kw: 'CharacterBody' },
    { label: '#TileMapLayer', kw: 'TileMapLayer' },
    { label: '#Jolt', kw: 'Jolt' },
    { label: '#await', kw: 'await' },
    { label: '#FSM', kw: 'FSM' },
    { label: '#EventBus', kw: 'Event Bus' }
  ],
  en: [
    { label: '#CharacterBody', kw: 'CharacterBody' },
    { label: '#TileMapLayer', kw: 'TileMapLayer' },
    { label: '#Jolt', kw: 'Jolt' },
    { label: '#await', kw: 'await' },
    { label: '#FSM', kw: 'FSM' },
    { label: '#EventBus', kw: 'Event Bus' }
  ],
  'es-mx': [
    { label: '#CharacterBody', kw: 'CharacterBody' },
    { label: '#TileMapLayer', kw: 'TileMapLayer' },
    { label: '#JoltPerrón', kw: 'Jolt' },
    { label: '#await', kw: 'await' },
    { label: '#FSM', kw: 'FSM' },
    { label: '#EventBusChido', kw: 'Event Bus' }
  ],
  es: [
    { label: '#CharacterBody', kw: 'CharacterBody' },
    { label: '#TileMapLayer', kw: 'TileMapLayer' },
    { label: '#Jolt', kw: 'Jolt' },
    { label: '#await', kw: 'await' },
    { label: '#FSM', kw: 'FSM' },
    { label: '#BusEventos', kw: 'Event Bus' }
  ]
};

// DOM References
const categoriesNav = $('#categories-nav');
const articlesList = $('#articles-list');
const articlesCounter = $('#articles-counter');
const articlesListTitle = $('#articles-list-title');
const contentContainer = $('#content-container');
const searchInput = $('#search-input');
const btnClearSearch = $('#btn-clear-search');
const quickKeywordsContainer = $('#quick-keywords');
const settingsModal = $('#settings-modal');
const toast = $('#toast');
const toastMessage = $('#toast-message');

async function initApp() {
  try {
    loadStoredPreferences();
    applyTheme(currentTheme, false);
    await loadData();
    setupEventListeners();
    updateStaticUILabels();
    renderQuickKeywords();
    renderNodeFilterBar();
    renderCategories();
    renderArticles();
    
    if (db.articles && db.articles.length > 0) {
      selectArticle(db.articles[0].id);
    }
  } catch (err) {
    console.error('Initialization error in initApp:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function loadStoredPreferences() {
  try {
    const savedTheme = localStorage.getItem('godot_theme');
    if (savedTheme === 'mexico' || savedTheme === 'godot') {
      currentTheme = savedTheme;
    }
    const savedLang = localStorage.getItem('godot_lang');
    if (savedLang && i18n[savedLang]) {
      currentLang = savedLang;
    }
    const rawBookmarks = localStorage.getItem('godot_bookmarks');
    if (rawBookmarks) {
      bookmarks = new Set(JSON.parse(rawBookmarks));
    }
    const rawNotes = localStorage.getItem('godot_user_notes');
    if (rawNotes) {
      userNotes = JSON.parse(rawNotes);
    }
  } catch (err) {
    console.warn('Preferences load error:', err);
  }
}

function applyTheme(theme, showNotice = true) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('godot_theme', theme);

  $$('.theme-card').forEach(card => {
    card.classList.toggle('active', card.dataset.themeId === theme);
  });

  const iconWrap = $('#brand-icon-wrap');
  if (iconWrap) {
    if (theme === 'mexico') {
      iconWrap.innerHTML = '<span style="font-size:18px;">🌵</span>';
    } else {
      iconWrap.innerHTML = `
        <svg class="godot-icon" viewBox="0 0 24 24" width="20" height="20" fill="none">
          <rect width="24" height="24" rx="5" fill="currentColor"/>
          <circle cx="8" cy="11" r="2" fill="#ffffff"/>
          <circle cx="16" cy="11" r="2" fill="#ffffff"/>
          <path d="M7 16c1.5 1.5 8.5 1.5 10 0" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
          <rect x="11" y="4" width="2" height="3" rx="1" fill="#ffffff"/>
          <circle cx="12" cy="3" r="1.5" fill="#ffffff"/>
        </svg>
      `;
    }
  }

  if (showNotice) {
    showToast(t('toast_theme_changed'));
  }
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('godot_lang', lang);

  $$('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langCode === lang);
  });

  updateStaticUILabels();
  renderQuickKeywords();
  renderNodeFilterBar();
  renderCategories();
  renderArticles();
  
  if (currentArticleId) {
    const article = db.articles.find(a => a.id === currentArticleId);
    if (article) {
      renderArticleContent(article);
    }
  }
  showToast(t('toast_lang_changed'));
}

function t(key) {
  return (i18n[currentLang] && i18n[currentLang][key]) || (i18n['ru'] && i18n['ru'][key]) || key;
}

function updateStaticUILabels() {
  const elAppTitle = $('#lbl-app-title');
  if (elAppTitle) elAppTitle.textContent = t('app_title');

  const elAppSub = $('#lbl-app-subtitle');
  if (elAppSub) elAppSub.textContent = t('app_subtitle');

  if (searchInput) searchInput.placeholder = t('search_placeholder');
  if (articlesListTitle) articlesListTitle.textContent = t('articles');

  const lblNodeFilter = $('#lbl-node-filter');
  if (lblNodeFilter) lblNodeFilter.textContent = t('node_filter_label');
  const lblNodeCurrent = $('#lbl-node-current');
  if (lblNodeCurrent) lblNodeCurrent.textContent = currentNodeFilter === 'all' ? t('node_all') : currentNodeFilter;

  const elSetTitle = $('#lbl-settings-title');
  if (elSetTitle) elSetTitle.textContent = t('settings_title');

  const elThemeSet = $('#lbl-theme-setting');
  if (elThemeSet) elThemeSet.textContent = t('theme_setting');

  const elGodotName = $('#lbl-theme-godot-name');
  if (elGodotName) elGodotName.textContent = t('theme_godot_name');

  const elGodotDesc = $('#lbl-theme-godot-desc');
  if (elGodotDesc) elGodotDesc.textContent = t('theme_godot_desc');

  const elMexName = $('#lbl-theme-mexico-name');
  if (elMexName) elMexName.textContent = t('theme_mexico_name');

  const elMexDesc = $('#lbl-theme-mexico-desc');
  if (elMexDesc) elMexDesc.textContent = t('theme_mexico_desc');

  const elLangSet = $('#lbl-lang-setting');
  if (elLangSet) elLangSet.textContent = t('lang_setting');

  const elSaveSet = $('#btn-save-settings');
  if (elSaveSet) elSaveSet.textContent = t('done');
}

function renderQuickKeywords() {
  const keywords = quickKeywordsData[currentLang] || quickKeywordsData['ru'];
  quickKeywordsContainer.innerHTML = keywords.map(item => `
    <button class="qk-chip" data-kw="${escapeHtml(item.kw)}">${escapeHtml(item.label)}</button>
  `).join('');

  $$('.qk-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const kw = btn.dataset.kw;
      searchInput.value = kw;
      btnClearSearch.style.display = 'block';
      renderArticles();
      searchInput.focus();
    });
  });
}

function renderNodeFilterBar() {
  const nodes = [
    { id: 'all', label: t('node_all'), dot: null },
    { id: '2D', label: '2D', dot: 'dot-2d' },
    { id: '3D', label: '3D', dot: 'dot-3d' },
    { id: 'UI', label: 'UI', dot: 'dot-ui' },
    { id: 'Core', label: 'Core', dot: 'dot-core' }
  ];

  const nodeBar = $('#node-filter-bar');
  if (!nodeBar) return;

  nodeBar.innerHTML = nodes.map(n => `
    <button class="node-chip-btn ${currentNodeFilter === n.id ? 'active' : ''}" data-node="${n.id}">
      ${n.dot ? `<span class="node-dot ${n.dot}"></span>` : ''}
      <span>${escapeHtml(n.label)}</span>
    </button>
  `).join('');

  $$('.node-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentNodeFilter = btn.dataset.node;
      renderNodeFilterBar();
      const lblCurrent = $('#lbl-node-current');
      if (lblCurrent) lblCurrent.textContent = currentNodeFilter === 'all' ? t('node_all') : currentNodeFilter;
      renderArticles();
    });
  });
}

async function loadData() {
  // 1. Preload IPC from main process
  if (window.api && typeof window.api.getDatabase === 'function') {
    try {
      const fromIpc = await window.api.getDatabase();
      if (fromIpc && fromIpc.articles && fromIpc.articles.length > 0) {
        db = fromIpc;
        return;
      }
    } catch (e) {
      console.warn('IPC getDatabase error:', e);
    }
  }

  // 2. Fallback to fetch (for browser / local server)
  try {
    const res = await fetch('data/database.json');
    db = await res.json();
  } catch (err) {
    console.error('Failed to load database.json:', err);
  }
}

function setupEventListeners() {
  // Window controls
  if (window.api) {
    const bMin = $('#btn-minimize');
    const bMax = $('#btn-maximize');
    const bClose = $('#btn-close');
    if (bMin) bMin.addEventListener('click', () => window.api.windowMinimize());
    if (bMax) bMax.addEventListener('click', () => window.api.windowMaximize());
    if (bClose) bClose.addEventListener('click', () => window.api.windowClose());
  }

  // Settings modal
  const btnSettings = $('#btn-open-settings');
  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      if (settingsModal) settingsModal.style.display = 'flex';
    });
  }
  const btnCloseSettings = $('#btn-close-settings');
  if (btnCloseSettings) {
    btnCloseSettings.addEventListener('click', () => {
      if (settingsModal) settingsModal.style.display = 'none';
    });
  }
  const btnSaveSettings = $('#btn-save-settings');
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      if (settingsModal) settingsModal.style.display = 'none';
    });
  }
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) settingsModal.style.display = 'none';
    });
  }

  // Themes switcher
  $$('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      applyTheme(card.dataset.themeId, true);
    });
  });

  // Language switcher
  $$('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.langCode);
    });
  });

  // Search
  searchInput.addEventListener('input', () => {
    btnClearSearch.style.display = searchInput.value ? 'block' : 'none';
    renderArticles();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    btnClearSearch.style.display = 'none';
    renderArticles();
    searchInput.focus();
  });

  // Keyboard shortcut Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (e.key === 'Escape' && settingsModal.style.display === 'flex') {
      settingsModal.style.display = 'none';
    }
  });
}

function getArticleLocalized(article) {
  const trans = (article.translations && article.translations[currentLang])
             || (article.translations && article.translations['ru'])
             || {};
  return {
    badge: trans.badge || article.badge || '',
    title: trans.title || article.title || '',
    summary: trans.summary || article.summary || '',
    tags: trans.tags || article.tags || [],
    sections: trans.sections || article.sections || []
  };
}

function renderCategories() {
  let html = '';
  for (const cat of db.categories) {
    const catName = (cat.translations && cat.translations[currentLang]) || cat.name;
    html += `
      <button class="category-pill ${currentCategoryId === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
        ${escapeHtml(catName)}
      </button>
    `;
  }
  categoriesNav.innerHTML = html;

  $$('.category-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategoryId = btn.dataset.catId;
      renderCategories();
      renderArticles();
    });
  });
}

function renderArticles() {
  const rawQuery = searchInput.value.toLowerCase().trim();
  const searchTerms = rawQuery ? rawQuery.split(/\s+/).filter(Boolean) : [];
  let list = [...db.articles];

  // 1. Category filter
  if (currentCategoryId === 'bookmarks') {
    list = list.filter(a => bookmarks.has(a.id));
  } else if (currentCategoryId !== 'all') {
    list = list.filter(a => a.category === currentCategoryId);
  }

  // 2. Interactive Node Domain filter
  if (currentNodeFilter !== 'all') {
    list = list.filter(a => a.nodeTypes && a.nodeTypes.includes(currentNodeFilter));
  }

  // 3. Multi-term Smart Search filter
  if (searchTerms.length > 0) {
    list = list.map(a => {
      const loc = getArticleLocalized(a);
      const titleText = (loc.title + ' ' + (a.title || '')).toLowerCase();
      const summaryText = (loc.summary + ' ' + (a.summary || '')).toLowerCase();
      const tagsText = ((loc.tags || []).join(' ') + ' ' + ((a.tags || []).join(' '))).toLowerCase();
      const contentText = (loc.sections || []).map(s => (s.heading || '') + ' ' + (s.text || '') + ' ' + (s.code || '')).join(' ').toLowerCase();

      let score = 0;
      let allMatch = true;

      for (const term of searchTerms) {
        let termMatched = false;
        if (titleText.includes(term)) { score += 10; termMatched = true; }
        if (tagsText.includes(term)) { score += 6; termMatched = true; }
        if (summaryText.includes(term)) { score += 4; termMatched = true; }
        if (contentText.includes(term)) { score += 2; termMatched = true; }

        if (!termMatched) {
          allMatch = false;
          break;
        }
      }

      return { article: a, score, matched: allMatch };
    })
    .filter(item => item.matched)
    .sort((a, b) => b.score - a.score)
    .map(item => item.article);
  }

  articlesCounter.textContent = list.length;

  if (list.length === 0) {
    let emptyMsg = t('no_results');
    if (currentCategoryId === 'bookmarks' && !rawQuery) {
      emptyMsg = t('no_bookmarks');
    } else if (currentNodeFilter !== 'all' && !rawQuery) {
      emptyMsg = t('node_filter_empty');
    } else if (currentCategoryId !== 'all' && !rawQuery) {
      emptyMsg = t('no_category_articles');
    }

    articlesList.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>${escapeHtml(emptyMsg)}</p>
      </div>
    `;
    return;
  }

  let html = '';
  for (const article of list) {
    const loc = getArticleLocalized(article);
    const isActive = article.id === currentArticleId;
    const isBookmarked = bookmarks.has(article.id);
    const notesCount = (userNotes[article.id] || []).length;
    const nodeTypes = article.nodeTypes || ['Core'];

    html += `
      <div class="article-item ${isActive ? 'active' : ''}" data-article-id="${article.id}">
        <div class="article-item-top">
          <div class="article-item-badges">
            <span class="article-badge">${escapeHtml(loc.badge)}</span>
            ${nodeTypes.map(nt => `<span class="node-chip node-chip-${nt.toLowerCase()}">${nt}</span>`).join('')}
            ${notesCount > 0 ? `<span class="article-notes-badge" title="Заметки">📝 ${notesCount}</span>` : ''}
          </div>
          ${isBookmarked ? '<span class="bookmark-indicator" title="В закладках">★</span>' : ''}
        </div>
        <div class="article-item-title">${highlightQuery(escapeHtml(loc.title), searchTerms)}</div>
        <div class="article-item-preview">${escapeHtml(loc.summary)}</div>
      </div>
    `;
  }
  articlesList.innerHTML = html;

  $$('.article-item').forEach(item => {
    item.addEventListener('click', () => {
      selectArticle(item.dataset.articleId);
    });
  });

  if (currentArticleId && !list.some(a => a.id === currentArticleId) && list.length > 0) {
    selectArticle(list[0].id);
  }
}

function selectArticle(id) {
  currentArticleId = id;
  isNoteFormOpen = false;
  editingNoteId = null;

  $$('.article-item').forEach(item => {
    item.classList.toggle('active', item.dataset.articleId === id);
  });

  const article = db.articles.find(a => a.id === id);
  if (article) {
    renderArticleContent(article);
    contentContainer.scrollTop = 0;
  }
}

// Export GDScript logic (Desktop native save dialog or web blob fallback)
async function exportGdScript(content, defaultFileName = 'script.gd') {
  if (!content || !content.trim()) return;

  if (window.api && window.api.saveFile) {
    try {
      const res = await window.api.saveFile({ defaultFileName, content });
      if (res && res.success) {
        showToast(t('toast_file_saved'));
      }
    } catch (err) {
      console.error('Error saving file:', err);
      showToast(t('toast_file_error'));
    }
  } else {
    // Browser download fallback
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFileName;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('toast_file_saved'));
    } catch (err) {
      console.error('Browser export error:', err);
      showToast(t('toast_file_error'));
    }
  }
}

function renderArticleContent(article) {
  const isBookmarked = bookmarks.has(article.id);
  const loc = getArticleLocalized(article);
  const cat = db.categories.find(c => c.id === article.category);
  const catName = cat ? ((cat.translations && cat.translations[currentLang]) || cat.name) : '';
  const nodeTypes = article.nodeTypes || ['Core'];

  // Check if article has GDScript code
  const codeSections = (loc.sections || []).filter(s => s.code);
  const hasCode = codeSections.length > 0;
  const primaryCode = hasCode ? codeSections.map(s => `# ${s.codeTitle || s.heading}\n${s.code}`).join('\n\n') : '';
  const exportFileName = article.exportFileName || `${article.id}.gd`;

  let html = `
    <div class="article-hero">
      <div class="article-meta-bar">
        <div class="article-tags-wrap">
          <span class="article-badge">${escapeHtml(loc.badge)}</span>
          <span class="tag-chip">${escapeHtml(catName)}</span>
          ${nodeTypes.map(nt => `<span class="node-chip node-chip-${nt.toLowerCase()}">${nt}</span>`).join('')}
          ${loc.tags.map(t => `<span class="tag-chip">#${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="hero-actions-wrap">
          ${hasCode ? `
            <button class="btn-hero-export" id="btn-hero-export" title="${t('export_template')}">
              ${t('export_template')}
            </button>
          ` : ''}
          <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" id="btn-toggle-bookmark">
            ${isBookmarked ? t('bookmark_saved') : t('bookmark_add')}
          </button>
        </div>
      </div>

      <h1 class="article-main-title">${escapeHtml(loc.title)}</h1>
      <div class="article-summary-box">${loc.summary}</div>
    </div>
  `;

  for (const sec of loc.sections) {
    html += `
      <div class="article-section">
        <h2 class="section-heading">${escapeHtml(sec.heading)}</h2>
        <div class="section-text">${sec.text || ""}</div>
    `;

    if (sec.alert) {
      const typeClass = sec.alert.type === 'warning' ? 'callout-warning' : (sec.alert.type === 'important' ? 'callout-important' : 'callout-tip');
      const icon = sec.alert.type === 'warning' ? '⚠️' : (sec.alert.type === 'important' ? '📌' : '💡');
      html += `
        <div class="callout-box ${typeClass}">
          <div class="callout-icon">${icon}</div>
          <div class="callout-text">${sec.alert.text}</div>
        </div>
      `;
    }

    if (sec.table) {
      html += `
        <div class="table-wrapper">
          <table class="content-table">
            <thead>
              <tr>${sec.table.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${sec.table.rows.map(row => `
                <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (sec.code) {
      const rawCode = sec.code;
      const highlighted = highlightGDScript(rawCode);
      const codeId = 'code_' + Math.random().toString(36).substr(2, 9);
      const snippetFileName = (sec.codeTitle && sec.codeTitle.includes('.')) 
        ? sec.codeTitle.replace(/[^a-zA-Z0-9_.-]/g, '') 
        : exportFileName;

      html += `
        <div class="code-wrapper">
          <div class="code-header">
            <div class="code-title">
              <span class="code-lang-badge">GDScript 2.0</span>
              <span>${escapeHtml(sec.codeTitle || '')}</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn-export-gd" data-export-code="${escapeHtml(rawCode)}" data-export-name="${escapeHtml(snippetFileName)}" title="${t('export_gd')}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                ${t('export_gd')}
              </button>
              <button class="btn-copy-code" data-copy-target="${codeId}">
                ${t('copy_code')}
              </button>
            </div>
          </div>
          <div class="code-container">
            <pre id="${codeId}"><code>${highlighted}</code></pre>
          </div>
        </div>
      `;
    }

    html += '</div>';
  }

  // Personal Notes & Snippets Section
  html += renderPersonalNotesHtml(article.id);

  contentContainer.innerHTML = html;

  // Toggle bookmark listener
  $('#btn-toggle-bookmark').addEventListener('click', () => {
    if (bookmarks.has(article.id)) {
      bookmarks.delete(article.id);
      showToast(t('toast_unbookmarked'));
    } else {
      bookmarks.add(article.id);
      showToast(t('toast_bookmarked'));
    }
    localStorage.setItem('godot_bookmarks', JSON.stringify([...bookmarks]));
    renderCategories();
    renderArticles();
    renderArticleContent(article);
  });

  // Hero export button listener
  const btnHeroExport = $('#btn-hero-export');
  if (btnHeroExport) {
    btnHeroExport.addEventListener('click', () => {
      exportGdScript(primaryCode, exportFileName);
    });
  }

  // Individual code block export buttons
  $$('.btn-export-gd').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.exportCode;
      const fileName = btn.dataset.exportName || 'script.gd';
      exportGdScript(code, fileName);
    });
  });

  // Copy code buttons
  $$('.btn-copy-code').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.copyTarget;
      const pre = document.getElementById(targetId);
      if (pre) {
        navigator.clipboard.writeText(pre.innerText).then(() => {
          btn.textContent = t('copied');
          btn.style.color = 'var(--color-success)';
          btn.style.borderColor = 'var(--color-success)';
          showToast(t('toast_copied'));
          setTimeout(() => {
            btn.textContent = t('copy_code');
            btn.style.color = '';
            btn.style.borderColor = '';
          }, 2000);
        });
      }
    });
  });

  // Attach listeners for Personal Notes
  setupPersonalNotesListeners(article.id);
}

// ----------------------------------------------------
// Personal Notes HTML and Handlers
// ----------------------------------------------------
function renderPersonalNotesHtml(articleId) {
  const notes = userNotes[articleId] || [];
  const editingNote = editingNoteId ? notes.find(n => n.id === editingNoteId) : null;

  let formHtml = '';
  if (isNoteFormOpen) {
    formHtml = `
      <div class="note-editor-card" id="note-editor-card">
        <div class="note-editor-title">
          ${editingNote ? t('notes_edit_title') : t('notes_new_title')}
        </div>
        <div class="note-form-group">
          <label class="note-label">${t('notes_lbl_title')}</label>
          <input type="text" id="note-input-title" class="note-input" 
            placeholder="${t('notes_placeholder_title')}" 
            value="${editingNote ? escapeHtml(editingNote.title) : ''}" />
        </div>
        <div class="note-form-group">
          <label class="note-label">${t('notes_lbl_desc')}</label>
          <textarea id="note-input-desc" class="note-textarea" 
            placeholder="${t('notes_placeholder_desc')}">${editingNote ? escapeHtml(editingNote.text) : ''}</textarea>
        </div>
        <div class="note-form-group">
          <label class="note-label">${t('notes_lbl_code')}</label>
          <textarea id="note-input-code" class="note-code-textarea" 
            placeholder="${t('notes_placeholder_code')}">${editingNote ? escapeHtml(editingNote.code || '') : ''}</textarea>
        </div>
        <div class="note-editor-actions">
          <button class="btn-secondary" id="btn-cancel-note">${t('notes_cancel_btn')}</button>
          <button class="btn-primary" id="btn-save-note">${t('notes_save_btn')}</button>
        </div>
      </div>
    `;
  }

  let listHtml = '';
  if (notes.length === 0 && !isNoteFormOpen) {
    listHtml = `
      <div class="user-notes-empty">
        ${escapeHtml(t('notes_empty'))}
      </div>
    `;
  } else {
    listHtml = '<div class="user-notes-list">';
    for (const note of notes) {
      const dateStr = new Date(note.createdAt).toLocaleDateString(
        currentLang === 'en' ? 'en-US' : (currentLang.startsWith('es') ? 'es-ES' : 'ru-RU'),
        { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }
      );

      const hasNoteCode = Boolean(note.code && note.code.trim());
      const noteCodeId = 'user_code_' + note.id;

      listHtml += `
        <div class="user-note-card">
          <div class="user-note-card-header">
            <span class="user-note-card-title">📝 ${escapeHtml(note.title || t('notes_title'))}</span>
            <span class="user-note-card-date">${dateStr}</span>
          </div>
          ${note.text ? `<div class="user-note-card-text">${escapeHtml(note.text)}</div>` : ''}
          ${hasNoteCode ? `
            <div class="code-wrapper" style="margin: 8px 0;">
              <div class="code-header">
                <span class="code-lang-badge">GDScript 2.0</span>
                <div style="display:flex; gap:6px;">
                  <button class="btn-export-gd" data-export-code="${escapeHtml(note.code)}" data-export-name="${escapeHtml((note.title || 'snippet').replace(/[^a-zA-Z0-9_]/g, '_') + '.gd')}" title="${t('export_gd')}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    ${t('export_gd')}
                  </button>
                  <button class="btn-copy-code" data-copy-target="${noteCodeId}">
                    ${t('copy_code')}
                  </button>
                </div>
              </div>
              <div class="code-container">
                <pre id="${noteCodeId}"><code>${highlightGDScript(note.code)}</code></pre>
              </div>
            </div>
          ` : ''}
          <div class="user-note-card-footer">
            <button class="btn-note-action btn-note-edit" data-note-id="${note.id}">${t('notes_edit_btn')}</button>
            <button class="btn-note-action btn-note-delete" data-note-id="${note.id}">${t('notes_delete_btn')}</button>
          </div>
        </div>
      `;
    }
    listHtml += '</div>';
  }

  return `
    <div class="user-notes-section">
      <div class="user-notes-header">
        <div class="user-notes-title-wrap">
          <h2 class="user-notes-title">
            <span>📝</span> ${t('notes_title')}
            <span class="user-notes-count">${notes.length}</span>
          </h2>
        </div>
        ${!isNoteFormOpen ? `
          <button class="btn-add-note" id="btn-open-add-note">
            ${t('notes_add_btn')}
          </button>
        ` : ''}
      </div>
      ${formHtml}
      ${listHtml}
    </div>
  `;
}

function setupPersonalNotesListeners(articleId) {
  const btnOpenAdd = $('#btn-open-add-note');
  if (btnOpenAdd) {
    btnOpenAdd.addEventListener('click', () => {
      isNoteFormOpen = true;
      editingNoteId = null;
      const article = db.articles.find(a => a.id === articleId);
      if (article) renderArticleContent(article);
      const titleInput = $('#note-input-title');
      if (titleInput) titleInput.focus();
    });
  }

  const btnCancel = $('#btn-cancel-note');
  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      isNoteFormOpen = false;
      editingNoteId = null;
      const article = db.articles.find(a => a.id === articleId);
      if (article) renderArticleContent(article);
    });
  }

  const btnSave = $('#btn-save-note');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const title = ($('#note-input-title').value || '').trim();
      const text = ($('#note-input-desc').value || '').trim();
      const code = ($('#note-input-code').value || '').trim();

      if (!title && !text && !code) {
        showToast(t('notes_lbl_title'));
        return;
      }

      if (!userNotes[articleId]) {
        userNotes[articleId] = [];
      }

      if (editingNoteId) {
        const note = userNotes[articleId].find(n => n.id === editingNoteId);
        if (note) {
          note.title = title || 'Без названия';
          note.text = text;
          note.code = code;
          note.updatedAt = Date.now();
        }
      } else {
        userNotes[articleId].unshift({
          id: 'note_' + Date.now(),
          title: title || 'Без названия',
          text,
          code,
          createdAt: Date.now()
        });
      }

      localStorage.setItem('godot_user_notes', JSON.stringify(userNotes));
      isNoteFormOpen = false;
      editingNoteId = null;
      showToast(t('toast_note_saved'));

      renderArticles();
      const article = db.articles.find(a => a.id === articleId);
      if (article) renderArticleContent(article);
    });
  }

  // Edit notes buttons
  $$('.btn-note-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      editingNoteId = btn.dataset.noteId;
      isNoteFormOpen = true;
      const article = db.articles.find(a => a.id === articleId);
      if (article) renderArticleContent(article);
      const titleInput = $('#note-input-title');
      if (titleInput) titleInput.focus();
    });
  });

  // Delete notes buttons
  $$('.btn-note-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm(t('confirm_delete_note'))) {
        const idToDelete = btn.dataset.noteId;
        userNotes[articleId] = (userNotes[articleId] || []).filter(n => n.id !== idToDelete);
        localStorage.setItem('godot_user_notes', JSON.stringify(userNotes));
        showToast(t('toast_note_deleted'));
        renderArticles();
        const article = db.articles.find(a => a.id === articleId);
        if (article) renderArticleContent(article);
      }
    });
  });
}

// ----------------------------------------------------
// GDScript Syntax Highlighting
// ----------------------------------------------------
function highlightGDScript(code) {
  const lines = code.split('\n');
  return lines.map(line => highlightGDScriptLine(line)).join('\n');
}

function highlightGDScriptLine(line) {
  const commentIndex = line.indexOf('#');
  if (commentIndex !== -1) {
    const beforeComment = line.substring(0, commentIndex);
    const commentPart = line.substring(commentIndex);
    return highlightGDScriptCodePart(beforeComment) + '<span class="tok-comment">' + escapeHtml(commentPart) + '</span>';
  }
  return highlightGDScriptCodePart(line);
}

function highlightGDScriptCodePart(str) {
  const tokens = [];
  const stringRegex = /(".*?"|'.*?'|```.*?```)/g;
  let lastIndex = 0;
  let match;

  while ((match = stringRegex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'code', text: str.substring(lastIndex, match.index) });
    }
    tokens.push({ type: 'string', text: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < str.length) {
    tokens.push({ type: 'code', text: str.substring(lastIndex) });
  }

  return tokens.map(token => {
    if (token.type === 'string') {
      return '<span class="tok-string">' + escapeHtml(token.text) + '</span>';
    }
    return highlightTokens(token.text);
  }).join('');
}

function highlightTokens(code) {
  const keywords = new Set([
    'extends', 'class_name', 'var', 'const', 'func', 'signal', 'enum',
    'if', 'elif', 'else', 'for', 'while', 'match', 'return', 'pass',
    'await', 'self', 'super', 'is', 'as', 'in', 'and', 'or', 'not',
    'break', 'continue'
  ]);

  const types = new Set([
    'void', 'bool', 'int', 'float', 'String', 'StringName', 'Node',
    'Node2D', 'Node3D', 'CharacterBody2D', 'CharacterBody3D', 'RigidBody3D',
    'TileMapLayer', 'Vector2', 'Vector2i', 'Vector3', 'Vector3i', 'Color',
    'Array', 'Dictionary', 'Callable', 'Signal', 'Resource', 'RefCounted',
    'Object', 'FileAccess', 'ConfigFile', 'DisplayServer', 'Tween',
    'InputEvent', 'PackedScene', 'Texture2D', 'PhysicsDirectBodyState3D',
    'State', 'StateMachine', 'SaveData', 'ItemData', 'SlotData', 'InventoryData',
    'FastNoiseLite', 'AudioStreamPlayer', 'AudioServer'
  ]);

  const functions = new Set([
    'move_and_slide', 'get_tree', 'create_timer', 'create_tween', 'connect',
    'emit', 'print', 'instantiate', 'load', 'preload', 'push_error',
    'push_warning', 'is_on_floor', 'is_on_wall', 'is_on_ceiling',
    'apply_central_impulse', 'set_cell', 'get_cell_atlas_coords',
    'set_collision_layer_value', 'set_collision_mask_value',
    'get_collision_mask_value', 'move_toward', 'add_child', 'queue_free',
    'free', 'sort_custom', 'set_value', 'get_value', 'save', 'get_axis',
    'is_action_just_pressed', 'tween_property', 'set_ease', 'set_trans',
    'randf_range', 'randf'
  ]);

  return escapeHtml(code).replace(/(@[a-zA-Z0-9_]+|\b[a-zA-Z_][a-zA-Z0-9_]*\b|\b\d+(?:\.\d+)?\b)/g, (match) => {
    if (match.startsWith('@')) return '<span class="tok-annotation">' + match + '</span>';
    if (keywords.has(match)) return '<span class="tok-keyword">' + match + '</span>';
    if (types.has(match)) return '<span class="tok-type">' + match + '</span>';
    if (functions.has(match)) return '<span class="tok-function">' + match + '</span>';
    if (/^\d+(\.\d+)?$/.test(match)) return '<span class="tok-number">' + match + '</span>';
    return match;
  });
}

function highlightQuery(text, terms) {
  if (!terms || terms.length === 0) return text;
  const escaped = terms.map(t => escapeRegex(t)).join('|');
  const regex = new RegExp('(' + escaped + ')', 'gi');
  return text.replace(regex, '<mark class="search-match">$1</mark>');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(msg) {
  toastMessage.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}
