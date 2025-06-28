export type Language = 'auto' | 'en' | 'pt' | 'de' | 'es' | 'ru' | 'ja' | 'zh' | 'fr';

interface Translations {
  [key: string]: {
    [lang in Exclude<Language, 'auto'>]: string;
  };
}

const translations: Translations = {
  // Library page
  myLibrary: {
    en: 'My Library',
    pt: 'Minha Biblioteca',
    de: 'Meine Bibliothek',
    es: 'Mi Biblioteca',
    ru: 'Моя Библиотека',
    ja: '私のライブラリ',
    zh: '我的图书馆',
    fr: 'Ma Bibliothèque'
  },
  books: {
    en: 'books',
    pt: 'livros',
    de: 'Bücher',
    es: 'libros',
    ru: 'книги',
    ja: '本',
    zh: '书籍',
    fr: 'livres'
  },
  book: {
    en: 'book',
    pt: 'livro',
    de: 'Buch',
    es: 'libro',
    ru: 'книга',
    ja: '本',
    zh: '书',
    fr: 'livre'
  },
  addBook: {
    en: 'Add Book',
    pt: 'Adicionar Livro',
    de: 'Buch hinzufügen',
    es: 'Agregar Libro',
    ru: 'Добавить Книгу',
    ja: '本を追加',
    zh: '添加书籍',
    fr: 'Ajouter un Livre'
  },
  searchBooks: {
    en: 'Search books by title or author...',
    pt: 'Pesquisar livros por título ou autor...',
    de: 'Bücher nach Titel oder Autor suchen...',
    es: 'Buscar libros por título o autor...',
    ru: 'Поиск книг по названию или автору...',
    ja: 'タイトルまたは著者で本を検索...',
    zh: '按标题或作者搜索书籍...',
    fr: 'Rechercher des livres par titre ou auteur...'
  },
  noBooksYet: {
    en: 'No books yet',
    pt: 'Ainda não há livros',
    de: 'Noch keine Bücher',
    es: 'Aún no hay libros',
    ru: 'Пока нет книг',
    ja: 'まだ本がありません',
    zh: '还没有书籍',
    fr: 'Pas encore de livres'
  },
  addFirstBook: {
    en: 'Add your first EPUB book to get started reading',
    pt: 'Adicione seu primeiro livro EPUB para começar a ler',
    de: 'Fügen Sie Ihr erstes EPUB-Buch hinzu, um mit dem Lesen zu beginnen',
    es: 'Agrega tu primer libro EPUB para comenzar a leer',
    ru: 'Добавьте свою первую книгу EPUB, чтобы начать чтение',
    ja: '読書を始めるために最初のEPUB本を追加してください',
    zh: '添加您的第一本EPUB书籍开始阅读',
    fr: 'Ajoutez votre premier livre EPUB pour commencer à lire'
  },
  addYourFirstBook: {
    en: 'Add Your First Book',
    pt: 'Adicione Seu Primeiro Livro',
    de: 'Fügen Sie Ihr erstes Buch hinzu',
    es: 'Agrega Tu Primer Libro',
    ru: 'Добавьте Свою Первую Книгу',
    ja: '最初の本を追加',
    zh: '添加您的第一本书',
    fr: 'Ajoutez Votre Premier Livre'
  },
  noBooksFound: {
    en: 'No books found',
    pt: 'Nenhum livro encontrado',
    de: 'Keine Bücher gefunden',
    es: 'No se encontraron libros',
    ru: 'Книги не найдены',
    ja: '本が見つかりません',
    zh: '未找到书籍',
    fr: 'Aucun livre trouvé'
  },
  tryAdjustingSearch: {
    en: 'Try adjusting your search terms',
    pt: 'Tente ajustar seus termos de pesquisa',
    de: 'Versuchen Sie, Ihre Suchbegriffe anzupassen',
    es: 'Intenta ajustar tus términos de búsqueda',
    ru: 'Попробуйте изменить условия поиска',
    ja: '検索条件を調整してみてください',
    zh: '尝试调整您的搜索条件',
    fr: 'Essayez d\'ajuster vos termes de recherche'
  },
  lastRead: {
    en: 'Last read',
    pt: 'Última leitura',
    de: 'Zuletzt gelesen',
    es: 'Última lectura',
    ru: 'Последнее чтение',
    ja: '最後に読んだ',
    zh: '最后阅读',
    fr: 'Dernière lecture'
  },
  delete: {
    en: 'Delete',
    pt: 'Excluir',
    de: 'Löschen',
    es: 'Eliminar',
    ru: 'Удалить',
    ja: '削除',
    zh: '删除',
    fr: 'Supprimer'
  },
  confirmDeleteBook: {
    en: 'Are you sure you want to delete this book? This action cannot be undone.',
    pt: 'Tem certeza de que deseja excluir este livro? Esta ação não pode ser desfeita.',
    de: 'Sind Sie sicher, dass Sie dieses Buch löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    es: '¿Estás seguro de que quieres eliminar este libro? Esta acción no se puede deshacer.',
    ru: 'Вы уверены, что хотите удалить эту книгу? Это действие нельзя отменить.',
    ja: 'この本を削除してもよろしいですか？この操作は元に戻せません。',
    zh: '您确定要删除这本书吗？此操作无法撤消。',
    fr: 'Êtes-vous sûr de vouloir supprimer ce livre ? Cette action ne peut pas être annulée.'
  },
  never: {
    en: 'Never',
    pt: 'Nunca',
    de: 'Nie',
    es: 'Nunca',
    ru: 'Никогда',
    ja: 'なし',
    zh: '从未',
    fr: 'Jamais'
  },
  justNow: {
    en: 'Just now',
    pt: 'Agora mesmo',
    de: 'Gerade eben',
    es: 'Ahora mismo',
    ru: 'Только что',
    ja: 'たった今',
    zh: '刚刚',
    fr: 'À l\'instant'
  },
  hoursAgo: {
    en: 'h ago',
    pt: 'h atrás',
    de: 'h her',
    es: 'h atrás',
    ru: 'ч назад',
    ja: '時間前',
    zh: '小时前',
    fr: 'h il y a'
  },
  daysAgo: {
    en: 'd ago',
    pt: 'd atrás',
    de: 'd her',
    es: 'd atrás',
    ru: 'д назад',
    ja: '日前',
    zh: '天前',
    fr: 'j il y a'
  },
  loadingLibrary: {
    en: 'Loading your library...',
    pt: 'Carregando sua biblioteca...',
    de: 'Lade deine Bibliothek...',
    es: 'Cargando tu biblioteca...',
    ru: 'Загрузка вашей библиотеки...',
    ja: 'ライブラリを読み込んでいます...',
    zh: '正在加载您的图书馆...',
    fr: 'Chargement de votre bibliothèque...'
  },
  complete: {
    en: 'complete',
    pt: 'completo',
    de: 'vollständig',
    es: 'completo',
    ru: 'завершено',
    ja: '完了',
    zh: '完成',
    fr: 'terminé'
  },
  
  // Book uploader
  addNewBook: {
    en: 'Add New Book',
    pt: 'Adicionar Novo Livro',
    de: 'Neues Buch hinzufügen',
    es: 'Agregar Nuevo Libro',
    ru: 'Добавить Новую Книгу',
    ja: '新しい本を追加',
    zh: '添加新书',
    fr: 'Ajouter un Nouveau Livre'
  },
  uploadEpubFile: {
    en: 'Upload an EPUB file to start reading',
    pt: 'Carregue um arquivo EPUB para começar a ler',
    de: 'Laden Sie eine EPUB-Datei hoch, um mit dem Lesen zu beginnen',
    es: 'Sube un archivo EPUB para comenzar a leer',
    ru: 'Загрузите файл EPUB, чтобы начать чтение',
    ja: '読書を始めるためにEPUBファイルをアップロードしてください',
    zh: '上传EPUB文件开始阅读',
    fr: 'Téléchargez un fichier EPUB pour commencer à lire'
  },
  dropEpubHere: {
    en: 'Drop your EPUB file here',
    pt: 'Solte seu arquivo EPUB aqui',
    de: 'Legen Sie Ihre EPUB-Datei hier ab',
    es: 'Suelta tu archivo EPUB aquí',
    ru: 'Перетащите ваш файл EPUB сюда',
    ja: 'EPUBファイルをここにドロップしてください',
    zh: '将您的EPUB文件拖放到这里',
    fr: 'Déposez votre fichier EPUB ici'
  },
  dragAndDropEpub: {
    en: 'Drag and drop your EPUB file',
    pt: 'Arraste e solte seu arquivo EPUB',
    de: 'Ziehen Sie Ihre EPUB-Datei hierher',
    es: 'Arrastra y suelta tu archivo EPUB',
    ru: 'Перетащите ваш файл EPUB',
    ja: 'EPUBファイルをドラッグ&ドロップしてください',
    zh: '拖放您的EPUB文件',
    fr: 'Glissez-déposez votre fichier EPUB'
  },
  or: {
    en: 'or',
    pt: 'ou',
    de: 'oder',
    es: 'o',
    ru: 'или',
    ja: 'または',
    zh: '或',
    fr: 'ou'
  },
  chooseFile: {
    en: 'Choose File',
    pt: 'Escolher Arquivo',
    de: 'Datei auswählen',
    es: 'Elegir Archivo',
    ru: 'Выбрать Файл',
    ja: 'ファイルを選択',
    zh: '选择文件',
    fr: 'Choisir un Fichier'
  },
  processing: {
    en: 'Processing...',
    pt: 'Processando...',
    de: 'Verarbeitung...',
    es: 'Procesando...',
    ru: 'Обработка...',
    ja: '処理中...',
    zh: '处理中...',
    fr: 'Traitement...'
  },
  supportedFormat: {
    en: 'Supported format: EPUB',
    pt: 'Formato suportado: EPUB',
    de: 'Unterstütztes Format: EPUB',
    es: 'Formato compatible: EPUB',
    ru: 'Поддерживаемый формат: EPUB',
    ja: 'サポートされている形式: EPUB',
    zh: '支持的格式: EPUB',
    fr: 'Format pris en charge : EPUB'
  },
  pleaseSelectEpub: {
    en: 'Please select an EPUB file',
    pt: 'Por favor, selecione um arquivo EPUB',
    de: 'Bitte wählen Sie eine EPUB-Datei aus',
    es: 'Por favor selecciona un archivo EPUB',
    ru: 'Пожалуйста, выберите файл EPUB',
    ja: 'EPUBファイルを選択してください',
    zh: '请选择EPUB文件',
    fr: 'Veuillez sélectionner un fichier EPUB'
  },
  failedToProcessEpub: {
    en: 'Failed to process EPUB file. Please ensure it is a valid EPUB format.',
    pt: 'Falha ao processar arquivo EPUB. Certifique-se de que é um formato EPUB válido.',
    de: 'EPUB-Datei konnte nicht verarbeitet werden. Stellen Sie sicher, dass es sich um ein gültiges EPUB-Format handelt.',
    es: 'Error al procesar el archivo EPUB. Asegúrate de que sea un formato EPUB válido.',
    ru: 'Не удалось обработать файл EPUB. Убедитесь, что это действительный формат EPUB.',
    ja: 'EPUBファイルの処理に失敗しました。有効なEPUB形式であることを確認してください。',
    zh: '处理EPUB文件失败。请确保它是有效的EPUB格式。',
    fr: 'Échec du traitement du fichier EPUB. Veuillez vous assurer qu\'il s\'agit d\'un format EPUB valide.'
  },
  pleaseDropEpub: {
    en: 'Please drop an EPUB file',
    pt: 'Por favor, solte um arquivo EPUB',
    de: 'Bitte legen Sie eine EPUB-Datei ab',
    es: 'Por favor suelta un archivo EPUB',
    ru: 'Пожалуйста, перетащите файл EPUB',
    ja: 'EPUBファイルをドロップしてください',
    zh: '请拖放EPUB文件',
    fr: 'Veuillez déposer un fichier EPUB'
  },
  closeUploader: {
    en: 'Close uploader',
    pt: 'Fechar carregador',
    de: 'Uploader schließen',
    es: 'Cerrar cargador',
    ru: 'Закрыть загрузчик',
    ja: 'アップローダーを閉じる',
    zh: '关闭上传器',
    fr: 'Fermer le téléchargeur'
  },
  
  // Reader header
  backToLibrary: {
    en: 'Back to library',
    pt: 'Voltar à biblioteca',
    de: 'Zurück zur Bibliothek',
    es: 'Volver a la biblioteca',
    ru: 'Вернуться в библиотеку',
    ja: 'ライブラリに戻る',
    zh: '返回图书馆',
    fr: 'Retour à la bibliothèque'
  },
  tableOfContents: {
    en: 'Table of contents',
    pt: 'Índice',
    de: 'Inhaltsverzeichnis',
    es: 'Tabla de contenidos',
    ru: 'Содержание',
    ja: '目次',
    zh: '目录',
    fr: 'Table des matières'
  },
  chapter: {
    en: 'Chapter',
    pt: 'Capítulo',
    de: 'Kapitel',
    es: 'Capítulo',
    ru: 'Глава',
    ja: '章',
    zh: '章节',
    fr: 'Chapitre'
  },
  of: {
    en: 'of',
    pt: 'de',
    de: 'von',
    es: 'de',
    ru: 'из',
    ja: 'の',
    zh: '的',
    fr: 'de'
  },
  search: {
    en: 'Search',
    pt: 'Pesquisar',
    de: 'Suchen',
    es: 'Buscar',
    ru: 'Поиск',
    ja: '検索',
    zh: '搜索',
    fr: 'Rechercher'
  },
  bookmarks: {
    en: 'Bookmarks',
    pt: 'Marcadores',
    de: 'Lesezeichen',
    es: 'Marcadores',
    ru: 'Закладки',
    ja: 'ブックマーク',
    zh: '书签',
    fr: 'Signets'
  },
  addToFavorites: {
    en: 'Add to favorites',
    pt: 'Adicionar aos favoritos',
    de: 'Zu Favoriten hinzufügen',
    es: 'Agregar a favoritos',
    ru: 'Добавить в избранное',
    ja: 'お気に入りに追加',
    zh: '添加到收藏夹',
    fr: 'Ajouter aux favoris'
  },
  share: {
    en: 'Share',
    pt: 'Compartilhar',
    de: 'Teilen',
    es: 'Compartir',
    ru: 'Поделиться',
    ja: '共有',
    zh: '分享',
    fr: 'Partager'
  },
  settings: {
    en: 'Settings',
    pt: 'Configurações',
    de: 'Einstellungen',
    es: 'Configuraciones',
    ru: 'Настройки',
    ja: '設定',
    zh: '设置',
    fr: 'Paramètres'
  },
  fullscreen: {
    en: 'Fullscreen',
    pt: 'Tela cheia',
    de: 'Vollbild',
    es: 'Pantalla completa',
    ru: 'Полный экран',
    ja: 'フルスクリーン',
    zh: '全屏',
    fr: 'Plein écran'
  },
  addFavorite: {
    en: 'Add Favorite',
    pt: 'Adicionar Favorito',
    de: 'Favorit hinzufügen',
    es: 'Agregar Favorito',
    ru: 'Добавить в Избранное',
    ja: 'お気に入りを追加',
    zh: '添加收藏',
    fr: 'Ajouter un Favori'
  },
  enterBookmarkName: {
    en: 'Enter bookmark name...',
    pt: 'Digite o nome do marcador...',
    de: 'Lesezeichen-Name eingeben...',
    es: 'Ingresa el nombre del marcador...',
    ru: 'Введите название закладки...',
    ja: 'ブックマーク名を入力...',
    zh: '输入书签名称...',
    fr: 'Entrez le nom du signet...'
  },
  save: {
    en: 'Save',
    pt: 'Salvar',
    de: 'Speichern',
    es: 'Guardar',
    ru: 'Сохранить',
    ja: '保存',
    zh: '保存',
    fr: 'Enregistrer'
  },
  cancel: {
    en: 'Cancel',
    pt: 'Cancelar',
    de: 'Abbrechen',
    es: 'Cancelar',
    ru: 'Отмена',
    ja: 'キャンセル',
    zh: '取消',
    fr: 'Annuler'
  },
  
  // Table of contents
  noChaptersAvailable: {
    en: 'No chapters available',
    pt: 'Nenhum capítulo disponível',
    de: 'Keine Kapitel verfügbar',
    es: 'No hay capítulos disponibles',
    ru: 'Нет доступных глав',
    ja: '利用可能な章がありません',
    zh: '没有可用的章节',
    fr: 'Aucun chapitre disponible'
  },
  currentlyReading: {
    en: 'Currently reading',
    pt: 'Lendo atualmente',
    de: 'Derzeit lesen',
    es: 'Leyendo actualmente',
    ru: 'Сейчас читаю',
    ja: '現在読んでいます',
    zh: '正在阅读',
    fr: 'En cours de lecture'
  },
  chaptersTotal: {
    en: 'chapters',
    pt: 'capítulos',
    de: 'Kapitel',
    es: 'capítulos',
    ru: 'глав',
    ja: '章',
    zh: '章节',
    fr: 'chapitres'
  },
  
  // Settings
  readingSettings: {
    en: 'Reading Settings',
    pt: 'Configurações de Leitura',
    de: 'Lese-Einstellungen',
    es: 'Configuraciones de Lectura',
    ru: 'Настройки Чтения',
    ja: '読書設定',
    zh: '阅读设置',
    fr: 'Paramètres de Lecture'
  },
  language: {
    en: 'Language',
    pt: 'Idioma',
    de: 'Sprache',
    es: 'Idioma',
    ru: 'Язык',
    ja: '言語',
    zh: '语言',
    fr: 'Langue'
  },
  automatic: {
    en: 'Automatic',
    pt: 'Automático',
    de: 'Automatisch',
    es: 'Automático',
    ru: 'Автоматический',
    ja: '自動',
    zh: '自动',
    fr: 'Automatique'
  },
  english: {
    en: 'English',
    pt: 'Inglês',
    de: 'Englisch',
    es: 'Inglés',
    ru: 'Английский',
    ja: '英語',
    zh: '英语',
    fr: 'Anglais'
  },
  portuguese: {
    en: 'Portuguese',
    pt: 'Português',
    de: 'Portugiesisch',
    es: 'Portugués',
    ru: 'Португальский',
    ja: 'ポルトガル語',
    zh: '葡萄牙语',
    fr: 'Portugais'
  },
  german: {
    en: 'German',
    pt: 'Alemão',
    de: 'Deutsch',
    es: 'Alemán',
    ru: 'Немецкий',
    ja: 'ドイツ語',
    zh: '德语',
    fr: 'Allemand'
  },
  spanish: {
    en: 'Spanish',
    pt: 'Espanhol',
    de: 'Spanisch',
    es: 'Español',
    ru: 'Испанский',
    ja: 'スペイン語',
    zh: '西班牙语',
    fr: 'Espagnol'
  },
  russian: {
    en: 'Russian',
    pt: 'Russo',
    de: 'Russisch',
    es: 'Ruso',
    ru: 'Русский',
    ja: 'ロシア語',
    zh: '俄语',
    fr: 'Russe'
  },
  japanese: {
    en: 'Japanese',
    pt: 'Japonês',
    de: 'Japanisch',
    es: 'Japonés',
    ru: 'Японский',
    ja: '日本語',
    zh: '日语',
    fr: 'Japonais'
  },
  chinese: {
    en: 'Chinese',
    pt: 'Chinês',
    de: 'Chinesisch',
    es: 'Chino',
    ru: 'Китайский',
    ja: '中国語',
    zh: '中文',
    fr: 'Chinois'
  },
  french: {
    en: 'French',
    pt: 'Francês',
    de: 'Französisch',
    es: 'Francés',
    ru: 'Французский',
    ja: 'フランス語',
    zh: '法语',
    fr: 'Français'
  },
  closeSettings: {
    en: 'Close settings',
    pt: 'Fechar configurações',
    de: 'Einstellungen schließen',
    es: 'Cerrar configuraciones',
    ru: 'Закрыть настройки',
    ja: '設定を閉じる',
    zh: '关闭设置',
    fr: 'Fermer les paramètres'
  },
  
  // Font preview text
  fontPreviewText: {
    en: 'The quick brown fox jumps over the lazy dog',
    pt: 'A raposa marrom salta sobre o cão preguiçoso',
    de: 'Der schnelle braune Fuchs springt über den faulen Hund',
    es: 'El rápido zorro marrón salta sobre el perro perezoso',
    ru: 'Быстрая коричневая лиса прыгает через ленивую собаку',
    ja: '素早い茶色のキツネが怠惰な犬を飛び越える',
    zh: '敏捷的棕色狐狸跳过懒惰的狗',
    fr: 'Le renard brun rapide saute par-dessus le chien paresseux'
  },
  
  // Reading tab
  reading: {
    en: 'Reading',
    pt: 'Leitura',
    de: 'Lesen',
    es: 'Lectura',
    ru: 'Чтение',
    ja: '読書',
    zh: '阅读',
    fr: 'Lecture'
  },
  interface: {
    en: 'Interface',
    pt: 'Interface',
    de: 'Benutzeroberfläche',
    es: 'Interfaz',
    ru: 'Интерфейс',
    ja: 'インターフェース',
    zh: '界面',
    fr: 'Interface'
  },
  controls: {
    en: 'Controls',
    pt: 'Controles',
    de: 'Steuerung',
    es: 'Controles',
    ru: 'Управление',
    ja: 'コントロール',
    zh: '控制',
    fr: 'Contrôles'
  },
  backup: {
    en: 'Backup',
    pt: 'Backup',
    de: 'Sicherung',
    es: 'Respaldo',
    ru: 'Резервная копия',
    ja: 'バックアップ',
    zh: '备份',
    fr: 'Sauvegarde'
  },
  
  // Typography
  typography: {
    en: 'Typography',
    pt: 'Tipografia',
    de: 'Typografie',
    es: 'Tipografía',
    ru: 'Типография',
    ja: 'タイポグラフィ',
    zh: '排版',
    fr: 'Typographie'
  },
  fontFamily: {
    en: 'Font Family',
    pt: 'Família da Fonte',
    de: 'Schriftfamilie',
    es: 'Familia de Fuente',
    ru: 'Семейство Шрифтов',
    ja: 'フォントファミリー',
    zh: '字体系列',
    fr: 'Famille de Police'
  },
  fontSize: {
    en: 'Font Size',
    pt: 'Tamanho da Fonte',
    de: 'Schriftgröße',
    es: 'Tamaño de Fuente',
    ru: 'Размер Шрифта',
    ja: 'フォントサイズ',
    zh: '字体大小',
    fr: 'Taille de Police'
  },
  lineHeight: {
    en: 'Line Height',
    pt: 'Altura da Linha',
    de: 'Zeilenhöhe',
    es: 'Altura de Línea',
    ru: 'Высота Строки',
    ja: '行の高さ',
    zh: '行高',
    fr: 'Hauteur de Ligne'
  },
  letterSpacing: {
    en: 'Letter Spacing',
    pt: 'Espaçamento de Letras',
    de: 'Buchstabenabstand',
    es: 'Espaciado de Letras',
    ru: 'Межбуквенный интервал',
    ja: '文字間隔',
    zh: '字母间距',
    fr: 'Espacement des Lettres'
  },
  contentWidth: {
    en: 'Content Width',
    pt: 'Largura do Conteúdo',
    de: 'Inhaltsbreite',
    es: 'Ancho del Contenido',
    ru: 'Ширина Содержимого',
    ja: 'コンテンツ幅',
    zh: '内容宽度',
    fr: 'Largeur du Contenu'
  },
  phone: {
    en: 'Phone',
    pt: 'Telefone',
    de: 'Telefon',
    es: 'Teléfono',
    ru: 'Телефон',
    ja: '電話',
    zh: '手机',
    fr: 'Téléphone'
  },
  normal: {
    en: 'Normal',
    pt: 'Normal',
    de: 'Normal',
    es: 'Normal',
    ru: 'Обычный',
    ja: '通常',
    zh: '正常',
    fr: 'Normal'
  },
  full: {
    en: 'Full',
    pt: 'Completo',
    de: 'Vollständig',
    es: 'Completo',
    ru: 'Полный',
    ja: 'フル',
    zh: '完整',
    fr: 'Complet'
  },
  default: {
    en: 'Default',
    pt: 'Padrão',
    de: 'Standard',
    es: 'Predeterminado',
    ru: 'По умолчанию',
    ja: 'デフォルト',
    zh: '默认',
    fr: 'Par défaut'
  },
  
  // Colors
  colors: {
    en: 'Colors',
    pt: 'Cores',
    de: 'Farben',
    es: 'Colores',
    ru: 'Цвета',
    ja: '色',
    zh: '颜色',
    fr: 'Couleurs'
  },
  readingColors: {
    en: 'Reading Colors',
    pt: 'Cores de Leitura',
    de: 'Lesefarben',
    es: 'Colores de Lectura',
    ru: 'Цвета Чтения',
    ja: '読書の色',
    zh: '阅读颜色',
    fr: 'Couleurs de Lecture'
  },
  interfaceColors: {
    en: 'Interface Colors',
    pt: 'Cores da Interface',
    de: 'Oberflächenfarben',
    es: 'Colores de Interfaz',
    ru: 'Цвета Интерфейса',
    ja: 'インターフェースの色',
    zh: '界面颜色',
    fr: 'Couleurs d\'Interface'
  },
  backgroundColor: {
    en: 'Background Color',
    pt: 'Cor de Fundo',
    de: 'Hintergrundfarbe',
    es: 'Color de Fondo',
    ru: 'Цвет Фона',
    ja: '背景色',
    zh: '背景颜色',
    fr: 'Couleur d\'Arrière-plan'
  },
  textColor: {
    en: 'Text Color',
    pt: 'Cor do Texto',
    de: 'Textfarbe',
    es: 'Color del Texto',
    ru: 'Цвет Текста',
    ja: 'テキストの色',
    zh: '文本颜色',
    fr: 'Couleur du Texte'
  },
  resetToDefault: {
    en: 'Reset to Default',
    pt: 'Redefinir para Padrão',
    de: 'Auf Standard zurücksetzen',
    es: 'Restablecer a Predeterminado',
    ru: 'Сбросить к По умолчанию',
    ja: 'デフォルトにリセット',
    zh: '重置为默认',
    fr: 'Remettre par Défaut'
  },
  done: {
    en: 'Done',
    pt: 'Concluído',
    de: 'Fertig',
    es: 'Hecho',
    ru: 'Готово',
    ja: '完了',
    zh: '完成',
    fr: 'Terminé'
  },
  custom: {
    en: 'Custom',
    pt: 'Personalizado',
    de: 'Benutzerdefiniert',
    es: 'Personalizado',
    ru: 'Пользовательский',
    ja: 'カスタム',
    zh: '自定义',
    fr: 'Personnalisé'
  },
  
  // Theme names and descriptions
  light: {
    en: 'Light',
    pt: 'Claro',
    de: 'Hell',
    es: 'Claro',
    ru: 'Светлый',
    ja: 'ライト',
    zh: '浅色',
    fr: 'Clair'
  },
  dark: {
    en: 'Dark',
    pt: 'Escuro',
    de: 'Dunkel',
    es: 'Oscuro',
    ru: 'Тёмный',
    ja: 'ダーク',
    zh: '深色',
    fr: 'Sombre'
  },
  sepia: {
    en: 'Sepia',
    pt: 'Sépia',
    de: 'Sepia',
    es: 'Sepia',
    ru: 'Сепия',
    ja: 'セピア',
    zh: '棕褐色',
    fr: 'Sépia'
  },
  highContrast: {
    en: 'High Contrast',
    pt: 'Alto Contraste',
    de: 'Hoher Kontrast',
    es: 'Alto Contraste',
    ru: 'Высокий Контраст',
    ja: 'ハイコントラスト',
    zh: '高对比度',
    fr: 'Contraste Élevé'
  },
  ocean: {
    en: 'Ocean',
    pt: 'Oceano',
    de: 'Ozean',
    es: 'Océano',
    ru: 'Океан',
    ja: 'オーシャン',
    zh: '海洋',
    fr: 'Océan'
  },
  forest: {
    en: 'Forest',
    pt: 'Floresta',
    de: 'Wald',
    es: 'Bosque',
    ru: 'Лес',
    ja: 'フォレスト',
    zh: '森林',
    fr: 'Forêt'
  },
  sunset: {
    en: 'Sunset',
    pt: 'Pôr do Sol',
    de: 'Sonnenuntergang',
    es: 'Atardecer',
    ru: 'Закат',
    ja: 'サンセット',
    zh: '日落',
    fr: 'Coucher de Soleil'
  },
  lavender: {
    en: 'Lavender',
    pt: 'Lavanda',
    de: 'Lavendel',
    es: 'Lavanda',
    ru: 'Лаванда',
    ja: 'ラベンダー',
    zh: '薰衣草',
    fr: 'Lavande'
  },
  
  // Theme descriptions
  lightDescription: {
    en: 'Classic black text on white background',
    pt: 'Texto preto clássico em fundo branco',
    de: 'Klassischer schwarzer Text auf weißem Hintergrund',
    es: 'Texto negro clásico sobre fondo blanco',
    ru: 'Классический чёрный текст на белом фоне',
    ja: '白い背景に黒いテキストのクラシック',
    zh: '白色背景上的经典黑色文本',
    fr: 'Texte noir classique sur fond blanc'
  },
  darkDescription: {
    en: 'Modern dark theme perfect for low-light reading',
    pt: 'Tema escuro moderno perfeito para leitura em pouca luz',
    de: 'Modernes dunkles Thema perfekt für das Lesen bei schwachem Licht',
    es: 'Tema oscuro moderno perfecto para lectura con poca luz',
    ru: 'Современная тёмная тема идеальна для чтения при слабом освещении',
    ja: '低照度での読書に最適なモダンなダークテーマ',
    zh: '适合低光环境阅读的现代深色主题',
    fr: 'Thème sombre moderne parfait pour la lecture en faible luminosité'
  },
  sepiaDescription: {
    en: 'Warm, paper-like reading experience',
    pt: 'Experiência de leitura quente, semelhante ao papel',
    de: 'Warmes, papierähnliches Leseerlebnis',
    es: 'Experiencia de lectura cálida, similar al papel',
    ru: 'Тёплый, похожий на бумагу опыт чтения',
    ja: '温かみのある紙のような読書体験',
    zh: '温暖的纸质阅读体验',
    fr: 'Expérience de lecture chaleureuse, semblable au papier'
  },
  highContrastDescription: {
    en: 'Maximum contrast for enhanced accessibility',
    pt: 'Contraste máximo para acessibilidade aprimorada',
    de: 'Maximaler Kontrast für verbesserte Zugänglichkeit',
    es: 'Contraste máximo para accesibilidad mejorada',
    ru: 'Максимальный контраст для улучшенной доступности',
    ja: 'アクセシビリティ向上のための最大コントラスト',
    zh: '最大对比度以增强可访问性',
    fr: 'Contraste maximum pour une accessibilité améliorée'
  },
  oceanDescription: {
    en: 'Cool blue tones for reduced eye strain',
    pt: 'Tons azuis frios para reduzir o cansaço visual',
    de: 'Kühle Blautöne zur Reduzierung der Augenbelastung',
    es: 'Tonos azules fríos para reducir la fatiga visual',
    ru: 'Прохладные синие тона для снижения напряжения глаз',
    ja: '目の疲れを軽減するクールなブルートーン',
    zh: '冷蓝色调减少眼部疲劳',
    fr: 'Tons bleus frais pour réduire la fatigue oculaire'
  },
  forestDescription: {
    en: 'Natural green theme for comfortable reading',
    pt: 'Tema verde natural para leitura confortável',
    de: 'Natürliches grünes Thema für komfortables Lesen',
    es: 'Tema verde natural para lectura cómoda',
    ru: 'Естественная зелёная тема для комфортного чтения',
    ja: '快適な読書のための自然な緑のテーマ',
    zh: '舒适阅读的自然绿色主题',
    fr: 'Thème vert naturel pour une lecture confortable'
  },
  sunsetDescription: {
    en: 'Warm orange tones for evening reading',
    pt: 'Tons laranja quentes para leitura noturna',
    de: 'Warme Orangetöne für das Lesen am Abend',
    es: 'Tonos naranjas cálidos para lectura nocturna',
    ru: 'Тёплые оранжевые тона для вечернего чтения',
    ja: '夜の読書のための暖かいオレンジトーン',
    zh: '夜间阅读的温暖橙色调',
    fr: 'Tons orange chauds pour la lecture du soir'
  },
  lavenderDescription: {
    en: 'Soft purple theme for calming reading',
    pt: 'Tema roxo suave para leitura relaxante',
    de: 'Sanftes lila Thema für beruhigendes Lesen',
    es: 'Tema púrpura suave para lectura relajante',
    ru: 'Мягкая фиолетовая тема для успокаивающего чтения',
    ja: 'リラックスした読書のためのソフトパープルテーマ',
    zh: '平静阅读的柔和紫色主题',
    fr: 'Thème violet doux pour une lecture apaisante'
  },
  
  // Theme usage recommendations
  lightUsage: {
    en: 'Ideal for daytime reading and well-lit environments',
    pt: 'Ideal para leitura diurna e ambientes bem iluminados',
    de: 'Ideal für das Lesen am Tag und gut beleuchtete Umgebungen',
    es: 'Ideal para lectura diurna y ambientes bien iluminados',
    ru: 'Идеально для дневного чтения и хорошо освещённых помещений',
    ja: '昼間の読書と明るい環境に最適',
    zh: '适合白天阅读和光线充足的环境',
    fr: 'Idéal pour la lecture de jour et les environnements bien éclairés'
  },
  darkUsage: {
    en: 'Perfect for nighttime reading and dark environments',
    pt: 'Perfeito para leitura noturna e ambientes escuros',
    de: 'Perfekt für das Lesen bei Nacht und in dunklen Umgebungen',
    es: 'Perfecto para lectura nocturna y ambientes oscuros',
    ru: 'Идеально для ночного чтения и тёмных помещений',
    ja: '夜間の読書と暗い環境に最適',
    zh: '适合夜间阅读和黑暗环境',
    fr: 'Parfait pour la lecture nocturne et les environnements sombres'
  },
  sepiaUsage: {
    en: 'Reduces eye strain during extended reading sessions',
    pt: 'Reduz o cansaço visual durante sessões prolongadas de leitura',
    de: 'Reduziert die Augenbelastung bei längeren Lesesitzungen',
    es: 'Reduce la fatiga visual durante sesiones de lectura prolongadas',
    ru: 'Снижает напряжение глаз во время длительного чтения',
    ja: '長時間の読書セッション中の目の疲れを軽減',
    zh: '减少长时间阅读时的眼部疲劳',
    fr: 'Réduit la fatigue oculaire lors de longues sessions de lecture'
  },
  highContrastUsage: {
    en: 'Essential for users with visual impairments or reading difficulties',
    pt: 'Essencial para usuários com deficiências visuais ou dificuldades de leitura',
    de: 'Unerlässlich für Benutzer mit Sehbehinderungen oder Leseschwierigkeiten',
    es: 'Esencial para usuarios con discapacidades visuales o dificultades de lectura',
    ru: 'Необходимо для пользователей с нарушениями зрения или трудностями чтения',
    ja: '視覚障害や読書困難のあるユーザーに不可欠',
    zh: '对于有视觉障碍或阅读困难的用户至关重要',
    fr: 'Essentiel pour les utilisateurs ayant des déficiences visuelles ou des difficultés de lecture'
  },
  oceanUsage: {
    en: 'Calming blue tones help maintain focus during long reading sessions',
    pt: 'Tons azuis calmantes ajudam a manter o foco durante longas sessões de leitura',
    de: 'Beruhigende Blautöne helfen, die Konzentration bei langen Lesesitzungen aufrechtzuerhalten',
    es: 'Los tonos azules calmantes ayudan a mantener el enfoque durante sesiones de lectura largas',
    ru: 'Успокаивающие синие тона помогают поддерживать концентрацию во время длительного чтения',
    ja: '落ち着いたブルートーンが長時間の読書セッション中の集中力を維持するのに役立ちます',
    zh: '平静的蓝色调有助于在长时间阅读时保持专注',
    fr: 'Les tons bleus apaisants aident à maintenir la concentration lors de longues sessions de lecture'
  },
  forestUsage: {
    en: 'Natural green reduces digital eye strain and promotes relaxation',
    pt: 'Verde natural reduz o cansaço visual digital e promove relaxamento',
    de: 'Natürliches Grün reduziert digitale Augenbelastung und fördert Entspannung',
    es: 'El verde natural reduce la fatiga visual digital y promueve la relajación',
    ru: 'Естественный зелёный цвет снижает цифровое напряжение глаз и способствует расслаблению',
    ja: '自然な緑はデジタル眼精疲労を軽減し、リラクゼーションを促進します',
    zh: '自然绿色减少数字眼疲劳并促进放松',
    fr: 'Le vert naturel réduit la fatigue oculaire numérique et favorise la relaxation'
  },
  sunsetUsage: {
    en: 'Warm tones are ideal for evening reading and bedtime stories',
    pt: 'Tons quentes são ideais para leitura noturna e histórias para dormir',
    de: 'Warme Töne sind ideal für das Lesen am Abend und Gute-Nacht-Geschichten',
    es: 'Los tonos cálidos son ideales para lectura nocturna e historias para dormir',
    ru: 'Тёплые тона идеальны для вечернего чтения и сказок на ночь',
    ja: '暖かいトーンは夜の読書と就寝時の物語に最適です',
    zh: '温暖的色调非常适合夜间阅读和睡前故事',
    fr: 'Les tons chauds sont idéaux pour la lecture du soir et les histoires au coucher'
  },
  lavenderUsage: {
    en: 'Soft purple creates a peaceful atmosphere for mindful reading',
    pt: 'Roxo suave cria uma atmosfera pacífica para leitura consciente',
    de: 'Sanftes Lila schafft eine friedliche Atmosphäre für achtsames Lesen',
    es: 'El púrpura suave crea una atmósfera pacífica para lectura consciente',
    ru: 'Мягкий фиолетовый создаёт мирную атмосферу для осознанного чтения',
    ja: 'ソフトパープルはマインドフルな読書のための平和な雰囲気を作り出します',
    zh: '柔和的紫色为专注阅读营造宁静的氛围',
    fr: 'Le violet doux crée une atmosphère paisible pour une lecture consciente'
  },
  
  // Interface controls
  syncInterfaceAndReadingColors: {
    en: 'Sync Interface and Reading Colors',
    pt: 'Sincronizar Cores da Interface e Leitura',
    de: 'Interface- und Lesefarben synchronisieren',
    es: 'Sincronizar Colores de Interfaz y Lectura',
    ru: 'Синхронизировать Цвета Интерфейса и Чтения',
    ja: 'インターフェースと読書の色を同期',
    zh: '同步界面和阅读颜色',
    fr: 'Synchroniser les Couleurs d\'Interface et de Lecture'
  },
  syncDescription: {
    en: 'When enabled: Interface theme automatically matches reading color theme. Changes to either reading or interface colors will sync both themes (default enabled)',
    pt: 'Quando ativado: O tema da interface corresponde automaticamente ao tema de cores de leitura. Mudanças nas cores de leitura ou interface sincronizarão ambos os temas (padrão ativado)',
    de: 'Wenn aktiviert: Das Interface-Thema passt automatisch zum Lesefarbthema. Änderungen an Lese- oder Interface-Farben synchronisieren beide Themen (standardmäßig aktiviert)',
    es: 'Cuando está habilitado: El tema de interfaz coincide automáticamente con el tema de colores de lectura. Los cambios en los colores de lectura o interfaz sincronizarán ambos temas (habilitado por defecto)',
    ru: 'При включении: Тема интерфейса автоматически соответствует цветовой теме чтения. Изменения цветов чтения или интерфейса синхронизируют обе темы (включено по умолчанию)',
    ja: '有効にすると：インターフェーステーマが読書カラーテーマに自動的に一致します。読書またはインターフェースの色の変更により、両方のテーマが同期されます（デフォルトで有効）',
    zh: '启用时：界面主题自动匹配阅读颜色主题。对阅读或界面颜色的更改将同步两个主题（默认启用）',
    fr: 'Lorsqu\'activé : Le thème d\'interface correspond automatiquement au thème de couleurs de lecture. Les modifications des couleurs de lecture ou d\'interface synchroniseront les deux thèmes (activé par défaut)'
  },
  applyFontGlobally: {
    en: 'Apply text font changes globally',
    pt: 'Aplicar mudanças de fonte de texto globalmente',
    de: 'Textschrift-Änderungen global anwenden',
    es: 'Aplicar cambios de fuente de texto globalmente',
    ru: 'Применить изменения шрифта текста глобально',
    ja: 'テキストフォントの変更をグローバルに適用',
    zh: '全局应用文本字体更改',
    fr: 'Appliquer les modifications de police de texte globalement'
  },
  applyFontGloballyDescription: {
    en: 'Changes to text font will affect all interface elements including menus, table of contents, and bookmarks',
    pt: 'Mudanças na fonte do texto afetarão todos os elementos da interface, incluindo menus, índice e marcadores',
    de: 'Änderungen an der Textschrift wirken sich auf alle Interface-Elemente aus, einschließlich Menüs, Inhaltsverzeichnis und Lesezeichen',
    es: 'Los cambios en la fuente del texto afectarán todos los elementos de la interfaz, incluidos menús, tabla de contenidos y marcadores',
    ru: 'Изменения шрифта текста повлияют на все элементы интерфейса, включая меню, содержание и закладки',
    ja: 'テキストフォントの変更は、メニュー、目次、ブックマークを含むすべてのインターフェース要素に影響します',
    zh: '文本字体的更改将影响所有界面元素，包括菜单、目录和书签',
    fr: 'Les modifications de la police de texte affecteront tous les éléments d\'interface, y compris les menus, la table des matières et les signets'
  },
  autoHideMenu: {
    en: 'Auto-hide menu while reading',
    pt: 'Ocultar menu automaticamente durante a leitura',
    de: 'Menü beim Lesen automatisch ausblenden',
    es: 'Ocultar menú automáticamente mientras se lee',
    ru: 'Автоматически скрывать меню при чтении',
    ja: '読書中にメニューを自動的に隠す',
    zh: '阅读时自动隐藏菜单',
    fr: 'Masquer automatiquement le menu pendant la lecture'
  },
  autoHideMenuDescription: {
    en: 'Menu will hide when scrolling down and show when scrolling up',
    pt: 'O menu se ocultará ao rolar para baixo e aparecerá ao rolar para cima',
    de: 'Das Menü wird beim Scrollen nach unten ausgeblendet und beim Scrollen nach oben angezeigt',
    es: 'El menú se ocultará al desplazarse hacia abajo y se mostrará al desplazarse hacia arriba',
    ru: 'Меню будет скрываться при прокрутке вниз и появляться при прокрутке вверх',
    ja: '下にスクロールするとメニューが隠れ、上にスクロールすると表示されます',
    zh: '向下滚动时菜单将隐藏，向上滚动时显示',
    fr: 'Le menu se cachera lors du défilement vers le bas et s\'affichera lors du défilement vers le haut'
  },
  showScrollButtons: {
    en: 'Show scroll buttons',
    pt: 'Mostrar botões de rolagem',
    de: 'Scroll-Buttons anzeigen',
    es: 'Mostrar botones de desplazamiento',
    ru: 'Показать кнопки прокрутки',
    ja: 'スクロールボタンを表示',
    zh: '显示滚动按钮',
    fr: 'Afficher les boutons de défilement'
  },
  showScrollButtonsDescription: {
    en: 'Display floating buttons for quick scrolling',
    pt: 'Exibir botões flutuantes para rolagem rápida',
    de: 'Schwebende Buttons für schnelles Scrollen anzeigen',
    es: 'Mostrar botones flotantes para desplazamiento rápido',
    ru: 'Отображать плавающие кнопки для быстрой прокрутки',
    ja: '素早いスクロールのためのフローティングボタンを表示',
    zh: '显示快速滚动的浮动按钮',
    fr: 'Afficher des boutons flottants pour un défilement rapide'
  },
  buttonSize: {
    en: 'Button Size',
    pt: 'Tamanho do Botão',
    de: 'Button-Größe',
    es: 'Tamaño del Botón',
    ru: 'Размер Кнопки',
    ja: 'ボタンサイズ',
    zh: '按钮大小',
    fr: 'Taille du Bouton'
  },
  small: {
    en: 'Small',
    pt: 'Pequeno',
    de: 'Klein',
    es: 'Pequeño',
    ru: 'Маленький',
    ja: '小',
    zh: '小',
    fr: 'Petit'
  },
  medium: {
    en: 'Medium',
    pt: 'Médio',
    de: 'Mittel',
    es: 'Mediano',
    ru: 'Средний',
    ja: '中',
    zh: '中',
    fr: 'Moyen'
  },
  large: {
    en: 'Large',
    pt: 'Grande',
    de: 'Groß',
    es: 'Grande',
    ru: 'Большой',
    ja: '大',
    zh: '大',
    fr: 'Grand'
  },
  customSize: {
    en: 'Custom Size',
    pt: 'Tamanho Personalizado',
    de: 'Benutzerdefinierte Größe',
    es: 'Tamaño Personalizado',
    ru: 'Пользовательский Размер',
    ja: 'カスタムサイズ',
    zh: '自定义大小',
    fr: 'Taille Personnalisée'
  },
  checked: {
    en: 'Checked',
    pt: 'Marcado',
    de: 'Aktiviert',
    es: 'Marcado',
    ru: 'Отмечено',
    ja: 'チェック済み',
    zh: '已选中',
    fr: 'Coché'
  },
  unchecked: {
    en: 'Unchecked',
    pt: 'Desmarcado',
    de: 'Deaktiviert',
    es: 'Desmarcado',
    ru: 'Не отмечено',
    ja: 'チェックなし',
    zh: '未选中',
    fr: 'Décoché'
  },
  readingExperience: {
    en: 'Reading Experience',
    pt: 'Experiência de Leitura',
    de: 'Leseerfahrung',
    es: 'Experiencia de Lectura',
    ru: 'Опыт Чтения',
    ja: '読書体験',
    zh: '阅读体验',
    fr: 'Expérience de Lecture'
  },
  textToSpeechSupport: {
    en: 'Text-to-speech support',
    pt: 'Suporte a texto para fala',
    de: 'Text-zu-Sprache-Unterstützung',
    es: 'Soporte de texto a voz',
    ru: 'Поддержка преобразования текста в речь',
    ja: 'テキスト読み上げサポート',
    zh: '文本转语音支持',
    fr: 'Support de synthèse vocale'
  },
  experimental: {
    en: 'Experimental',
    pt: 'Experimental',
    de: 'Experimentell',
    es: 'Experimental',
    ru: 'Экспериментальный',
    ja: '実験的',
    zh: '实验性',
    fr: 'Expérimental'
  },
  textToSpeechDescription: {
    en: 'Enable audio narration of book content. An icon will appear near the Table of Contents when enabled.',
    pt: 'Ativar narração em áudio do conteúdo do livro. Um ícone aparecerá próximo ao Índice quando ativado.',
    de: 'Audio-Erzählung des Buchinhalts aktivieren. Ein Symbol erscheint in der Nähe des Inhaltsverzeichnisses, wenn aktiviert.',
    es: 'Habilitar narración de audio del contenido del libro. Aparecerá un icono cerca de la Tabla de Contenidos cuando esté habilitado.',
    ru: 'Включить аудио-повествование содержимого книги. Значок появится рядом с Содержанием при включении.',
    ja: '本のコンテンツの音声ナレーションを有効にします。有効にすると目次の近くにアイコンが表示されます。',
    zh: '启用书籍内容的音频叙述。启用时，目录附近将出现一个图标。',
    fr: 'Activer la narration audio du contenu du livre. Une icône apparaîtra près de la Table des Matières lorsqu\'activée.'
  },
  fastFavorite: {
    en: 'Fast Favorite',
    pt: 'Favorito Rápido',
    de: 'Schnell-Favorit',
    es: 'Favorito Rápido',
    ru: 'Быстрое Избранное',
    ja: 'クイックお気に入り',
    zh: '快速收藏',
    fr: 'Favori Rapide'
  },
  fastFavoriteDescription: {
    en: 'Quickly save bookmarks without entering a name',
    pt: 'Salvar marcadores rapidamente sem inserir um nome',
    de: 'Lesezeichen schnell speichern ohne Namen eingeben',
    es: 'Guardar marcadores rápidamente sin ingresar un nombre',
    ru: 'Быстро сохранять закладки без ввода имени',
    ja: '名前を入力せずにブックマークを素早く保存',
    zh: '无需输入名称即可快速保存书签',
    fr: 'Enregistrer rapidement des signets sans saisir de nom'
  },
  defaultBookmarkName: {
    en: 'Default bookmark name',
    pt: 'Nome padrão do marcador',
    de: 'Standard-Lesezeichen-Name',
    es: 'Nombre predeterminado del marcador',
    ru: 'Имя закладки по умолчанию',
    ja: 'デフォルトブックマーク名',
    zh: '默认书签名称',
    fr: 'Nom de signet par défaut'
  },
  
  // Backup section
  backupAndReset: {
    en: 'Backup & Reset',
    pt: 'Backup e Redefinição',
    de: 'Sicherung & Zurücksetzen',
    es: 'Respaldo y Reinicio',
    ru: 'Резервная копия и Сброс',
    ja: 'バックアップとリセット',
    zh: '备份和重置',
    fr: 'Sauvegarde et Réinitialisation'
  },
  exportSettings: {
    en: 'Export Settings',
    pt: 'Exportar Configurações',
    de: 'Einstellungen exportieren',
    es: 'Exportar Configuraciones',
    ru: 'Экспорт Настроек',
    ja: '設定をエクスポート',
    zh: '导出设置',
    fr: 'Exporter les Paramètres'
  },
  exportDescription: {
    en: 'Download your preferences, bookmarks, and reading progress',
    pt: 'Baixar suas preferências, marcadores e progresso de leitura',
    de: 'Laden Sie Ihre Einstellungen, Lesezeichen und Lesefortschritt herunter',
    es: 'Descargar tus preferencias, marcadores y progreso de lectura',
    ru: 'Скачать ваши предпочтения, закладки и прогресс чтения',
    ja: '設定、ブックマーク、読書進捗をダウンロード',
    zh: '下载您的偏好设置、书签和阅读进度',
    fr: 'Télécharger vos préférences, signets et progression de lecture'
  },
  exporting: {
    en: 'Exporting...',
    pt: 'Exportando...',
    de: 'Exportiere...',
    es: 'Exportando...',
    ru: 'Экспорт...',
    ja: 'エクスポート中...',
    zh: '导出中...',
    fr: 'Exportation...'
  },
  exportData: {
    en: 'Export Data',
    pt: 'Exportar Dados',
    de: 'Daten exportieren',
    es: 'Exportar Datos',
    ru: 'Экспорт Данных',
    ja: 'データをエクスポート',
    zh: '导出数据',
    fr: 'Exporter les Données'
  },
  importSettings: {
    en: 'Import Settings',
    pt: 'Importar Configurações',
    de: 'Einstellungen importieren',
    es: 'Importar Configuraciones',
    ru: 'Импорт Настроек',
    ja: '設定をインポート',
    zh: '导入设置',
    fr: 'Importer les Paramètres'
  },
  importDescription: {
    en: 'Restore your settings from a backup file',
    pt: 'Restaurar suas configurações de um arquivo de backup',
    de: 'Stellen Sie Ihre Einstellungen aus einer Backup-Datei wieder her',
    es: 'Restaurar tus configuraciones desde un archivo de respaldo',
    ru: 'Восстановить ваши настройки из файла резервной копии',
    ja: 'バックアップファイルから設定を復元',
    zh: '从备份文件恢复您的设置',
    fr: 'Restaurer vos paramètres à partir d\'un fichier de sauvegarde'
  },
  importing: {
    en: 'Importing...',
    pt: 'Importando...',
    de: 'Importiere...',
    es: 'Importando...',
    ru: 'Импорт...',
    ja: 'インポート中...',
    zh: '导入中...',
    fr: 'Importation...'
  },
  importData: {
    en: 'Import Data',
    pt: 'Importar Dados',
    de: 'Daten importieren',
    es: 'Importar Datos',
    ru: 'Импорт Данных',
    ja: 'データをインポート',
    zh: '导入数据',
    fr: 'Importer les Données'
  },
  resetDescription: {
    en: 'Reset all settings to their default values. This cannot be undone.',
    pt: 'Redefinir todas as configurações para seus valores padrão. Isso não pode ser desfeito.',
    de: 'Alle Einstellungen auf ihre Standardwerte zurücksetzen. Dies kann nicht rückgängig gemacht werden.',
    es: 'Restablecer todas las configuraciones a sus valores predeterminados. Esto no se puede deshacer.',
    ru: 'Сбросить все настройки к значениям по умолчанию. Это нельзя отменить.',
    ja: 'すべての設定をデフォルト値にリセットします。これは元に戻せません。',
    zh: '将所有设置重置为默认值。此操作无法撤消。',
    fr: 'Réinitialiser tous les paramètres à leurs valeurs par défaut. Ceci ne peut pas être annulé.'
  },
  important: {
    en: 'Important',
    pt: 'Importante',
    de: 'Wichtig',
    es: 'Importante',
    ru: 'Важно',
    ja: '重要',
    zh: '重要',
    fr: 'Important'
  },
  backupWarning: {
    en: 'Backup files contain your reading preferences, bookmarks, and progress data. Keep them safe and ensure they\'re from trusted sources before importing. Importing will overwrite your current settings. Your books and files are not included in backups for security and privacy reasons.',
    pt: 'Arquivos de backup contêm suas preferências de leitura, marcadores e dados de progresso. Mantenha-os seguros e certifique-se de que sejam de fontes confiáveis antes de importar. A importação substituirá suas configurações atuais. Seus livros e arquivos não estão incluídos nos backups por razões de segurança e privacidade.',
    de: 'Backup-Dateien enthalten Ihre Leseeinstellungen, Lesezeichen und Fortschrittsdaten. Bewahren Sie sie sicher auf und stellen Sie sicher, dass sie aus vertrauenswürdigen Quellen stammen, bevor Sie sie importieren. Das Importieren überschreibt Ihre aktuellen Einstellungen. Ihre Bücher und Dateien sind aus Sicherheits- und Datenschutzgründen nicht in Backups enthalten.',
    es: 'Los archivos de respaldo contienen tus preferencias de lectura, marcadores y datos de progreso. Manténlos seguros y asegúrate de que sean de fuentes confiables antes de importar. La importación sobrescribirá tus configuraciones actuales. Tus libros y archivos no están incluidos en los respaldos por razones de seguridad y privacidad.',
    ru: 'Файлы резервных копий содержат ваши предпочтения чтения, закладки и данные о прогрессе. Храните их в безопасности и убедитесь, что они из надёжных источников перед импортом. Импорт перезапишет ваши текущие настройки. Ваши книги и файлы не включены в резервные копии по соображениям безопасности и конфиденциальности.',
    ja: 'バックアップファイルには、読書設定、ブックマーク、進捗データが含まれています。安全に保管し、インポートする前に信頼できるソースからのものであることを確認してください。インポートすると現在の設定が上書きされます。セキュリティとプライバシーの理由により、書籍とファイルはバックアップに含まれていません。',
    zh: '备份文件包含您的阅读偏好设置、书签和进度数据。请妥善保管，并确保在导入前它们来自可信来源。导入将覆盖您当前的设置。出于安全和隐私考虑，您的书籍和文件不包含在备份中。',
    fr: 'Les fichiers de sauvegarde contiennent vos préférences de lecture, signets et données de progression. Gardez-les en sécurité et assurez-vous qu\'ils proviennent de sources fiables avant l\'importation. L\'importation écrasera vos paramètres actuels. Vos livres et fichiers ne sont pas inclus dans les sauvegardes pour des raisons de sécurité et de confidentialité.'
  },
  confirmResetSettings: {
    en: 'Are you sure you want to reset all settings to default? This action cannot be undone.',
    pt: 'Tem certeza de que deseja redefinir todas as configurações para o padrão? Esta ação não pode ser desfeita.',
    de: 'Sind Sie sicher, dass Sie alle Einstellungen auf Standard zurücksetzen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    es: '¿Estás seguro de que quieres restablecer todas las configuraciones a los valores predeterminados? Esta acción no se puede deshacer.',
    ru: 'Вы уверены, что хотите сбросить все настройки к значениям по умолчанию? Это действие нельзя отменить.',
    ja: 'すべての設定をデフォルトにリセットしてもよろしいですか？この操作は元に戻せません。',
    zh: '您确定要将所有设置重置为默认值吗？此操作无法撤消。',
    fr: 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres par défaut ? Cette action ne peut pas être annulée.'
  },
  failedToResetSettings: {
    en: 'Failed to reset settings. Please try again.',
    pt: 'Falha ao redefinir configurações. Tente novamente.',
    de: 'Einstellungen konnten nicht zurückgesetzt werden. Bitte versuchen Sie es erneut.',
    es: 'Error al restablecer configuraciones. Inténtalo de nuevo.',
    ru: 'Не удалось сбросить настройки. Попробуйте снова.',
    ja: '設定のリセットに失敗しました。もう一度お試しください。',
    zh: '重置设置失败。请重试。',
    fr: 'Échec de la réinitialisation des paramètres. Veuillez réessayer.'
  },
  exportFailed: {
    en: 'Export failed. Please try again.',
    pt: 'Falha na exportação. Tente novamente.',
    de: 'Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
    es: 'Error en la exportación. Inténtalo de nuevo.',
    ru: 'Экспорт не удался. Попробуйте снова.',
    ja: 'エクスポートに失敗しました。もう一度お試しください。',
    zh: '导出失败。请重试。',
    fr: 'Échec de l\'exportation. Veuillez réessayer.'
  },
  importSuccess: {
    en: 'Settings imported successfully! The page will reload to apply changes.',
    pt: 'Configurações importadas com sucesso! A página será recarregada para aplicar as mudanças.',
    de: 'Einstellungen erfolgreich importiert! Die Seite wird neu geladen, um die Änderungen anzuwenden.',
    es: '¡Configuraciones importadas exitosamente! La página se recargará para aplicar los cambios.',
    ru: 'Настройки успешно импортированы! Страница перезагрузится для применения изменений.',
    ja: '設定が正常にインポートされました！変更を適用するためにページが再読み込みされます。',
    zh: '设置导入成功！页面将重新加载以应用更改。',
    fr: 'Paramètres importés avec succès ! La page va se recharger pour appliquer les modifications.'
  },
  importFailed: {
    en: 'Import failed. Please check the file format and try again.',
    pt: 'Falha na importação. Verifique o formato do arquivo e tente novamente.',
    de: 'Import fehlgeschlagen. Bitte überprüfen Sie das Dateiformat und versuchen Sie es erneut.',
    es: 'Error en la importación. Verifica el formato del archivo e inténtalo de nuevo.',
    ru: 'Импорт не удался. Проверьте формат файла и попробуйте снова.',
    ja: 'インポートに失敗しました。ファイル形式を確認してもう一度お試しください。',
    zh: '导入失败。请检查文件格式并重试。',
    fr: 'Échec de l\'importation. Veuillez vérifier le format du fichier et réessayer.'
  }
};

// Get browser language
const getBrowserLanguage = (): Exclude<Language, 'auto'> => {
  const lang = navigator.language.toLowerCase();
  
  if (lang.startsWith('pt')) return 'pt';
  if (lang.startsWith('de')) return 'de';
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('ru')) return 'ru';
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('zh')) return 'zh';
  if (lang.startsWith('fr')) return 'fr';
  
  return 'en'; // Default to English
};

// Current language state
let currentLanguage: Language = 'auto';

// Set language
export const setLanguage = (language: Language) => {
  currentLanguage = language;
  // Save to localStorage
  localStorage.setItem('ebook-reader-language', language);
};

// Get current language
export const getCurrentLanguage = (): Language => {
  if (currentLanguage === 'auto') {
    // Check localStorage first
    const saved = localStorage.getItem('ebook-reader-language') as Language;
    if (saved && saved !== 'auto') {
      currentLanguage = saved;
      return saved;
    }
    return 'auto';
  }
  return currentLanguage;
};

// Get effective language (resolves 'auto' to actual language)
export const getEffectiveLanguage = (): Exclude<Language, 'auto'> => {
  const current = getCurrentLanguage();
  if (current === 'auto') {
    return getBrowserLanguage();
  }
  return current;
};

// Initialize language from localStorage
export const initializeLanguage = () => {
  const saved = localStorage.getItem('ebook-reader-language') as Language;
  if (saved) {
    currentLanguage = saved;
  }
};

// Get translation
export const getTranslation = (key: string): string => {
  const effectiveLang = getEffectiveLanguage();
  const translation = translations[key];
  
  if (!translation) {
    console.warn(`Translation key "${key}" not found`);
    return key;
  }
  
  return translation[effectiveLang] || translation.en || key;
};

// Get all available languages
export const getAvailableLanguages = (): Array<{ code: Language; name: string }> => {
  return [
    { code: 'auto', name: getTranslation('automatic') },
    { code: 'en', name: getTranslation('english') },
    { code: 'pt', name: getTranslation('portuguese') },
    { code: 'de', name: getTranslation('german') },
    { code: 'es', name: getTranslation('spanish') },
    { code: 'ru', name: getTranslation('russian') },
    { code: 'ja', name: getTranslation('japanese') },
    { code: 'zh', name: getTranslation('chinese') },
    { code: 'fr', name: getTranslation('french') }
  ];
};