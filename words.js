const card = document.querySelector('.card');
const front = document.querySelector('.front');
const back = document.querySelector('.back');
const flipBtn = document.getElementById('flip-btn');
const nextBtn = document.getElementById('next-btn');
const audioBtn = document.getElementById('audio-btn');

let currentWord = '';

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

function flipCard() {
    card.classList.toggle('flipped');
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

async function nextCard() {
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
}

flipBtn.addEventListener('click', flipCard);
nextBtn.addEventListener('click', nextCard);
audioBtn.addEventListener('click', () => {
    speak(currentWord);
});

// Initialize with a random word
nextCard();
