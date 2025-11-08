
// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================

// Estado de la aplicación
let currentSection = 'welcome';
let chatHistory = [];
let testAnswers = [];
let currentQuestionIndex = 0;

// Preguntas del test psicológico
const testQuestions = [
    {
        id: 1,
        question: "¿Cómo describirías tu estado de ánimo general en las últimas dos semanas?",
        options: [
            { text: "Me he sentido bien, positivo/a y con energía", value: 1 },
            { text: "He tenido altibajos, pero en general bien", value: 2 },
            { text: "Me he sentido algo decaído/a o con poca energía", value: 3 },
            { text: "Me he sentido muy triste, sin esperanza o vacío/a", value: 4 }
        ]
    },
    {
        id: 2,
        question: "¿Cómo manejas el estrés relacionado con tus responsabilidades académicas?",
        options: [
            { text: "Lo manejo bien, me siento capaz y organizado/a", value: 1 },
            { text: "A veces me estreso, pero logro cumplir con todo", value: 2 },
            { text: "Me siento frecuentemente abrumado/a y ansioso/a", value: 3 },
            { text: "El estrés académico me supera constantemente", value: 4 }
        ]
    },
    {
        id: 3,
        question: "¿Cómo ha sido tu calidad de sueño últimamente?",
        options: [
            { text: "Duermo bien, descanso y me levanto con energía", value: 1 },
            { text: "Tengo algunas noches difíciles ocasionalmente", value: 2 },
            { text: "Me cuesta dormir o descansar adecuadamente", value: 3 },
            { text: "Tengo insomnio severo o duermo excesivamente", value: 4 }
        ]
    },
    {
        id: 4,
        question: "¿Cómo te sientes en relación con tus amistades y relaciones personales?",
        options: [
            { text: "Me siento conectado/a y apoyado/a por otros", value: 1 },
            { text: "Tengo algunas relaciones, aunque podría mejorar", value: 2 },
            { text: "Me siento algo aislado/a o incomprendido/a", value: 3 },
            { text: "Me siento muy solo/a y desconectado/a de los demás", value: 4 }
        ]
    },
    {
        id: 5,
        question: "¿Has experimentado cambios significativos en tu apetito o peso recientemente?",
        options: [
            { text: "No, mi apetito y peso están estables", value: 1 },
            { text: "He notado pequeños cambios pero nada preocupante", value: 2 },
            { text: "He perdido o ganado apetito de manera notable", value: 3 },
            { text: "He tenido cambios drásticos que me preocupan", value: 4 }
        ]
    },
    {
        id: 6,
        question: "¿Cómo te sientes respecto a tu futuro y tus metas?",
        options: [
            { text: "Me siento optimista y motivado/a", value: 1 },
            { text: "Tengo esperanza, aunque a veces dudo", value: 2 },
            { text: "Me siento inseguro/a y preocupado/a", value: 3 },
            { text: "Siento que no hay esperanza o propósito", value: 4 }
        ]
    },
    {
        id: 7,
        question: "¿Has tenido pensamientos de hacerte daño o de que la vida no vale la pena?",
        options: [
            { text: "No, nunca he tenido esos pensamientos", value: 1 },
            { text: "Muy raramente y pasan rápido", value: 2 },
            { text: "A veces los tengo, me preocupan", value: 3 },
            { text: "Sí, los tengo frecuentemente", value: 4 }
        ]
    }
];

// Palabras clave para análisis de conversación
const keywordAnalysis = {
    crisis: ['suicidio', 'matarme', 'morir', 'acabar', 'terminar todo', 'no puedo más', 'quiero desaparecer'],
    ansiedad: ['ansiedad', 'ansioso', 'nervioso', 'pánico', 'angustia', 'preocupado', 'estresado', 'agobiado'],
    depresion: ['triste', 'deprimido', 'vacío', 'sin esperanza', 'desesperado', 'solo', 'aislado'],
    estres: ['estrés', 'presión', 'agobiado', 'abrumado', 'cansado', 'exhausto', 'sobrecargado'],
    positivo: ['bien', 'mejor', 'feliz', 'contento', 'tranquilo', 'esperanza', 'motivado']
};

// ==========================================
// FUNCIONES DE NAVEGACIÓN
// ==========================================

/**
 * Muestra una sección específica y oculta las demás
 */
function showSection(sectionName) {
    // Ocultar todas las secciones
    const sections = ['welcomeSection', 'chatSection', 'testSection', 'resourcesSection'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        currentSection = sectionName;
        
        // Scroll suave al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Inicializar sección si es necesario
    if (sectionName === 'test' && currentQuestionIndex === 0) {
        initTest();
    }
}

// ==========================================
// FUNCIONALIDAD DEL CHAT
// ==========================================

/**
 * Envía un mensaje del usuario
 */
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Agregar mensaje del usuario
    addMessageToChat(message, 'user');
    chatHistory.push({ role: 'user', content: message });
    
    // Limpiar input
    input.value = '';
    
    // Mostrar indicador de escritura
    showTypingIndicator();
    
    // Generar respuesta después de un delay
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateAIResponse(message);
        addMessageToChat(response, 'bot');
        chatHistory.push({ role: 'bot', content: response });
    }, 1500);
}

/**
 * Agrega un mensaje al chat
 */
function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'bot' ? '🤖' : '👤';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Convertir saltos de línea en párrafos
    const paragraphs = message.split('\n').filter(p => p.trim() !== '');
    paragraphs.forEach(para => {
        const p = document.createElement('p');
        p.textContent = para;
        content.appendChild(p);
    });
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    
    // Scroll automático al último mensaje
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Muestra indicador de que el bot está escribiendo
 */
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Oculta el indicador de escritura
 */
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Genera respuesta inteligente basada en el mensaje del usuario
 */
function generateAIResponse(userMessage) {
    const messageLower = userMessage.toLowerCase();
    
    // Detectar crisis inmediata
    if (containsKeywords(messageLower, keywordAnalysis.crisis)) {
        return "Noto que estás pasando por un momento muy difícil y me preocupa tu bienestar. Es muy importante que busques ayuda profesional inmediata.\n\nPor favor, contacta ahora mismo:\n🚨 Línea 106 (atención en crisis 24/7)\n🚑 Línea 123 (emergencias)\n\nNo estás solo/a. Hay personas capacitadas esperando para ayudarte. ¿Puedes llamar a alguna de estas líneas ahora?";
    }
    
    // Detectar ansiedad
    if (containsKeywords(messageLower, keywordAnalysis.ansiedad)) {
        return "Entiendo que te sientes ansioso/a. La ansiedad es una respuesta común al estrés, pero hay formas de manejarla.\n\nAlgunas estrategias que pueden ayudarte:\n• Técnicas de respiración profunda\n• Ejercicio físico regular\n• Hablar con alguien de confianza\n• Establecer límites saludables\n\nTe recomendaría hablar con un profesional que pueda darte herramientas específicas. ¿Te gustaría que te muestre los recursos de apoyo disponibles?";
    }
    
    // Detectar depresión
    if (containsKeywords(messageLower, keywordAnalysis.depresion)) {
        return "Lamento mucho que te sientas así. Sentirse triste o vacío/a es algo que muchas personas experimentan, y es importante que sepas que hay ayuda disponible.\n\nLa depresión es una condición real y tratable. Un profesional de salud mental puede ayudarte a:\n• Entender lo que estás sintiendo\n• Desarrollar estrategias de afrontamiento\n• Recuperar tu bienestar\n\n¿Te gustaría conocer los servicios de apoyo psicológico disponibles para ti?";
    }
    
    // Detectar estrés académico
    if (containsKeywords(messageLower, keywordAnalysis.estres) || 
        messageLower.includes('estudio') || messageLower.includes('examen') || 
        messageLower.includes('tarea') || messageLower.includes('universidad')) {
        return "El estrés académico es muy común entre estudiantes universitarios. Es positivo que reconozcas cómo te sientes.\n\nAlgunas sugerencias:\n• Organiza tu tiempo con un calendario\n• Divide las tareas grandes en pasos pequeños\n• Toma descansos regulares\n• No dudes en pedir ayuda a tus profesores\n\nLa universidad también tiene servicios de bienestar estudiantil que pueden orientarte. ¿Te interesaría realizar nuestro test de bienestar para tener una evaluación más completa?";
    }
    
    // Respuestas positivas
    if (containsKeywords(messageLower, keywordAnalysis.positivo)) {
        return "Me alegra mucho escuchar que te sientes así. Mantener una perspectiva positiva es muy valioso para tu bienestar.\n\nRecuerda seguir cuidando de ti mismo/a:\n• Mantén tus rutinas saludables\n• Cultiva tus relaciones\n• Celebra tus logros\n\nSi en algún momento necesitas apoyo, siempre puedes volver aquí. ¿Hay algo más en lo que pueda ayudarte hoy?";
    }
    
    // Respuesta genérica empática
    const genericResponses = [
        "Gracias por compartir esto conmigo. Entiendo que puede ser difícil hablar sobre cómo te sientes. ¿Puedes contarme un poco más sobre lo que estás experimentando?",
        "Aprecio tu confianza al hablar conmigo. Tu bienestar es importante. ¿Cómo ha sido esto para ti en los últimos días?",
        "Escucho lo que me dices. A veces puede ayudar poner en palabras lo que sentimos. ¿Hay algo específico que te gustaría que te ayude a explorar?",
        "Entiendo. Es valiente de tu parte buscar apoyo. ¿Te gustaría realizar nuestro test de bienestar o prefieres seguir conversando sobre lo que te preocupa?"
    ];
    
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

/**
 * Verifica si el texto contiene palabras clave específicas
 */
function containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
}

/**
 * Permite enviar mensaje con Enter
 */
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// ==========================================
// FUNCIONALIDAD DEL TEST PSICOLÓGICO
// ==========================================

/**
 * Inicializa el test psicológico
 */
function initTest() {
    currentQuestionIndex = 0;
    testAnswers = [];
    document.getElementById('totalQuestions').textContent = testQuestions.length;
    displayQuestion();
}

/**
 * Muestra la pregunta actual
 */
function displayQuestion() {
    const question = testQuestions[currentQuestionIndex];
    const questionCard = document.getElementById('questionCard');
    const resultsDiv = document.getElementById('testResults');
    
    // Mostrar pregunta, ocultar resultados
    questionCard.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
    
    // Actualizar progreso
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Mostrar pregunta
    document.getElementById('questionText').textContent = question.question;
    
    // Crear opciones
    const optionsDiv = document.getElementById('testOptions');
    optionsDiv.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option.text;
        button.onclick = () => selectAnswer(option.value, button);
        optionsDiv.appendChild(button);
    });
}

/**
 * Selecciona una respuesta y avanza
 */
function selectAnswer(value, button) {
    // Marcar como seleccionada visualmente
    const allButtons = document.querySelectorAll('.option-button');
    allButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    
    // Guardar respuesta
    testAnswers.push(value);
    
    // Avanzar después de un breve delay
    setTimeout(() => {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < testQuestions.length) {
            displayQuestion();
        } else {
            showResults();
        }
    }, 500);
}

/**
 * Calcula y muestra los resultados del test
 */
function showResults() {
    const questionCard = document.getElementById('questionCard');
    const resultsDiv = document.getElementById('testResults');
    
    // Ocultar preguntas, mostrar resultados
    questionCard.classList.add('hidden');
    resultsDiv.classList.remove('hidden');
    
    // Calcular puntuación
    const totalScore = testAnswers.reduce((sum, val) => sum + val, 0);
    const maxScore = testQuestions.length * 4;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    // Determinar nivel de riesgo y recomendaciones
    let level, message, recommendations, scoreClass;
    
    if (percentage <= 35) {
        level = "Bienestar Óptimo";
        scoreClass = "success";
        message = "Tus respuestas indican que te encuentras en un buen estado emocional y de bienestar general. Continúa cuidando tu salud mental con las prácticas que has mantenido.";
        recommendations = [
            "Mantén tus rutinas saludables de sueño y alimentación",
            "Continúa cultivando tus relaciones personales",
            "Practica actividades que disfrutes regularmente",
            "Considera técnicas de mindfulness para mantener tu equilibrio"
        ];
    } else if (percentage <= 55) {
        level = "Atención Preventiva";
        scoreClass = "warning";
        message = "Tus respuestas sugieren que podrías beneficiarte de apoyo adicional. Es normal experimentar altibajos, pero es importante atenderlos antes de que se intensifiquen.";
        recommendations = [
            "Considera hablar con un orientador o psicólogo",
            "Establece rutinas de autocuidado diarias",
            "Identifica y reduce fuentes de estrés cuando sea posible",
            "Conéctate con servicios de bienestar estudiantil",
            "Practica técnicas de relajación regularmente"
        ];
    } else if (percentage <= 75) {
        level = "Atención Recomendada";
        scoreClass = "danger";
        message = "Tus respuestas indican que estás experimentando dificultades significativas. Es importante que busques apoyo profesional pronto. No estás solo/a en esto.";
        recommendations = [
            "Contacta los servicios de psicología de la universidad",
            "Habla con alguien de confianza sobre cómo te sientes",
            "Considera terapia psicológica profesional",
            "Revisa los recursos de apoyo disponibles en la sección correspondiente",
            "Establece una red de apoyo con amigos y familia"
        ];
    } else {
        level = "Atención Urgente";
        scoreClass = "emergency";
        message = "Tus respuestas indican que estás pasando por un momento muy difícil. Es crucial que busques ayuda profesional inmediatamente. Tu bienestar es lo más importante.";
        recommendations = [
            "URGENTE: Contacta la Línea 106 (atención en crisis 24/7)",
            "Llama a la Línea 123 si sientes que estás en peligro",
            "Acude al servicio de urgencias más cercano si es necesario",
            "Informa a un familiar o amigo cercano sobre cómo te sientes",
            "No te quedes solo/a, busca compañía de personas de confianza"
        ];
    }
    
    // Mostrar resultados
    document.getElementById('resultScore').innerHTML = `
        <div class="${scoreClass}">${percentage}%</div>
    `;
    
    document.getElementById('resultMessage').innerHTML = `
        <h4>${level}</h4>
        <p>${message}</p>
    `;
    
    const recList = recommendations.map(rec => `<li>${rec}</li>`).join('');
    document.getElementById('resultRecommendations').innerHTML = `
        <h4>Recomendaciones:</h4>
        <ul>${recList}</ul>
    `;
    
    // Scroll al inicio de resultados
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Reinicia el test
 */
function restartTest() {
    currentQuestionIndex = 0;
    testAnswers = [];
    initTest();
    document.getElementById('testSection').scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

// Mostrar sección de bienvenida al cargar
document.addEventListener('DOMContentLoaded', function() {
    showSection('welcome');
    
    console.log('✅ Plataforma de Bienestar Estudiantil cargada correctamente');
    console.log('📱 IU Digital de Antioquia - Sistema de Apoyo Psicológico');
});
