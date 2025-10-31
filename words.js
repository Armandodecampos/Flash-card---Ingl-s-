const card = document.querySelector('.card');
const front = document.querySelector('.front');
const back = document.querySelector('.back');
const flipBtn = document.getElementById('flip-btn');
const nextBtn = document.getElementById('next-btn');
const audioBtn = document.getElementById('audio-btn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

let currentWord = '';

// The original flashcards are kept to maintain the difficulty levels
let flashcards = [
    // Easy
    { english: 'Hello', portuguese: 'Olá (Saudação informal)', difficulty: 'easy' },
    { english: 'Goodbye', portuguese: 'Adeus (Formal), Tchau (Informal)', difficulty: 'easy' },
    { english: 'Yes', portuguese: 'Sim (Concordância)', difficulty: 'easy' },
    { english: 'No', portuguese: 'Não (Negação)', difficulty: 'easy' },
    { english: 'Thank you', portuguese: 'Obrigado (dito por homem), Obrigada (dito por mulher)', difficulty: 'easy' },
    { english: 'Please', portuguese: 'Por favor (Pedido educado)', difficulty: 'easy' },
    { english: 'Sorry', portuguese: 'Desculpe (Pedido de desculpas)', difficulty: 'easy' },
    { english: 'Water', portuguese: 'Água (Substantivo)', difficulty: 'easy' },
    { english: 'Food', portuguese: 'Comida, Alimento (Substantivo)', difficulty: 'easy' },
    { english: 'Sun', portuguese: 'Sol (Estrela no centro do nosso sistema solar)', difficulty: 'easy' },

    // Medium
    { english: 'Friend', portuguese: 'Amigo(a) (Pessoa próxima)', difficulty: 'medium' },
    { english: 'Family', portuguese: 'Família (Parentes)', difficulty: 'medium' },
    { english: 'Work', portuguese: 'Trabalho (Atividade profissional), Obra (de arte, etc.)', difficulty: 'medium' },
    { english: 'City', portuguese: 'Cidade (Área urbana)', difficulty: 'medium' },
    { english: 'Country', portuguese: 'País (Nação), Campo (Área rural)', difficulty: 'medium' },
    { english: 'Language', portuguese: 'Língua, Idioma (Sistema de comunicação)', difficulty: 'medium' },
    { english: 'Journey', portuguese: 'Jornada, Viagem (geralmente longa)', difficulty: 'medium' },
    { english: 'Weather', portuguese: 'Tempo, Clima (Condições atmosféricas)', difficulty: 'medium' },
    { english: 'Knowledge', portuguese: 'Conhecimento, Saber (Informação adquirida)', difficulty: 'medium' },
    { english: 'Strength', portuguese: 'Força, Vigor (Capacidade física ou mental)', difficulty: 'medium' },

    // Hard
    { english: 'Nevertheless', portuguese: 'No entanto, Contudo, Todavia (Adversativa)', difficulty: 'hard' },
    { english: 'Furthermore', portuguese: 'Além disso, Adicionalmente (Aditiva)', difficulty: 'hard' },
    { english: 'Inconspicuous', portuguese: 'Discreto, Imperceptível, Pouco visível', difficulty: 'hard' },
    { english: 'Ubiquitous', portuguese: 'Onipresente, Ubíquo (Presente em todo lugar)', difficulty: 'hard' },
    { english: 'Ephemeral', portuguese: 'Efêmero, Passageiro, De curta duração', difficulty: 'hard' },
    { english: 'Meticulous', portuguese: 'Meticuloso, Criterioso, Cuidadoso (Extremo detalhe)', difficulty: 'hard' },
    { english: 'Conundrum', portuguese: 'Enigma, Dilema, Problema difícil', difficulty: 'hard' },
    { english: 'Serendipity', portuguese: 'Serendipidade, Feliz acaso (Descoberta afortunada)', difficulty: 'hard' },
    { english: 'Mellifluous', portuguese: 'Melífluo, Suave, Doce (Som agradável)', difficulty: 'hard' },
    { english: 'Exacerbate', portuguese: 'Exacerbar, Agraviar, Piorar (uma situação)', difficulty: 'hard' }
];

let currentDifficulty = 'easy';
let filteredFlashcards = [];
let currentCard = 0;
let shuffledIndices = [];

// Function to fetch a random word and its translation
async function fetchRandomWord() {
    try {
        // Fetch a random English word
        const wordResponse = await fetch('https://random-word-api.herokuapp.com/word?number=1');
        const wordData = await wordResponse.json();
        const randomWord = wordData[0];

        // Translate the word to Portuguese
        const translationResponse = await fetch(`https://api.mymemory.translated.net/get?q=${randomWord}&langpair=en|pt`);
        const translationData = await translationResponse.json();
        const portugueseTranslation = translationData.responseData.translatedText;

        return {
            english: randomWord,
            portuguese: portugueseTranslation
        };
    } catch (error) {
        console.error('Error fetching random word:', error);
        return null;
    }
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;

    difficultyBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === difficulty) {
            btn.classList.add('active');
        }
    });

    // The "dictionary" difficulty will fetch random words online
    if (difficulty !== 'dictionary') {
        filteredFlashcards = flashcards.filter(card => card.difficulty === currentDifficulty);
        currentCard = -1;
        getShuffledIndices();
    }

    nextCard();
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

function getShuffledIndices() {
    shuffledIndices = [...Array(filteredFlashcards.length).keys()];
    shuffle(shuffledIndices);
}

function showCard() {
    if (shuffledIndices.length === 0) return;
    const cardIndex = shuffledIndices[currentCard];
    front.textContent = filteredFlashcards[cardIndex].english;
    back.textContent = filteredFlashcards[cardIndex].portuguese;
    currentWord = filteredFlashcards[cardIndex].english;
    card.classList.remove('flipped');
}

function flipCard() {
    card.classList.toggle('flipped');
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

async function nextCard() {
    if (currentDifficulty === 'dictionary') {
        front.textContent = 'Loading...';
        back.textContent = '';
        const wordData = await fetchRandomWord();
        if (wordData) {
            front.textContent = wordData.english;
            back.textContent = wordData.portuguese;
            currentWord = wordData.english;
            card.classList.remove('flipped');
        } else {
            front.textContent = 'Error fetching word.';
            back.textContent = 'Please try again.';
        }
    } else {
        if (filteredFlashcards.length === 0) {
            front.textContent = "No words found for this difficulty.";
            back.textContent = "";
            return;
        }
        currentCard++;
        if (currentCard >= shuffledIndices.length) {
            currentCard = 0;
            getShuffledIndices();
        }
        showCard();
    }
}

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setDifficulty(btn.dataset.difficulty);
    });
});

flipBtn.addEventListener('click', flipCard);
nextBtn.addEventListener('click', nextCard);
audioBtn.addEventListener('click', () => {
    speak(currentWord);
});

// Initialize with easy difficulty
setDifficulty('easy');
