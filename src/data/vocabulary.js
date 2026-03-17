// Azerbaijani vocabulary — progressive structure (level 1→4 per topic)
// level 1: basic single words
// level 2: extended vocabulary, adjectives
// level 3: short phrases (2-3 words)
// level 4: complex sentences with previously learned words

export const WORDS = [

  // ═══════════════ GREETINGS ═══════════════
  // Level 1 — basic words
  { az: 'Salam', ru: 'Привет', transcription: '[са-лам]', topic: 'greetings', level: 1 },
  { az: 'Xeyr', ru: 'Нет', transcription: '[хейр]', topic: 'greetings', level: 1 },
  { az: 'Bəli', ru: 'Да', transcription: '[бэ-ли]', topic: 'greetings', level: 1 },
  { az: 'Yox', ru: 'Нет (разг.)', transcription: '[йох]', topic: 'greetings', level: 1 },
  { az: 'Hə', ru: 'Да (разг.)', transcription: '[hэ]', topic: 'greetings', level: 1 },
  { az: 'Yaxşı', ru: 'Хорошо', transcription: '[яхшы]', topic: 'greetings', level: 1 },
  { az: 'Pis', ru: 'Плохо', transcription: '[пис]', topic: 'greetings', level: 1 },

  // Level 2 — polite expressions
  { az: 'Sağ ol', ru: 'Спасибо', transcription: '[сах ол]', topic: 'greetings', level: 2 },
  { az: 'Çox sağ ol', ru: 'Большое спасибо', transcription: '[чох сах ол]', topic: 'greetings', level: 2 },
  { az: 'Xahiş edirəm', ru: 'Пожалуйста', transcription: '[хаhиш эдирэм]', topic: 'greetings', level: 2 },
  { az: 'Bağışlayın', ru: 'Извините', transcription: '[баашлайын]', topic: 'greetings', level: 2 },
  { az: 'Əfv edin', ru: 'Простите', transcription: '[эфв эдин]', topic: 'greetings', level: 2 },
  { az: 'Zəhmət olmasa', ru: 'Будьте добры', transcription: '[зэhмэт олмаса]', topic: 'greetings', level: 2 },
  { az: 'Sabahınız xeyir', ru: 'Доброе утро', transcription: '[сабаhыныз хейр]', topic: 'greetings', level: 2 },
  { az: 'Axşamınız xeyir', ru: 'Добрый вечер', transcription: '[ахшамыныз хейр]', topic: 'greetings', level: 2 },

  // Level 3 — short phrases
  { az: 'Necəsən?', ru: 'Как дела?', transcription: '[нэджэсэн]', topic: 'greetings', level: 3 },
  { az: 'Yaxşıyam', ru: 'У меня всё хорошо', transcription: '[яхшыям]', topic: 'greetings', level: 3 },
  { az: 'Adın nədir?', ru: 'Как тебя зовут?', transcription: '[адын нэдир]', topic: 'greetings', level: 3 },
  { az: 'Mənim adım...', ru: 'Меня зовут...', transcription: '[мэним адым]', topic: 'greetings', level: 3 },
  { az: 'Görüşənədək', ru: 'До свидания', transcription: '[гёрюшэнэдэк]', topic: 'greetings', level: 3 },
  { az: 'Sabah görüşərük', ru: 'До завтра', transcription: '[сабах гёрюшэрюк]', topic: 'greetings', level: 3 },
  { az: 'Haralısınız?', ru: 'Откуда вы?', transcription: '[харалысыныз]', topic: 'greetings', level: 3 },

  // Level 4 — complex phrases
  { az: 'Tanış olmağa şadam', ru: 'Рад познакомиться', transcription: '[таныш олмаа шадам]', topic: 'greetings', level: 4 },
  { az: 'Siz necəsiniz?', ru: 'Как вы поживаете?', transcription: '[сиз нэджэсиниз]', topic: 'greetings', level: 4 },
  { az: 'Çox yaxşı sağ ol', ru: 'Очень хорошо спасибо', transcription: '[чох яхшы сах ол]', topic: 'greetings', level: 4 },
  { az: 'Mən Azərbaycandan gəlirəm', ru: 'Я из Азербайджана', transcription: '[мэн азэрбайджандан гэлирэм]', topic: 'greetings', level: 4 },

  // ═══════════════ NUMBERS & COLORS ═══════════════
  // Level 1 — 1-5
  { az: 'bir', ru: 'один', transcription: '[бир]', topic: 'numbers', level: 1 },
  { az: 'iki', ru: 'два', transcription: '[ики]', topic: 'numbers', level: 1 },
  { az: 'üç', ru: 'три', transcription: '[юч]', topic: 'numbers', level: 1 },
  { az: 'dörd', ru: 'четыре', transcription: '[дёрд]', topic: 'numbers', level: 1 },
  { az: 'beş', ru: 'пять', transcription: '[бэш]', topic: 'numbers', level: 1 },
  { az: 'sıfır', ru: 'ноль', transcription: '[сыфыр]', topic: 'numbers', level: 1 },

  // Level 2 — 6-10 + basic colors
  { az: 'altı', ru: 'шесть', transcription: '[алты]', topic: 'numbers', level: 2 },
  { az: 'yeddi', ru: 'семь', transcription: '[едди]', topic: 'numbers', level: 2 },
  { az: 'səkkiz', ru: 'восемь', transcription: '[сэккиз]', topic: 'numbers', level: 2 },
  { az: 'doqquz', ru: 'девять', transcription: '[доггуз]', topic: 'numbers', level: 2 },
  { az: 'on', ru: 'десять', transcription: '[он]', topic: 'numbers', level: 2 },
  { az: 'qırmızı', ru: 'красный', transcription: '[кырмызы]', topic: 'numbers', level: 2 },
  { az: 'mavi', ru: 'синий', transcription: '[мави]', topic: 'numbers', level: 2 },
  { az: 'yaşıl', ru: 'зелёный', transcription: '[яшыл]', topic: 'numbers', level: 2 },
  { az: 'sarı', ru: 'жёлтый', transcription: '[сары]', topic: 'numbers', level: 2 },
  { az: 'ağ', ru: 'белый', transcription: '[аа]', topic: 'numbers', level: 2 },
  { az: 'qara', ru: 'чёрный', transcription: '[кара]', topic: 'numbers', level: 2 },

  // Level 3 — bigger numbers + more colors
  { az: 'iyirmi', ru: 'двадцать', transcription: '[ийирми]', topic: 'numbers', level: 3 },
  { az: 'otuz', ru: 'тридцать', transcription: '[отуз]', topic: 'numbers', level: 3 },
  { az: 'qırx', ru: 'сорок', transcription: '[кырх]', topic: 'numbers', level: 3 },
  { az: 'əlli', ru: 'пятьдесят', transcription: '[элли]', topic: 'numbers', level: 3 },
  { az: 'yüz', ru: 'сто', transcription: '[юз]', topic: 'numbers', level: 3 },
  { az: 'narıncı', ru: 'оранжевый', transcription: '[нарынджы]', topic: 'numbers', level: 3 },
  { az: 'bənövşəyi', ru: 'фиолетовый', transcription: '[бэновшэи]', topic: 'numbers', level: 3 },
  { az: 'çəhrayı', ru: 'розовый', transcription: '[чэhрайы]', topic: 'numbers', level: 3 },
  { az: 'Neçə?', ru: 'Сколько?', transcription: '[нэчэ]', topic: 'numbers', level: 3 },
  { az: 'çox', ru: 'много', transcription: '[чох]', topic: 'numbers', level: 3 },

  // Level 4 — sentences with numbers and colors
  { az: 'Neçə yaşın var?', ru: 'Сколько тебе лет?', transcription: '[нэчэ яшын вар]', topic: 'numbers', level: 4 },
  { az: 'Mənə iki lazımdır', ru: 'Мне нужно два', transcription: '[мэнэ ики лазымдыр]', topic: 'numbers', level: 4 },
  { az: 'On beş yaşım var', ru: 'Мне пятнадцать лет', transcription: '[он бэш яшым вар]', topic: 'numbers', level: 4 },
  { az: 'Qırmızı çox gözəldir', ru: 'Красный очень красивый', transcription: '[кырмызы чох гёзэлдир]', topic: 'numbers', level: 4 },
  { az: 'Mənə beş ədəd lazımdır', ru: 'Мне нужно пять штук', transcription: '[мэнэ бэш эдэд лазымдыр]', topic: 'numbers', level: 4 },

  // ═══════════════ FOOD & DRINKS ═══════════════
  // Level 1 — basic foods
  { az: 'çay', ru: 'чай', transcription: '[чай]', topic: 'food', level: 1 },
  { az: 'su', ru: 'вода', transcription: '[су]', topic: 'food', level: 1 },
  { az: 'çörək', ru: 'хлеб', transcription: '[чёрэк]', topic: 'food', level: 1 },
  { az: 'alma', ru: 'яблоко', transcription: '[алма]', topic: 'food', level: 1 },
  { az: 'nar', ru: 'гранат', transcription: '[нар]', topic: 'food', level: 1 },
  { az: 'şəkər', ru: 'сахар', transcription: '[шэкэр]', topic: 'food', level: 1 },
  { az: 'duz', ru: 'соль', transcription: '[дуз]', topic: 'food', level: 1 },

  // Level 2 — more foods and drinks
  { az: 'pomidor', ru: 'помидор', transcription: '[помидор]', topic: 'food', level: 2 },
  { az: 'badımcan', ru: 'баклажан', transcription: '[бадымджан]', topic: 'food', level: 2 },
  { az: 'şəftali', ru: 'персик', transcription: '[шэфтали]', topic: 'food', level: 2 },
  { az: 'üzüm', ru: 'виноград', transcription: '[юзюм]', topic: 'food', level: 2 },
  { az: 'limon', ru: 'лимон', transcription: '[лимон]', topic: 'food', level: 2 },
  { az: 'kartof', ru: 'картофель', transcription: '[картоф]', topic: 'food', level: 2 },
  { az: 'yumurta', ru: 'яйцо', transcription: '[юмурта]', topic: 'food', level: 2 },
  { az: 'pendir', ru: 'сыр', transcription: '[пэндир]', topic: 'food', level: 2 },
  { az: 'ət', ru: 'мясо', transcription: '[эт]', topic: 'food', level: 2 },
  { az: 'balıq', ru: 'рыба', transcription: '[балых]', topic: 'food', level: 2 },
  { az: 'süd', ru: 'молоко', transcription: '[сюд]', topic: 'food', level: 2 },
  { az: 'yağ', ru: 'масло', transcription: '[яа]', topic: 'food', level: 2 },

  // Level 3 — taste words + café phrases
  { az: 'ləzzətli', ru: 'вкусный', transcription: '[лэззэтли]', topic: 'food', level: 3 },
  { az: 'acı', ru: 'острый', transcription: '[аджы]', topic: 'food', level: 3 },
  { az: 'şirin', ru: 'сладкий', transcription: '[ширин]', topic: 'food', level: 3 },
  { az: 'turş', ru: 'кислый', transcription: '[турш]', topic: 'food', level: 3 },
  { az: 'doydum', ru: 'я наелся', transcription: '[дойдум]', topic: 'food', level: 3 },
  { az: 'acıyıram', ru: 'я голоден', transcription: '[аджыырам]', topic: 'food', level: 3 },
  { az: 'istəyirəm', ru: 'я хочу', transcription: '[истэйирэм]', topic: 'food', level: 3 },
  { az: 'Hesab gətirin', ru: 'Принесите счёт', transcription: '[hэсаб гэтирин]', topic: 'food', level: 3 },

  // Level 4 — full café sentences
  { az: 'Bir çay xahiş edirəm', ru: 'Один чай пожалуйста', transcription: '[бир чай хаhиш эдирэм]', topic: 'food', level: 4 },
  { az: 'Bu çox ləzzətlidir', ru: 'Это очень вкусно', transcription: '[бу чох лэззэтлидир]', topic: 'food', level: 4 },
  { az: 'Mən pomidor istəyirəm', ru: 'Я хочу помидор', transcription: '[мэн помидор истэйирэм]', topic: 'food', level: 4 },
  { az: 'Bu nə qədərdir?', ru: 'Сколько это стоит?', transcription: '[бу нэ кэдэрдир]', topic: 'food', level: 4 },
  { az: 'Çörək almaq istəyirəm', ru: 'Хочу купить хлеб', transcription: '[чёрэк алмак истэйирэм]', topic: 'food', level: 4 },

  // ═══════════════ FAMILY & HOME ═══════════════
  // Level 1 — core family members
  { az: 'ana', ru: 'мама', transcription: '[ана]', topic: 'family', level: 1 },
  { az: 'ata', ru: 'папа', transcription: '[ата]', topic: 'family', level: 1 },
  { az: 'qardaş', ru: 'брат', transcription: '[гардаш]', topic: 'family', level: 1 },
  { az: 'bacı', ru: 'сестра', transcription: '[баджы]', topic: 'family', level: 1 },
  { az: 'oğul', ru: 'сын', transcription: '[оул]', topic: 'family', level: 1 },
  { az: 'qız', ru: 'дочь', transcription: '[кыз]', topic: 'family', level: 1 },
  { az: 'uşaq', ru: 'ребёнок', transcription: '[ушак]', topic: 'family', level: 1 },

  // Level 2 — extended family + rooms
  { az: 'baba', ru: 'дедушка', transcription: '[баба]', topic: 'family', level: 2 },
  { az: 'nənə', ru: 'бабушка', transcription: '[нэнэ]', topic: 'family', level: 2 },
  { az: 'əmi', ru: 'дядя', transcription: '[эми]', topic: 'family', level: 2 },
  { az: 'xala', ru: 'тётя', transcription: '[хала]', topic: 'family', level: 2 },
  { az: 'ev', ru: 'дом', transcription: '[эв]', topic: 'family', level: 2 },
  { az: 'otaq', ru: 'комната', transcription: '[отак]', topic: 'family', level: 2 },
  { az: 'mətbəx', ru: 'кухня', transcription: '[мэтбэх]', topic: 'family', level: 2 },
  { az: 'həyət', ru: 'двор', transcription: '[hэйэт]', topic: 'family', level: 2 },

  // Level 3 — animals + adjectives
  { az: 'it', ru: 'собака', transcription: '[ит]', topic: 'family', level: 3 },
  { az: 'pişik', ru: 'кошка', transcription: '[пишик]', topic: 'family', level: 3 },
  { az: 'at', ru: 'лошадь', transcription: '[ат]', topic: 'family', level: 3 },
  { az: 'quş', ru: 'птица', transcription: '[куш]', topic: 'family', level: 3 },
  { az: 'böyük', ru: 'большой', transcription: '[бёюк]', topic: 'family', level: 3 },
  { az: 'kiçik', ru: 'маленький', transcription: '[кичик]', topic: 'family', level: 3 },
  { az: 'gözəl', ru: 'красивый', transcription: '[гёзэл]', topic: 'family', level: 3 },
  { az: 'sevimli', ru: 'любимый', transcription: '[севимли]', topic: 'family', level: 3 },

  // Level 4 — family sentences
  { az: 'Ailəm var', ru: 'У меня есть семья', transcription: '[аилэм вар]', topic: 'family', level: 4 },
  { az: 'Mənim qardaşım var', ru: 'У меня есть брат', transcription: '[мэним гардашым вар]', topic: 'family', level: 4 },
  { az: 'Anam çox gözəldir', ru: 'Моя мама очень красивая', transcription: '[анам чох гёзэлдир]', topic: 'family', level: 4 },
  { az: 'Evimiz böyükdür', ru: 'Наш дом большой', transcription: '[эвимиз бёюкдюр]', topic: 'family', level: 4 },
  { az: 'Babam çox yaşlıdır', ru: 'Мой дедушка очень старый', transcription: '[бабам чох яшлыдыр]', topic: 'family', level: 4 },

  // ═══════════════ PLACES & VERBS ═══════════════
  // Level 1 — basic places
  { az: 'bazar', ru: 'рынок', transcription: '[базар]', topic: 'places', level: 1 },
  { az: 'məktəb', ru: 'школа', transcription: '[мэктэб]', topic: 'places', level: 1 },
  { az: 'şəhər', ru: 'город', transcription: '[шэhэр]', topic: 'places', level: 1 },
  { az: 'küçə', ru: 'улица', transcription: '[кючэ]', topic: 'places', level: 1 },
  { az: 'park', ru: 'парк', transcription: '[парк]', topic: 'places', level: 1 },
  { az: 'dəniz', ru: 'море', transcription: '[дэниз]', topic: 'places', level: 1 },
  { az: 'dağ', ru: 'гора', transcription: '[даа]', topic: 'places', level: 1 },

  // Level 2 — transport + basic verbs
  { az: 'avtobus', ru: 'автобус', transcription: '[автобус]', topic: 'places', level: 2 },
  { az: 'taksi', ru: 'такси', transcription: '[такси]', topic: 'places', level: 2 },
  { az: 'qatar', ru: 'поезд', transcription: '[катар]', topic: 'places', level: 2 },
  { az: 'getmək', ru: 'идти / ехать', transcription: '[гетмэк]', topic: 'places', level: 2 },
  { az: 'gəlmək', ru: 'приходить', transcription: '[гэлмэк]', topic: 'places', level: 2 },
  { az: 'işləmək', ru: 'работать', transcription: '[ишлэмэк]', topic: 'places', level: 2 },
  { az: 'oxumaq', ru: 'читать / учиться', transcription: '[охумак]', topic: 'places', level: 2 },
  { az: 'danışmaq', ru: 'разговаривать', transcription: '[данышмак]', topic: 'places', level: 2 },

  // Level 3 — time + directions
  { az: 'bu gün', ru: 'сегодня', transcription: '[бу гюн]', topic: 'places', level: 3 },
  { az: 'sabah', ru: 'завтра', transcription: '[сабах]', topic: 'places', level: 3 },
  { az: 'dünən', ru: 'вчера', transcription: '[дюнэн]', topic: 'places', level: 3 },
  { az: 'sağa', ru: 'направо', transcription: '[саа]', topic: 'places', level: 3 },
  { az: 'sola', ru: 'налево', transcription: '[сола]', topic: 'places', level: 3 },
  { az: 'düz get', ru: 'иди прямо', transcription: '[дюз гет]', topic: 'places', level: 3 },
  { az: 'uzaqda', ru: 'далеко', transcription: '[узакда]', topic: 'places', level: 3 },
  { az: 'yaxında', ru: 'рядом / близко', transcription: '[яхында]', topic: 'places', level: 3 },

  // Level 4 — full sentences
  { az: 'Mən bazara gedirəm', ru: 'Я иду на рынок', transcription: '[мэн базара гедирэм]', topic: 'places', level: 4 },
  { az: 'Avtobus nə vaxt gəlir?', ru: 'Когда приходит автобус?', transcription: '[автобус нэ вакт гэлир]', topic: 'places', level: 4 },
  { az: 'Məktəb uzaqda deyil', ru: 'Школа не далеко', transcription: '[мэктэб узакда дейил]', topic: 'places', level: 4 },
  { az: 'Mən Azərbaycan dilini öyrənirəm', ru: 'Я учу азербайджанский язык', transcription: '[мэн азэрбайджан дилини ёйрэнирэм]', topic: 'places', level: 4 },
  { az: 'Bazar yaxındadır', ru: 'Рынок находится рядом', transcription: '[базар яхындадыр]', topic: 'places', level: 4 },
];
