const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Создаем экземпляр бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Данные о тренере (из сайта)
const trainerInfo = {
  name: "Лилия Яцкая",
  description: "Помогаю женщинам вернуть ощущение силы и лёгкости в теле через персональные тренировки и продуманные программы: без лишнего стресса, с вниманием к технике и результату.",
  experience: "Сертифицированный персональный тренер",
  specializations: [
    "Похудение и коррекция фигуры",
    "Восстановление после родов",
    "Силовые тренировки",
    "Функциональный тренинг",
    "Пилатес",
    "Растяжка и гибкость"
  ]
};

// Программы тренировок (из сайта)
const trainingPrograms = {
  "sushka_pro": {
    name: "Сушка PRO",
    price: "8,000 ₽",
    duration: "4 недели",
    description: "Мощные тренировки Табата для сжигания жира",
    features: [
      "8 мощных тренировок Табата (20/10, 40/20)",
      "План питания, запускающий сжигание жира",
      "Домашняя активность + рекомендации по восстановлению",
      "Постоянная поддержка: мотивация, напоминания, ответы на \"можно ли банан?\""
    ]
  },
  "strength_tone": {
    name: "Сила и Тонус",
    price: "6,000 ₽ → 4,200 ₽",
    duration: "4 недели",
    description: "Укрепление мышц-стабилизаторов и работа с дыханием",
    features: [
      "8 тренировок для стабилизаторов, дыхания, растяжки",
      "Укрепление тазовых и брюшных мышц без перегрузки",
      "План питания для лёгкости, тонуса и антистресса",
      "Мягкая, но постоянная поддержка"
    ],
    featured: true
  },
  "steel_abs": {
    name: "Стальной пресс",
    price: "7,200 ₽",
    duration: "4 недели",
    description: "Специализированная программа для проработки мышц пресса",
    features: [
      "8 тренировок для глубоких мышц живота",
      "Правильная техника для каждого упражнения",
      "План питания для рельефа и плоского живота",
      "Постоянная поддержка и контроль техники"
    ]
  },
  "trx_balance": {
    name: "TRX Баланс",
    price: "8,000 ₽ → 5,600 ₽",
    duration: "4 недели",
    description: "Современные тренировки с использованием TRX-петель",
    features: [
      "8 персональных TRX тренировок",
      "Фокус на глубокие мышцы и баланс",
      "Растяжка, мобилизация, работа с дыханием",
      "Поддержка и коррекция техники",
      "Питание + восстановление"
    ]
  },
  "postpartum": {
    name: "Новое тело после родов",
    price: "13,000 ₽",
    duration: "2 месяца",
    description: "Специальная программа для восстановления после родов",
    features: [
      "Мягкие упражнения для восстановления",
      "Работа с диастазом",
      "Укрепление тазового дна",
      "Психологическая поддержка"
    ]
  },
  "stretching": {
    name: "Растяжка и шпагат",
    price: "7,000 ₽",
    duration: "6 недель",
    description: "Программа для развития гибкости и улучшения осанки",
    features: [
      "Растяжка всего тела",
      "Упражнения на гибкость",
      "Работа с осанкой",
      "Дыхательные практики"
    ]
  },
  "nutrition_analysis": {
    name: "Анализ твоего питания",
    price: "5,000 ₽",
    duration: "1 неделя",
    description: "Персональный анализ питания и рекомендации",
    features: [
      "Анализ текущего питания",
      "Персональные рекомендации",
      "План питания на неделю",
      "Консультация по результатам"
    ]
  }
};

// Квиз вопросы (адаптированные из Marquiz)
const quizQuestions = [
  {
    id: 1,
    question: "Какая у вас основная цель?",
    options: [
      "Похудеть и сбросить лишний вес",
      "Укрепить мышцы и привести тело в тонус",
      "Восстановиться после родов",
      "Развить гибкость и улучшить осанку",
      "Скорректировать питание и образ жизни"
    ]
  },
  {
    id: 2,
    question: "Сколько времени вы можете уделять тренировкам в неделю?",
    options: [
      "1-2 раза в неделю",
      "3-4 раза в неделю",
      "5-6 раз в неделю",
      "Ежедневно"
    ]
  },
  {
    id: 3,
    question: "Где вы предпочитаете заниматься?",
    options: [
      "Дома, без инвентаря",
      "Дома, с минимальным инвентарем",
      "В зале",
      "На улице/на природе"
    ]
  },
  {
    id: 4,
    question: "Какой у вас уровень подготовки?",
    options: [
      "Начинающий (никогда не занимался спортом)",
      "Начальный (занимался, но давно)",
      "Средний (регулярно занимаюсь)",
      "Продвинутый (опытный спортсмен)"
    ]
  },
  {
    id: 5,
    question: "Что вас больше всего мотивирует?",
    options: [
      "Быстрые результаты",
      "Постепенное, но стабильное улучшение",
      "Поддержка и контроль тренера",
      "Самостоятельность и гибкость"
    ]
  }
];

// Хранилище состояний пользователей
const userStates = new Map();

// Главное меню
const mainMenu = {
  reply_markup: {
    keyboard: [
      [{ text: "🏠 Главная" }, { text: "💪 Программы" }],
      [{ text: "🧠 Пройти квиз" }, { text: "👩‍💼 О тренере" }],
      [{ text: "💬 Отзывы" }, { text: "❓ FAQ" }],
      [{ text: "📞 Контакты" }]
    ],
    resize_keyboard: true
  }
};

// Меню программ
const programsMenu = {
  reply_markup: {
    keyboard: [
      [{ text: "🔥 Сушка PRO" }, { text: "💪 Сила и Тонус" }],
      [{ text: "🫁 Стальной пресс" }, { text: "🏋️ TRX Баланс" }],
      [{ text: "🤱 После родов" }, { text: "🤸 Растяжка" }],
      [{ text: "🍎 Анализ питания" }, { text: "🔙 Назад" }]
    ],
    resize_keyboard: true
  }
};

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeText = `👋 Привет! Я бот-помощник Лилии Яцкой - персонального тренера.

${trainerInfo.description}

Выберите, что вас интересует:`;

  bot.sendMessage(chatId, welcomeText, mainMenu);
});

// Обработчик текстовых сообщений
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userId = msg.from.id;

  // Проверяем, находится ли пользователь в процессе квиза
  if (userStates.has(userId) && userStates.get(userId).inQuiz) {
    handleQuizAnswer(chatId, userId, text);
    return;
  }

  switch (text) {
    case "🏠 Главная":
      showMainInfo(chatId);
      break;
    case "💪 Программы":
      showPrograms(chatId);
      break;
    case "🧠 Пройти квиз":
      startQuiz(chatId, userId);
      break;
    case "👩‍💼 О тренере":
      showTrainerInfo(chatId);
      break;
    case "💬 Отзывы":
      showTestimonials(chatId);
      break;
    case "❓ FAQ":
      showFAQ(chatId);
      break;
    case "📞 Контакты":
      showContacts(chatId);
      break;
    case "🔙 Назад":
      bot.sendMessage(chatId, "Выберите раздел:", mainMenu);
      break;
    default:
      // Обработка программ
      if (text.includes("🔥 Сушка PRO")) {
        showProgramDetails(chatId, "sushka_pro");
      } else if (text.includes("💪 Сила и Тонус")) {
        showProgramDetails(chatId, "strength_tone");
      } else if (text.includes("🫁 Стальной пресс")) {
        showProgramDetails(chatId, "steel_abs");
      } else if (text.includes("🏋️ TRX Баланс")) {
        showProgramDetails(chatId, "trx_balance");
      } else if (text.includes("🤱 После родов")) {
        showProgramDetails(chatId, "postpartum");
      } else if (text.includes("🤸 Растяжка")) {
        showProgramDetails(chatId, "stretching");
      } else if (text.includes("🍎 Анализ питания")) {
        showProgramDetails(chatId, "nutrition_analysis");
      } else if (text.includes("📞 Записаться")) {
        showContactInfo(chatId);
      } else if (text === "🔙 К программам") {
        showPrograms(chatId);
      } else {
        // Убираем это сообщение - пользователь может писать что угодно
      }
  }
});

// Функция показа главной информации
function showMainInfo(chatId) {
  const text = `🌟 *Добро пожаловать!*

Я - ${trainerInfo.name}, персональный тренер, который поможет вам:

✅ Похудеть и привести тело в форму
✅ Укрепить мышцы и развить силу
✅ Восстановиться после родов
✅ Полюбить спорт и здоровый образ жизни
✅ Обрести уверенность в себе

*Мой подход:*
• Индивидуальные программы
• Внимание к технике
• Поддержка на каждом шаге
• Без лишнего стресса

*Готовы начать?* Пройдите квиз, чтобы я подобрала идеальную программу именно для вас!`;

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...mainMenu });
}

// Функция показа программ
function showPrograms(chatId) {
  const text = `💪 *Программы тренировок*

Выберите программу, которая подходит именно вам:`;

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...programsMenu });
}

// Функция показа деталей программы
function showProgramDetails(chatId, programKey) {
  const program = trainingPrograms[programKey];
  if (!program) return;

  const featuredText = program.featured ? "\n⭐ *САМЫЙ ПОПУЛЯРНЫЙ*" : "";
  const text = `*${program.name}*${featuredText}

💰 *Цена:* ${program.price}
⏱ *Длительность:* ${program.duration}

📝 *Описание:*
${program.description}

✅ *Что входит:*
${program.features.map(item => `• ${item}`).join('\n')}

📞 *Для записи:* @liliya_fit_trainer`;

  const menu = {
    reply_markup: {
      keyboard: [
        [{ text: "📞 Записаться на программу" }, { text: "🔙 К программам" }]
      ],
      resize_keyboard: true
    }
  };

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...menu });
}

// Функция запуска квиза
function startQuiz(chatId, userId) {
  userStates.set(userId, {
    inQuiz: true,
    currentQuestion: 0,
    answers: []
  });

  const question = quizQuestions[0];
  const keyboard = {
    reply_markup: {
      keyboard: question.options.map((option, index) => [{ text: `${index + 1}. ${option}` }]),
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  const text = `🧠 *Квиз: Подбор идеальной программы*

*Вопрос 1 из ${quizQuestions.length}:*
${question.question}

Выберите подходящий вариант:`;

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...keyboard });
}

// Функция обработки ответов квиза
function handleQuizAnswer(chatId, userId, text) {
  const userState = userStates.get(userId);
  const currentQuestionIndex = userState.currentQuestion;
  const question = quizQuestions[currentQuestionIndex];

  // Проверяем, является ли ответ валидным
  const answerIndex = parseInt(text) - 1;
  if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= question.options.length) {
    bot.sendMessage(chatId, "Пожалуйста, выберите один из предложенных вариантов (1, 2, 3, 4 или 5).");
    return;
  }

  // Сохраняем ответ
  userState.answers.push({
    questionId: question.id,
    answer: answerIndex,
    answerText: question.options[answerIndex]
  });

  // Переходим к следующему вопросу
  userState.currentQuestion++;

  if (userState.currentQuestion < quizQuestions.length) {
    // Показываем следующий вопрос
    const nextQuestion = quizQuestions[userState.currentQuestion];
    const keyboard = {
      reply_markup: {
        keyboard: nextQuestion.options.map((option, index) => [{ text: `${index + 1}. ${option}` }]),
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };

    const text = `*Вопрос ${userState.currentQuestion + 1} из ${quizQuestions.length}:*
${nextQuestion.question}

Выберите подходящий вариант:`;

    bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...keyboard });
  } else {
    // Квиз завершен, показываем результат
    showQuizResult(chatId, userId);
  }
}

// Функция показа результата квиза
function showQuizResult(chatId, userId) {
  const userState = userStates.get(userId);
  const answers = userState.answers;

  // Анализируем ответы и подбираем программу
  let recommendedProgram = "strength_tone"; // По умолчанию
  let recommendationText = "";

  // Простая логика подбора программы на основе ответов
  const goalAnswer = answers[0].answerText;
  const timeAnswer = answers[1].answerText;
  const placeAnswer = answers[2].answerText;
  const levelAnswer = answers[3].answerText;

  if (goalAnswer.includes("Похудеть")) {
    recommendedProgram = "sushka_pro";
    recommendationText = "Для достижения цели похудения идеально подойдет программа 'Сушка PRO' с интенсивными тренировками Табата.";
  } else if (goalAnswer.includes("Восстановиться после родов")) {
    recommendedProgram = "postpartum";
    recommendationText = "Для восстановления после родов рекомендую специальную программу 'Новое тело после родов'.";
  } else if (goalAnswer.includes("Укрепить мышцы")) {
    recommendedProgram = "strength_tone";
    recommendationText = "Для укрепления мышц и приведения тела в тонус подойдет программа 'Сила и Тонус'.";
  } else if (goalAnswer.includes("Развить гибкость")) {
    recommendedProgram = "stretching";
    recommendationText = "Для развития гибкости и улучшения осанки рекомендую программу 'Растяжка и шпагат'.";
  } else if (goalAnswer.includes("Скорректировать питание")) {
    recommendedProgram = "nutrition_analysis";
    recommendationText = "Для коррекции питания начните с программы 'Анализ твоего питания'.";
  }

  const program = trainingPrograms[recommendedProgram];
  const featuredText = program.featured ? "\n⭐ *САМЫЙ ПОПУЛЯРНЫЙ*" : "";

  const text = `🎉 *Результат квиза*

${recommendationText}

*Рекомендуемая программа:*
*${program.name}*${featuredText}

💰 *Цена:* ${program.price}
⏱ *Длительность:* ${program.duration}

📝 *Описание:*
${program.description}

✅ *Что входит:*
${program.features.map(item => `• ${item}`).join('\n')}

*Готовы начать?* Свяжитесь со мной для записи!`;

  const menu = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "📞 Записаться на программу",
            url: "https://t.me/+79152994659"
          }
        ],
        [
          {
            text: "💪 Посмотреть все программы",
            callback_data: "show_all_programs"
          }
        ],
        [
          {
            text: "🏠 Главное меню",
            callback_data: "main_menu"
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...menu });

  // Очищаем состояние пользователя
  userStates.delete(userId);
}

// Функция показа информации о тренере
function showTrainerInfo(chatId) {
  const text = `👩‍💼 *О тренере*

*${trainerInfo.name}*
${trainerInfo.experience}

${trainerInfo.description}

*Специализации:*
${trainerInfo.specializations.map(item => `• ${item}`).join('\n')}

*Почему выбирают меня:*
• Индивидуальный подход к каждому
• Безопасная техника выполнения
• Постоянная поддержка и мотивация
• Реальные результаты моих клиентов

*Мой подход к тренировкам:*
Все тренировки — онлайн, 1 на 1 с тренером. Я полностью с тобой на каждом занятии:
✅ Я всё вижу
✅ Я контролирую технику
✅ Я подбираю упражнения именно под тебя
✅ Я знаю, когда ты можешь больше — и мягко веду туда

📞 *Связаться:* @liliya_fit_trainer`;

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...mainMenu });
}

// Функция показа контактной информации для записи
function showContactInfo(chatId) {
  const text = `📞 *Записаться на программу*

*Персональный тренер Лилия Яцкая*

📱 *Telegram:* @liliya_fit_trainer
📞 *Телефон:* +7 (915) 299-46-59
📧 *Email:* liliya@fitnesstrainer.com
🌐 *Сайт:* https://lili-superfit.com

*Готовы начать путь к форме?*
Давайте обсудим ваши цели и подберём персональный план именно для вас!

*Что нужно будет подготовить:*
📸 Фото для отслеживания прогресса
📏 Измерения тела (талия, бёдра, ноги, икры)
📋 Анкета здоровья (пришлю форму)

*Ваш индивидуальный план включает:*
💪 Два онлайн-занятия в неделю по 30 минут
📊 Персональный план питания
📈 Отслеживание прогресса
🤝 Постоянную поддержку и мотивацию

*Нажмите на кнопки ниже для связи:*`;

  const menu = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "💬 Написать в Telegram",
            url: "https://t.me/liliya_fit_trainer"
          }
        ],
        [
          {
            text: "📞 Перейти в чат +7 (915) 299-46-59",
            url: "https://t.me/+79152994659"
          }
        ],
        [
          {
            text: "📱 WhatsApp +7 (915) 299-46-59",
            url: "https://wa.me/79152994659"
          }
        ],
        [
          {
            text: "🌐 Перейти на сайт",
            url: "https://lili-superfit.com"
          }
        ],
        [
          {
            text: "🔙 Назад к программам",
            callback_data: "back_to_programs"
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...menu });
}

// Функция показа контактов
function showContacts(chatId) {
  const text = `📞 *Контакты*

*Персональный тренер Лилия Яцкая*

📱 *Telegram:* @liliya_fit_trainer
📧 *Email:* liliya@fitnesstrainer.com
🌐 *Сайт:* https://lili-superfit.com

*Готовы начать путь к форме?*
Давайте обсудим ваши цели и подберём персональный план именно для вас!

*Что нужно будет подготовить:*
📸 Фото для отслеживания прогресса
📏 Измерения тела (талия, бёдра, ноги, икры)
📋 Анкета здоровья (пришлю форму)

*Ваш индивидуальный план включает:*
💪 Два онлайн-занятия в неделю по 30 минут
📊 Персональный план питания
📈 Отслеживание прогресса
🤝 Постоянную поддержку и мотивацию`;

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...mainMenu });
}

// Функция показа отзывов
function showTestimonials(chatId) {
  const testimonials = [
    "«Я никогда не чувствовала себя такой сильной! Лилия бережно, но требовательно вела меня, объясняла технику и поддерживала на каждом шаге. Минус 7 кг и совершенно иное ощущение тела — рекомендую!»",
    "«Занятия 1 на 1 с Лилией — это то, чего мне не хватало. Никаких сомнений и хаоса: чёткий план, внимание к технике и поддержка на каждом шаге. Минус 6 кг за месяц и ощущение силы и контроля над телом — я в восторге!»",
    "«За 2 месяца с Лилией я не только похудела на 8 кг, но и полностью изменила отношение к спорту. Теперь тренировки — это не мучение, а удовольствие. Тело стало подтянутым, а настроение — отличным!»",
    "«Лилия помогла мне восстановиться после родов. За 3 месяца я вернула прежнюю форму и даже стала лучше! Упражнения адаптированы под мое состояние, поддержка постоянная. Очень рекомендую!»",
    "«Результат превзошел все ожидания! За месяц с Лилией я сбросила 5 кг и обрела невероятную уверенность в себе. Каждая тренировка — это шаг к лучшей версии себя!»",
    "«Лилия — это не просто тренер, а настоящий наставник! Всего за 1 месяц я не только сбросила 4 кг, но и полностью изменила образ жизни. Теперь я чувствую себя энергичной и счастливой каждый день!»",
    "«Благодаря Лилии я поняла, что спорт — это не наказание, а удовольствие! За полтора месяца я похудела на 5 кг и обрела невероятную уверенность в себе. Каждая тренировка — это шаг к лучшей версии себя!»"
  ];

  const randomTestimonial = testimonials[Math.floor(Math.random() * testimonials.length)];
  
  const text = `💬 *Отзывы клиентов*

${randomTestimonial}

*Хотите узнать больше отзывов?*
Посетите наш сайт: https://lili-superfit.com

*Готовы присоединиться к успешным клиентам?*
Пройдите квиз и начните свой путь к идеальной форме!`;

  const menu = {
    reply_markup: {
      keyboard: [
        [{ text: "🧠 Пройти квиз" }, { text: "💪 Программы" }],
        [{ text: "🏠 Главное меню" }]
      ],
      resize_keyboard: true
    }
  };

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...menu });
}

// Функция показа FAQ
function showFAQ(chatId) {
  const text = `❓ *Часто задаваемые вопросы*

*Какие задачи можно решить со мной?*
• Похудеть
• Получить рельеф и развить силу
• Укрепить сердечно-сосудистую систему
• Скорректировать питание и образ жизни навсегда
• Восстановиться после родов

*Кому подойдут мои программы?*
• Если нет времени на долгие тренировки
• Если не можешь собраться с силами и начать
• Если раньше начинала, но бросала
• Если хочешь заниматься, но не знаешь с чего начать
• Если нужна поддержка и простой план

*Как проходят тренировки?*
Все тренировки — онлайн, 1 на 1 с тренером. Я полностью с тобой на каждом занятии, контролирую технику и подбираю упражнения именно под тебя.

*Какой минимальный инвентарь?*
Все занятия можно проводить дома, без сложного инвентаря. На курсе даны список и рекомендации по покупке или бесплатные домашние аналоги.

*Готовы начать?* Пройдите квиз для подбора идеальной программы!`;

  const menu = {
    reply_markup: {
      keyboard: [
        [{ text: "🧠 Пройти квиз" }, { text: "💪 Программы" }],
        [{ text: "📞 Контакты" }, { text: "🏠 Главное меню" }]
      ],
      resize_keyboard: true
    }
  };

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...menu });
}

// Обработчик callback кнопок
bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  if (data === 'back_to_programs') {
    showPrograms(chatId);
  } else if (data === 'show_all_programs') {
    showPrograms(chatId);
  } else if (data === 'main_menu') {
    showMainInfo(chatId);
  }

  // Подтверждаем получение callback
  bot.answerCallbackQuery(callbackQuery.id);
});

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.log('Polling error:', error);
});

console.log('🤖 Бот запущен и готов к работе!');