const card = document.querySelector('.card');
const front = document.querySelector('.front');
const back = document.querySelector('.back');
const flipBtn = document.getElementById('flip-btn');
const nextBtn = document.getElementById('next-btn');
const audioBtn = document.getElementById('audio-btn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');

let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];

let currentDifficulty = 'easy';
let filteredFlashcards = [];
let currentCard = 0;
let shuffledIndices = [];

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    filteredFlashcards = flashcards.filter(card => card.difficulty === currentDifficulty);

    difficultyBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === difficulty) {
            btn.classList.add('active');
        }
    });

    currentCard = -1;
    getShuffledIndices();
    nextCard();
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

function getShuffledIndices() {
    shuffledIndices = [...Array(filteredFlashcards.length).keys()];
    shuffle(shuffledIndices);
}

function showCard() {
    if (filteredFlashcards.length === 0) {
        front.textContent = "No cards for this difficulty.";
        back.textContent = "";
        return;
    }
    if (shuffledIndices.length === 0) return;
    const cardIndex = shuffledIndices[currentCard];
    front.textContent = filteredFlashcards[cardIndex].english;
    back.textContent = filteredFlashcards[cardIndex].portuguese;
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

function nextCard() {
    if (filteredFlashcards.length === 0) {
        front.textContent = "Nenhuma palavra encontrada para esta dificuldade.";
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

async function searchWord(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
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
    if (filteredFlashcards.length > 0 && shuffledIndices.length > 0) {
        const textToSpeak = filteredFlashcards[shuffledIndices[currentCard]].english;
        speak(textToSpeak);
    }
});

searchBtn.addEventListener('click', async () => {
    const word = searchInput.value;
    if (word) {
        const data = await searchWord(word);
        displaySearchResults(data);
    }
});

function displaySearchResults(data) {
    searchResults.innerHTML = '';
    if (data && data.length > 0) {
        const entry = data[0];
        const definition = entry.meanings[0].definitions[0].definition;
        const portugueseTranslation = findPortugueseTranslation(entry);

        const resultEl = document.createElement('div');
        resultEl.innerHTML = `
            <h3>${entry.word}</h3>
            <p><strong>Definition:</strong> ${definition}</p>
            <p><strong>Portuguese:</strong> ${portugueseTranslation || 'Not found'}</p>
            <button class="add-flashcard-btn" data-english="${entry.word}" data-portuguese="${portugueseTranslation || 'Not found'}">Add to Flashcards</button>
            <div class="difficulty-options">
                <button class="difficulty-choice-btn" data-difficulty="easy">Easy</button>
                <button class="difficulty-choice-btn" data-difficulty="medium">Medium</button>
                <button class="difficulty-choice-btn" data-difficulty="hard">Hard</button>
            </div>
        `;
        searchResults.appendChild(resultEl);

        const addFlashcardBtn = resultEl.querySelector('.add-flashcard-btn');
        const difficultyChoiceBtns = resultEl.querySelectorAll('.difficulty-choice-btn');
        let selectedDifficulty = 'easy';

        difficultyChoiceBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyChoiceBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedDifficulty = btn.dataset.difficulty;
            });
        });

        addFlashcardBtn.addEventListener('click', () => {
            const english = addFlashcardBtn.dataset.english;
            const portuguese = addFlashcardBtn.dataset.portuguese;
            if (portuguese !== 'Not found') {
                flashcards.push({ english, portuguese, difficulty: selectedDifficulty });
                saveFlashcards();
                setDifficulty(currentDifficulty); // Refresh the flashcards
            }
        });
    } else {
        searchResults.innerHTML = '<p>Word not found.</p>';
    }
}

function findPortugueseTranslation(entry) {
    for (const meaning of entry.meanings) {
        for (const definition of meaning.definitions) {
            if (definition.translations) {
                const ptTranslation = definition.translations.find(t => t.language.code === 'pt');
                if (ptTranslation) {
                    return ptTranslation.word;
                }
            }
        }
    }
    return null;
}

function saveFlashcards() {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
}

// Initialize with easy difficulty
setDifficulty('easy');
