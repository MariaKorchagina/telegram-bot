const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.BOT_TOKEN;

if (!token) {
    console.error('❌ Ошибка: BOT_TOKEN не найден в переменных окружения!');
    console.log('📝 Создайте файл .env и добавьте: BOT_TOKEN=your_bot_token_here');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Состояния пользователей для квиза
const userStates = new Map();

// Программы тренировок
const programs = {
    'sushka_pro': {
        name: 'Сушка PRO',
        price: '8,000 ₽',
        description: 'Мощные тренировки Табата для сжигания жира и укрепления мышц',
        features: ['Интенсивные интервальные тренировки', 'Сжигание до 500 ккал за сессию', 'Укрепление всех групп мышц']
    },
    'sila_tonus': {
        name: 'Сила и Тонус',
        price: '6,000 ₽ → 4,200 ₽',
        description: 'Укрепление мышц-стабилизаторов и улучшение осанки',
        features: ['Укрепление корпуса', 'Улучшение осанки', 'Стабилизация суставов']
    },
    'stalnoy_press': {
        name: 'Стальной пресс',
        price: '7,200 ₽',
        description: 'Специализированная программа для проработки мышц живота',
        features: ['Упражнения для пресса', 'Укрепление корпуса', 'Улучшение осанки']
    },
    'trx_balance': {
        name: 'TRX Баланс',
        price: '8,000 ₽ → 5,600 ₽',
        description: 'Современные тренировки с TRX для развития баланса и силы',
        features: ['TRX упражнения', 'Развитие баланса', 'Функциональная подготовка']
    },
    'posle_rodov': {
        name: 'Новое тело после родов',
        price: '13,000 ₽',
        description: 'Восстановление после родов и укрепление мышц тазового дна',
        features: ['Восстановление мышц таза', 'Укрепление корпуса', 'Безопасные упражнения']
    },
    'rastyazhka': {
        name: 'Растяжка и шпагат',
        price: '7,000 ₽',
        description: 'Развитие гибкости, улучшение осанки и освоение шпагата',
        features: ['Увеличение гибкости', 'Улучшение осанки', 'Освоение шпагата']
    },
    'analiz_pitaniya': {
        name: 'Анализ питания',
        price: '5,000 ₽',
        description: 'Персональный анализ питания и составление плана питания',
        features: ['Анализ текущего рациона', 'Персональные рекомендации', 'План питания']
    }
};

// Вопросы квиза
const quizQuestions = [
    {
        question: '🎯 Какая у вас основная цель?',
        options: [
            { text: '🔥 Похудение', value: 'weight_loss' },
            { text: '💪 Укрепление мышц', value: 'muscle_strength' },
            { text: '👶 Восстановление после родов', value: 'post_pregnancy' },
            { text: '🤸 Гибкость и растяжка', value: 'flexibility' },
            { text: '🥗 Питание и диета', value: 'nutrition' }
        ]
    },
    {
        question: '⏰ Сколько раз в неделю вы готовы тренироваться?',
        options: [
            { text: '1-2 раза', value: '1-2' },
            { text: '3-4 раза', value: '3-4' },
            { text: '5-6 раз', value: '5-6' },
            { text: 'Ежедневно', value: 'daily' }
        ]
    },
    {
        question: '🏠 Где вы предпочитаете заниматься?',
        options: [
            { text: '🏡 Дома', value: 'home' },
            { text: '🏋️ В зале', value: 'gym' },
            { text: '🌳 На улице', value: 'outdoor' },
            { text: '📍 Любое место', value: 'anywhere' }
        ]
    },
    {
        question: '📊 Какой у вас уровень подготовки?',
        options: [
            { text: '🆕 Начинающий', value: 'beginner' },
            { text: '📈 Есть опыт', value: 'intermediate' },
            { text: '💪 Продвинутый', value: 'advanced' }
        ]
    },
    {
        question: '🚀 Что вас больше мотивирует?',
        options: [
            { text: '⚡ Быстрые результаты', value: 'fast_results' },
            { text: '📈 Постепенное улучшение', value: 'gradual_progress' },
            { text: '👥 Поддержка тренера', value: 'trainer_support' }
        ]
    }
];

// Логика подбора программы на основе ответов
function recommendProgram(answers) {
    const { goal, frequency, location, level, motivation } = answers;
    
    if (goal === 'weight_loss') return 'sushka_pro';
    if (goal === 'post_pregnancy') return 'posle_rodov';
    if (goal === 'muscle_strength') return 'sila_tonus';
    if (goal === 'flexibility') return 'rastyazhka';
    if (goal === 'nutrition') return 'analiz_pitaniya';
    
    // Дополнительная логика на основе других ответов
    if (level === 'advanced' && frequency === 'daily') return 'sushka_pro';
    if (level === 'beginner') return 'sila_tonus';
    
    return 'sila_tonus'; // По умолчанию
}

// Главное меню
function getMainMenu() {
    return {
        reply_markup: {
            keyboard: [
                ['🧠 Пройти квиз', '📋 Программы тренировок'],
                ['👩‍💼 О тренере', '📞 Контакты'],
                ['⭐ Отзывы', '❓ FAQ']
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    };
}

// Меню программ
function getProgramsMenu() {
    const programsList = Object.entries(programs).map(([key, program]) => 
        `• ${program.name} - ${program.price}`
    ).join('\n');
    
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🔥 Сушка PRO', callback_data: 'program_sushka_pro' },
                    { text: '💪 Сила и Тонус', callback_data: 'program_sila_tonus' }
                ],
                [
                    { text: '🏋️ Стальной пресс', callback_data: 'program_stalnoy_press' },
                    { text: '🤸 TRX Баланс', callback_data: 'program_trx_balance' }
                ],
                [
                    { text: '👶 После родов', callback_data: 'program_posle_rodov' },
                    { text: '🤸 Растяжка', callback_data: 'program_rastyazhka' }
                ],
                [
                    { text: '🥗 Анализ питания', callback_data: 'program_analiz_pitaniya' }
                ],
                [
                    { text: '📞 Записаться на программу', callback_data: 'book_program' }
                ],
                [
                    { text: '🔙 Назад в меню', callback_data: 'back_to_menu' }
                ]
            ]
        }
    };
}

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    
    const welcomeMessage = `👋 Привет, ${firstName}!

Добро пожаловать в бот фитнес-тренера Лилии Яцкой! 💪

Я помогу вам:
• 🧠 Подобрать идеальную программу тренировок
• 📋 Показать все доступные программы
• 📞 Связаться с тренером
• ❓ Ответить на ваши вопросы

Выберите действие в меню ниже:`;

    bot.sendMessage(chatId, welcomeMessage, getMainMenu());
});

// Обработка текстовых сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    if (text === '🧠 Пройти квиз') {
        startQuiz(chatId);
    } else if (text === '📋 Программы тренировок') {
        showPrograms(chatId);
    } else if (text === '👩‍💼 О тренере') {
        showAboutTrainer(chatId);
    } else if (text === '📞 Контакты') {
        showContacts(chatId);
    } else if (text === '⭐ Отзывы') {
        showReviews(chatId);
    } else if (text === '❓ FAQ') {
        showFAQ(chatId);
    }
});

// Обработка callback запросов
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;
    
    if (data.startsWith('program_')) {
        const programKey = data.replace('program_', '');
        showProgramDetails(chatId, programKey);
    } else if (data === 'book_program') {
        bookProgram(chatId);
    } else if (data === 'back_to_menu') {
        bot.sendMessage(chatId, '🏠 Главное меню:', getMainMenu());
    } else if (data.startsWith('quiz_')) {
        handleQuizAnswer(chatId, data);
    }
    
    bot.answerCallbackQuery(callbackQuery.id);
});

// Запуск квиза
function startQuiz(chatId) {
    userStates.set(chatId, {
        step: 0,
        answers: {}
    });
    
    sendQuizQuestion(chatId, 0);
}

// Отправка вопроса квиза
function sendQuizQuestion(chatId, questionIndex) {
    const question = quizQuestions[questionIndex];
    const options = question.options.map(option => ({
        text: option.text,
        callback_data: `quiz_${questionIndex}_${option.value}`
    }));
    
    const keyboard = [];
    for (let i = 0; i < options.length; i += 2) {
        keyboard.push(options.slice(i, i + 2));
    }
    
    bot.sendMessage(chatId, question.question, {
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
}

// Обработка ответа квиза
function handleQuizAnswer(chatId, data) {
    const parts = data.split('_');
    const questionIndex = parseInt(parts[1]);
    const answer = parts[2];
    
    const userState = userStates.get(chatId);
    if (!userState) return;
    
    // Сохраняем ответ
    const answerKeys = ['goal', 'frequency', 'location', 'level', 'motivation'];
    userState.answers[answerKeys[questionIndex]] = answer;
    
    // Переходим к следующему вопросу
    if (questionIndex < quizQuestions.length - 1) {
        userState.step = questionIndex + 1;
        sendQuizQuestion(chatId, questionIndex + 1);
    } else {
        // Квиз завершен, показываем рекомендацию
        finishQuiz(chatId, userState.answers);
    }
}

// Завершение квиза
function finishQuiz(chatId, answers) {
    const recommendedProgramKey = recommendProgram(answers);
    const program = programs[recommendedProgramKey];
    
    const message = `🎉 Отлично! Квиз завершен!

На основе ваших ответов я рекомендую программу:

🏆 **${program.name}**
💰 Цена: ${program.price}
📝 Описание: ${program.description}

✨ Особенности:
${program.features.map(feature => `• ${feature}`).join('\n')}

Хотите записаться на эту программу или посмотреть другие варианты?`;

    bot.sendMessage(chatId, message, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📞 Записаться на программу', callback_data: 'book_program' },
                    { text: '📋 Посмотреть все программы', callback_data: 'show_all_programs' }
                ],
                [
                    { text: '🔙 В главное меню', callback_data: 'back_to_menu' }
                ]
            ]
        }
    });
    
    userStates.delete(chatId);
}

// Показ программ
function showPrograms(chatId) {
    const message = `📋 **Доступные программы тренировок:**

${Object.values(programs).map(program => 
    `• **${program.name}** - ${program.price}`
).join('\n')}

Выберите программу для подробной информации:`;

    bot.sendMessage(chatId, message, getProgramsMenu());
}

// Показ деталей программы
function showProgramDetails(chatId, programKey) {
    const program = programs[programKey];
    
    const message = `🏆 **${program.name}**
💰 **Цена:** ${program.price}

📝 **Описание:**
${program.description}

✨ **Особенности:**
${program.features.map(feature => `• ${feature}`).join('\n')}

Готовы начать? Записывайтесь на программу!`;

    bot.sendMessage(chatId, message, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📞 Записаться на программу', callback_data: 'book_program' }
                ],
                [
                    { text: '🔙 К списку программ', callback_data: 'back_to_programs' }
                ]
            ]
        }
    });
}

// Запись на программу
function bookProgram(chatId) {
    const message = `📞 **Записаться на программу**

Для записи на программу свяжитесь с тренером:

📱 **Телефон:** +7 915 299 4659
📧 **Telegram:** @liliya_fit_trainer

Или перейдите в чат по номеру: +7 915 299 4659

Лилия ответит на все ваши вопросы и поможет выбрать подходящую программу! 💪`;

    bot.sendMessage(chatId, message, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📱 Перейти в чат', url: 'https://t.me/+79152994659' }
                ],
                [
                    { text: '🔙 Назад в меню', callback_data: 'back_to_menu' }
                ]
            ]
        }
    });
}

// О тренере
function showAboutTrainer(chatId) {
    const message = `👩‍💼 **О тренере - Лилия Яцкая**

💪 **Специализации:**
• Фитнес-тренер с 5+ лет опыта
• Специалист по восстановлению после родов
• Тренер по TRX и функциональному тренингу
• Эксперт по питанию и здоровому образу жизни

🏆 **Достижения:**
• Помогла 500+ клиентам достичь целей
• Сертифицированный тренер по TRX
• Специализация по работе с женщинами после родов
• Автор уникальных программ тренировок

🎯 **Подход:**
Индивидуальный подход к каждому клиенту, безопасные и эффективные тренировки, постоянная поддержка и мотивация.

Лилия поможет вам достичь любых целей! 💪`;

    bot.sendMessage(chatId, message, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📞 Связаться с тренером', callback_data: 'book_program' }
                ],
                [
                    { text: '🔙 Назад в меню', callback_data: 'back_to_menu' }
                ]
            ]
        }
    });
}

// Контакты
function showContacts(chatId) {
    const message = `📞 **Контакты тренера**

📱 **Телефон:** +7 915 299 4659
📧 **Telegram:** @liliya_fit_trainer
🌐 **Instagram:** @liliya_fit_trainer

📍 **Местоположение:** Москва
🕐 **Время работы:** Пн-Вс 8:00-22:00

💬 **Способы связи:**
• Прямой звонок
• Telegram чат
• WhatsApp
• Личные сообщения в Instagram

Свяжитесь любым удобным способом! Лилия ответит в течение часа. ⚡`;

    bot.sendMessage(chatId, message, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📱 Перейти в чат', url: 'https://t.me/+79152994659' }
                ],
                [
                    { text: '🔙 Назад в меню', callback_data: 'back_to_menu' }
                ]
            ]
        }
    });
}

// Отзывы
function showReviews(chatId) {
    const message = `⭐ **Отзывы клиентов**

💬 **Анна, 28 лет:**
"Занимаюсь с Лилей уже 6 месяцев. Результат превзошел все ожидания! Минус 15 кг, подтянутое тело и отличное настроение. Лиля - настоящий профессионал!"

💬 **Мария, 32 года:**
"После родов думала, что никогда не вернусь в форму. Лиля помогла не только восстановиться, но и стать лучше, чем до беременности. Спасибо!"

💬 **Елена, 25 лет:**
"Программа TRX Баланс - это что-то невероятное! Упражнения интересные, результат виден уже через месяц. Рекомендую всем!"

💬 **Ольга, 30 лет:**
"Лиля не просто тренер, а настоящий наставник. Поддерживает, мотивирует, всегда на связи. Благодаря ей полюбила спорт!"

💬 **Ирина, 35 лет:**
"Растяжка и шпагат - мечта детства сбылась! Лиля помогла сесть на шпагат за 3 месяца. Невероятно!"

Хотите стать следующим успешным клиентом? Записывайтесь! 💪`;

    bot.sendMessage(chatId, message, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📞 Записаться на программу', callback_data: 'book_program' }
                ],
                [
                    { text: '🔙 Назад в меню', callback_data: 'back_to_menu' }
                ]
            ]
        }
    });
}

// FAQ
function showFAQ(chatId) {
    const message = `❓ **Часто задаваемые вопросы**

**Q: С какого возраста можно заниматься?**
A: Программы подходят для женщин от 16 лет. Есть специальные программы для восстановления после родов.

**Q: Нужно ли специальное оборудование?**
A: Большинство программ рассчитаны на домашние тренировки. Для TRX Баланс нужны петли TRX.

**Q: Как часто проходят тренировки?**
A: Частота зависит от выбранной программы - от 1-2 раз в неделю до ежедневных занятий.

**Q: Можно ли заниматься во время беременности?**
A: Да, есть специальные программы для беременных. Обязательно консультация с врачом.

**Q: Что если я пропущу тренировку?**
A: Все программы гибкие, можно заниматься в удобное время. Лиля всегда на связи для консультаций.

**Q: Как происходит оплата?**
A: Оплата производится перед началом программы. Доступны различные способы оплаты.

**Q: Можно ли изменить программу?**
A: Да, программа корректируется в зависимости от ваших результатов и пожеланий.

Есть другие вопросы? Свяжитесь с тренером! 💬`;

    bot.sendMessage(chatId, message, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📞 Задать вопрос тренеру', callback_data: 'book_program' }
                ],
                [
                    { text: '🔙 Назад в меню', callback_data: 'back_to_menu' }
                ]
            ]
        }
    });
}

// Обработка ошибок
bot.on('polling_error', (error) => {
    console.error('❌ Ошибка polling:', error);
});

bot.on('error', (error) => {
    console.error('❌ Ошибка бота:', error);
});

// Запуск бота
console.log('🚀 Бот запущен и готов к работе!');
console.log('📱 Для остановки нажмите Ctrl+C');

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Остановка бота...');
    bot.stopPolling();
    process.exit(0);
});