// Game state variables
let currentSentence = "";
let score = 0;
let hasScored = false;
let customSentences = [];
let currentSentenceBank = "default";
let gameStarted = false;
let gameComplete = false;
let ttsSetting = false; 

const sentences = [
    "The cat sat on the mat",
    "I love to play video games",
    "She reads books every day",
    "Winter is coming soon",
    "Migratory birds fly south for winter",
    "The sun rises in the east",
    "Children like to play in the park",
    "Time flies when having fun",
    "I can still recall my first crash-and-burn moment in school",
    "I didn't take the task seriously and skipped several group meetings",
    "I ruined the presentation and felt embarrassed in front of my classmates",
    "We got a very low grade, and I felt depressed about letting the team down",
    "You inspire me to connect with others and to communicate better",
    "When my friends and I hang out, I turn to you for Instagram updates and ignore everyone else",
    "My parents are both angry and disappointed with me",
    "Brown bears hibernate and that goldfish sleep without closing their eyes",
    "To avoid floating away, they lock their little paws together and hold on to each other",
    "According to studies, the birds may be able to stay in the air for up to two hundred days",
    "When one half of their brain goes to sleep, the other half stays awake to help them swim and breathe",
    "Due to their keen sense of smell, the dogs can detect infected trees",
    "The dogs are then taught to perform a certain kind of behavior as an alert when they come across these smells",
    "Once their training is complete, sniffer dogs are assigned to carry out specific duties",
    "some kids came along, bought some snacks, and took me along to the beach for a picnic",
    "When it was getting dark, they packed everything up and let me stay there alone",
    "I floated helplessly in the water for a while, but soon realized I wasn't alone",
    "Because of all the littering, a lot of plastic products end up in the ocean",
    "Over time, this outer layer has been exposed to the air and oxidized so much that it has turned green",
    "As always, Lady Liberty stands tall and proud",
    "Customers are lining up at cash registers to pay for their things anyway",
    "These customers might start off with just a beverage",
    "Shops take advantage of this opportunity by setting up bar-style seating areas",
    "These are displayed near cash registers and are thus easily noticed and within quick reach",
    "It comes in all shapes and sizes",
    "The gun represents violence, whereas the flower stands for peace",
    "It is nothing but visual pollution",
    "A lot of money and effort are needed to get rid of it",
    "Which side of the wall are you on when it comes to graffiti",
    "Garbage trucks rolled into the landfill and unloaded tons of trash",
    "People in the slum then looked through the trash for things they could recycle or sell",
    "This was how they made a living",
    "She really looked forward to the lessons",
    "She wanted to learn how to play the violin and be carried away by the power of music",
    "Screeches came out of the instruments",
    "As soon as the orchestra began to play, everyone cheered",
    "Most people have habits or behaviors that they would like to change for the better",
    "How can we make people more eager to take action and make positive changes",
    "A car company put up a new kind of traffic light at an intersection in Lisbon",
    "Thanks to this creative idea, more pedestrians began to follow the law",
    "An experiment was conducted with the goal of having people use the stairs rather than the escalator",
    "These depressing sights tore at his heart",
    "His efforts finally paid off when he completed his masterpiece"
];

function loadSettings() {
    try {
        const savedBank = localStorage.getItem('sentenceBank');
        const savedSentences = localStorage.getItem('customSentences');
        const savedTTSSetting = localStorage.getItem('ttsSetting');
        
        if (savedBank) {
            currentSentenceBank = savedBank;
            document.getElementById('sentenceSource').value = savedBank;
        }
        
        if (savedSentences) {
            customSentences = JSON.parse(savedSentences);
        }
        
        if (savedTTSSetting !== null) {
            ttsSetting = savedTTSSetting === 'true';
            updateTTSToggleButton();
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        // Reset to defaults if there's an error
        currentSentenceBank = "default";
        customSentences = [];
        ttsSetting = false;
    }
}

function saveSettings() {
    const source = document.getElementById('sentenceSource').value;
    const sentences = document.getElementById('customSentences').value
        .split('\n')
        .filter(s => s.trim());
    
    if (source === 'custom' && sentences.length < 5) {
        alert('Please enter at least 5 sentences for the custom sentence bank.');
        document.getElementById('sentenceSource').value = currentSentenceBank;
        return;
    }
    
    currentSentenceBank = source;
    customSentences = sentences;
    
    try {
        localStorage.setItem('sentenceBank', source);
        localStorage.setItem('customSentences', JSON.stringify(sentences));
        document.getElementById('settingsModal').style.display = 'none';
        
        // Only get a new sentence if the game is in progress and not complete
        if (gameStarted && !gameComplete) {
            newSentence();
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings. Please try again.');
    }
}

function toggleTTS() {
    ttsSetting = !ttsSetting;
    localStorage.setItem('ttsSetting', ttsSetting);
    updateTTSToggleButton();
}

function updateTTSToggleButton() {
    const ttsButton = document.getElementById('ttsToggle');
    if (ttsSetting) {
        ttsButton.textContent = "Voice: ON";
        ttsButton.classList.add('active');
    } else {
        ttsButton.textContent = "Voice: OFF";
        ttsButton.classList.remove('active');
    }
}

// TTS function to speak text
function speakText(text) {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower rate for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';
    
    window.speechSynthesis.speak(utterance);
}

// Speak word function - depends on ttsSetting
function speakWord(text) {
    if (!ttsSetting) return;
    speakText(text);
}

function getCurrentSentences() {
    return currentSentenceBank === 'custom' && customSentences.length > 0 
        ? customSentences 
        : sentences;  
}

function startGame() {
    gameStarted = true;
    gameComplete = false;
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('checkButton').style.display = 'inline';
    document.getElementById('skipButton').style.display = 'inline';
    document.getElementById('settingsButton').style.display = 'none';
    document.getElementById('directions').style.display = 'none';
    score = 0;
    document.getElementById('score').textContent = 'Score: 0';
    newSentence();
}

function newSentence() {
    if (gameComplete) return;
    
    // Show check and skip buttons for the new sentence
    document.getElementById('checkButton').style.display = 'inline';
    document.getElementById('skipButton').style.display = 'inline';
    
    // Hide next sentence and speak sentence buttons
    document.getElementById('nextSentenceButton').style.display = 'none';
    document.getElementById('speakSentenceButton').style.display = 'none';
    
    const sentences = getCurrentSentences();
    const randomIndex = Math.floor(Math.random() * sentences.length);
    currentSentence = sentences[randomIndex];
    
    const words = currentSentence.split(/\s+/);
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    
    const scrambledWordsDiv = document.getElementById('scrambledWords');
    scrambledWordsDiv.innerHTML = '';
    
    shuffledWords.forEach((word, index) => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        wordDiv.textContent = word;
        wordDiv.dataset.index = index;
        scrambledWordsDiv.appendChild(wordDiv);
    });
    
    document.getElementById('answerArea').innerHTML = '';
    selectedWords = [];
    hasScored = false;
    document.getElementById('feedback').textContent = '';
}

function checkAnswer() {
    const userAnswer = Array.from(document.getElementById('answerArea').children)
        .map(word => word.textContent)
        .join(' ');
    
    if (userAnswer.toLowerCase() === currentSentence.toLowerCase()) {
        if (!hasScored) {
            score++;
            hasScored = true;
            document.getElementById('score').textContent = `${score}`;
        }
        
        document.getElementById('feedback').textContent = '✨ Correct! ✨';
        
        // Hide check and skip buttons
        document.getElementById('checkButton').style.display = 'none';
        document.getElementById('skipButton').style.display = 'none';
        
        // Show the next sentence and speak sentence buttons
        document.getElementById('nextSentenceButton').style.display = 'inline';
        document.getElementById('speakSentenceButton').style.display = 'inline';
        
        // Mark game as complete but don't show victory modal yet if score is 5
        if (score >= 5) {
            gameComplete = true;
            // We've removed the showVictoryModal() call from here
        }
    } else {
        document.getElementById('feedback').textContent = '❌ Try again! ❌';
    }
}

function speakSentence() {
    // Always speak the sentence regardless of ttsSetting
    speakText(currentSentence);
}

async function showVictoryModal() {
    const modal = document.getElementById("victoryModal");
    const pokemonId = Math.floor(Math.random() * 898) + 1;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    const data = await response.json();
    const pokemonImageDiv = document.getElementById("pokemonImage");
    const img = document.createElement("img");
    img.src = data.sprites.other["official-artwork"].front_default;
    img.alt = `${data.name} Pokemon artwork`;
    img.width = 300;
    img.height = 300;
    pokemonImageDiv.innerHTML = "";
    pokemonImageDiv.appendChild(img);
    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("victoryModal").style.display = "none";
    resetGame();
}

function resetGame() {
    gameStarted = false;
    gameComplete = false;
    score = 0;
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('startButton').style.display = 'inline';
    document.getElementById('checkButton').style.display = 'none';
    document.getElementById('skipButton').style.display = 'none';
    document.getElementById('nextSentenceButton').style.display = 'none';
    document.getElementById('speakSentenceButton').style.display = 'none';
    document.getElementById('feedback').textContent = '';
    document.getElementById('scrambledWords').innerHTML = '';
    document.getElementById('answerArea').innerHTML = '';
    document.getElementById('settingsButton').style.display = 'inline';
}

function handleWordSelection(event) {
    if (!gameStarted || gameComplete) return;
    
    const clickedElement = event.target;
    if (!clickedElement.classList.contains('word')) return;
    
    const sourceArea = clickedElement.parentElement.id;
    const targetArea = sourceArea === 'scrambledWords' ? 'answerArea' : 'scrambledWords';
    
    document.getElementById(targetArea).appendChild(clickedElement);
    
    // If moving from scrambled words to answer area, speak the word (controlled by ttsSetting)
    if (sourceArea === 'scrambledWords') {
        speakWord(clickedElement.textContent);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    
    // Event Listeners
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('checkButton').addEventListener('click', checkAnswer);
    document.getElementById('skipButton').addEventListener('click', newSentence);
    
    // Modified the nextSentenceButton event listener to check if victory modal should be shown
    document.getElementById('nextSentenceButton').addEventListener('click', () => {
        if (gameComplete) {
            showVictoryModal(); // Show victory modal when clicking "Next Sentence" after completing 5 sentences
        } else {
            newSentence();
        }
    });
    
    document.getElementById('speakSentenceButton').addEventListener('click', speakSentence);
    document.getElementById('ttsToggle').addEventListener('click', toggleTTS);
    document.getElementById('scrambledWords').addEventListener('click', handleWordSelection);
    document.getElementById('answerArea').addEventListener('click', handleWordSelection);
    
    // Add directions button handler
    document.getElementById('directionsButton').addEventListener('click', () => {
        const directions = document.getElementById('directions');
        directions.style.display = directions.style.display === 'none' ? 'block' : 'none';
    });
    
    document.getElementById('settingsButton').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'block';
        document.getElementById('customSentences').value = customSentences.join('\n');
        document.getElementById('sentenceSource').value = currentSentenceBank;
    });
    
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('settingsModal');
        const modalContent = modal.querySelector('.modal-content');
        if (event.target === modal && !modalContent.contains(event.target)) {
            modal.style.display = 'none';
        }
    });
    
    // Initialize TTS button state
    updateTTSToggleButton();
    
    // Check if browser supports speech synthesis
    if (!window.speechSynthesis) {
        document.getElementById('ttsToggle').style.display = 'none';
        document.getElementById('speakSentenceButton').style.display = 'none';
        console.error('Browser does not support speech synthesis');
    }
});
