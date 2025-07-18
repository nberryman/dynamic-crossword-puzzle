class CrosswordGame {
    constructor() {
        this.grid = [];
        this.gridSize = 25; // Increased grid size for better word placement
        this.words = [];
        this.currentWord = null;
        this.currentDirection = 'across';
        this.isDarkMode = this.loadDarkModePreference();
        this.wordLists = {};
        this.puzzleCompleted = false;
        this.hintsUsed = 0;
        this.maxHints = 5;
        this.currentWordListSelection = null;
        this.lastClickedCell = null; // Track last clicked cell for direction toggling
        this.isAutoNavigating = false; // Track when we're automatically moving to next cell
        
        this.initialize();
    }
    
    async initialize() {
        await this.initializeWordLists();
        this.initializeEventListeners();
        this.applyDarkModePreference();
    }

    async initializeWordLists() {
        // Load puzzles from external file (now loaded via script tag)
        if (window.puzzles) {
            this.wordLists = {};
            this.invalidWordLists = {};
            
            // Validate each word list and only include valid ones
            Object.keys(window.puzzles).forEach(category => {
                const wordList = window.puzzles[category];
                const errors = this.validateWordList(wordList);
                
                if (errors[0] === "Word list is valid") {
                    this.wordLists[category] = wordList;
                } else {
                    this.invalidWordLists[category] = {
                        wordList: wordList,
                        errors: errors
                    };
                    console.error(`❌ Invalid word list "${category}":`, errors);
                }
            });
            
            console.log(`✅ Loaded ${Object.keys(this.wordLists).length} valid word lists`);
            if (Object.keys(this.invalidWordLists).length > 0) {
                console.log(`❌ Found ${Object.keys(this.invalidWordLists).length} invalid word lists:`, Object.keys(this.invalidWordLists));
            }
            
            // Update dropdown to only show valid categories
            this.updateWordListDropdown();
        } else {
            console.error('Puzzles not loaded, using fallback');
            // Fallback to embedded puzzles
            this.wordLists = {
                animals: [
                    { word: "ELEPHANT", clue: "Largest land animal" },
                    { word: "TIGER", clue: "Striped big cat" },
                    { word: "DOLPHIN", clue: "Intelligent marine mammal" },
                    { word: "EAGLE", clue: "National bird of America" },
                    { word: "BEAR", clue: "Large forest mammal" },
                    { word: "WOLF", clue: "Pack hunting canine" },
                    { word: "ZEBRA", clue: "Striped African horse" },
                    { word: "GIRAFFE", clue: "Tallest animal in the world" },
                    { word: "PENGUIN", clue: "Flightless Antarctic bird" },
                    { word: "KANGAROO", clue: "Hopping Australian marsupial" }
                ],
                plants: [
                    { word: "ROSE", clue: "Thorny romantic flower" },
                    { word: "TULIP", clue: "Dutch spring bulb flower" },
                    { word: "CACTUS", clue: "Desert plant with spines" },
                    { word: "BAMBOO", clue: "Fast-growing Asian grass" },
                    { word: "ORCHID", clue: "Exotic tropical flower" },
                    { word: "FERN", clue: "Ancient spore-bearing plant" },
                    { word: "MAPLE", clue: "Tree known for syrup" },
                    { word: "LAVENDER", clue: "Purple fragrant herb" },
                    { word: "SUNFLOWER", clue: "Tall yellow flower that tracks the sun" },
                    { word: "DAISY", clue: "White petaled common flower" }
                ],
                computers: [
                    { word: "KEYBOARD", clue: "Input device with keys" },
                    { word: "MONITOR", clue: "Computer display screen" },
                    { word: "MOUSE", clue: "Pointing device for computers" },
                    { word: "PIXEL", clue: "Smallest unit of a digital image" },
                    { word: "BROWSER", clue: "Software for viewing websites" },
                    { word: "SERVER", clue: "Computer that provides services" },
                    { word: "CODING", clue: "Writing computer programs" },
                    { word: "VIRUS", clue: "Malicious computer program" },
                    { word: "BACKUP", clue: "Copy of data for safety" },
                    { word: "WEBSITE", clue: "Collection of web pages" }
                ],
                bugs: [
                    { word: "BUTTERFLY", clue: "Colorful winged insect" },
                    { word: "SPIDER", clue: "Eight-legged web spinner" },
                    { word: "BEETLE", clue: "Hard-shelled insect" },
                    { word: "CRICKET", clue: "Chirping jumping insect" },
                    { word: "DRAGONFLY", clue: "Fast-flying pond insect" },
                    { word: "LADYBUG", clue: "Red spotted beneficial beetle" },
                    { word: "MOSQUITO", clue: "Blood-sucking flying pest" },
                    { word: "FIREFLY", clue: "Bioluminescent evening insect" },
                    { word: "CATERPILLAR", clue: "Butterfly larva stage" },
                    { word: "GRASSHOPPER", clue: "Green jumping field insect" }
                ],
                fish: [
                    { word: "SALMON", clue: "Pink fish that swims upstream" },
                    { word: "SHARK", clue: "Predatory ocean fish" },
                    { word: "TUNA", clue: "Large commercial fish" },
                    { word: "GOLDFISH", clue: "Popular orange pet fish" },
                    { word: "TROUT", clue: "Freshwater sport fish" },
                    { word: "BASS", clue: "Popular game fish" },
                    { word: "SWORDFISH", clue: "Fish with a long pointed bill" },
                    { word: "ANGELFISH", clue: "Tropical aquarium fish" },
                    { word: "CATFISH", clue: "Bottom-dwelling whiskered fish" },
                    { word: "SEAHORSE", clue: "Horse-shaped marine fish" }
                ]
            };
        }
    }

    updateWordListDropdown() {
        const selector = document.getElementById('wordListSelector');
        if (selector) {
            // Clear existing options
            selector.innerHTML = '';
            
            // Add valid word lists to dropdown
            Object.keys(this.wordLists).sort().forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                selector.appendChild(option);
            });
            
            // Show validation summary in the validation results div
            this.displayValidationSummary();
        }
    }

    displayValidationSummary() {
        const resultsDiv = document.getElementById('validationResults');
        if (resultsDiv) {
            const validCount = Object.keys(this.wordLists).length;
            const invalidCount = Object.keys(this.invalidWordLists).length;
            
            if (invalidCount === 0) {
                resultsDiv.innerHTML = `<div class="text-green-600 text-sm">✅ All ${validCount} word lists are valid!</div>`;
                resultsDiv.className = 'mt-4 p-3 rounded text-sm bg-green-50 border border-green-200';
            } else {
                let html = `<div class="text-red-600 font-semibold">❌ ${invalidCount} invalid word lists found:</div>`;
                Object.keys(this.invalidWordLists).forEach(category => {
                    const errors = this.invalidWordLists[category].errors;
                    html += `<div class="mt-2"><strong>${category}:</strong></div>`;
                    errors.forEach(error => {
                        html += `<div class="ml-4 text-sm">• ${error}</div>`;
                    });
                });
                html += `<div class="mt-2 text-sm text-gray-600">${validCount} valid word lists are available for play.</div>`;
                resultsDiv.innerHTML = html;
                resultsDiv.className = 'mt-4 p-3 rounded text-sm bg-red-50 border border-red-200';
            }
        }
    }

    validateWordList(list) {
        const errors = [];
        const words = new Set();
        const clues = new Set();

        list.forEach(({ word, clue }) => {
            if (!/^[A-Z]+$/.test(word)) {
                errors.push(`Invalid characters in word "${word}"`);
            }
            if (words.has(word)) {
                errors.push(`Duplicate word: "${word}"`);
            }
            if (clues.has(clue)) {
                errors.push(`Duplicate clue: "${clue}"`);
            }
            words.add(word);
            clues.add(clue);
        });

        return errors.length ? errors : ["Word list is valid"];
    }

    initializeGrid() {
        this.grid = Array(this.gridSize).fill().map(() => 
            Array(this.gridSize).fill().map(() => ({
                letter: '',
                isBlack: true,
                numbers: [],
                acrossWord: null,
                downWord: null,
                userInput: ''
            }))
        );
    }

    findIntersections(word1, word2) {
        const intersections = [];
        for (let i = 0; i < word1.length; i++) {
            for (let j = 0; j < word2.length; j++) {
                if (word1[i] === word2[j]) {
                    intersections.push({ word1Index: i, word2Index: j });
                }
            }
        }
        return intersections;
    }

    canPlaceWordProperly(word, row, col, direction) {
        const wordLength = word.length;
        
        if (direction === 'across') {
            if (col + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const currentRow = row;
                const currentCol = col + i;
                const cell = this.grid[currentRow][currentCol];
                
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
                
                if (cell.letter === '') {
                    let needsDownWord = false;
                    
                    if (currentRow > 0 && !this.grid[currentRow - 1][currentCol].isBlack) {
                        needsDownWord = true;
                    }
                    if (currentRow < this.gridSize - 1 && !this.grid[currentRow + 1][currentCol].isBlack) {
                        needsDownWord = true;
                    }
                    
                    if (needsDownWord) {
                        let hasValidDownWord = false;
                        for (const placedWord of this.words) {
                            if (placedWord.direction === 'down') {
                                const wordStartRow = placedWord.row;
                                const wordEndRow = placedWord.row + placedWord.word.length - 1;
                                if (placedWord.col === currentCol && 
                                    currentRow >= wordStartRow && 
                                    currentRow <= wordEndRow) {
                                    hasValidDownWord = true;
                                    break;
                                }
                            }
                        }
                        if (!hasValidDownWord) return false;
                    }
                }
            }
            
            if (col > 0 && !this.grid[row][col - 1].isBlack) return false;
            if (col + wordLength < this.gridSize && !this.grid[row][col + wordLength].isBlack) return false;
        } else {
            if (row + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const currentRow = row + i;
                const currentCol = col;
                const cell = this.grid[currentRow][currentCol];
                
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
                
                if (cell.letter === '') {
                    let needsAcrossWord = false;
                    
                    if (currentCol > 0 && !this.grid[currentRow][currentCol - 1].isBlack) {
                        needsAcrossWord = true;
                    }
                    if (currentCol < this.gridSize - 1 && !this.grid[currentRow][currentCol + 1].isBlack) {
                        needsAcrossWord = true;
                    }
                    
                    if (needsAcrossWord) {
                        let hasValidAcrossWord = false;
                        for (const placedWord of this.words) {
                            if (placedWord.direction === 'across') {
                                const wordStartCol = placedWord.col;
                                const wordEndCol = placedWord.col + placedWord.word.length - 1;
                                if (placedWord.row === currentRow && 
                                    currentCol >= wordStartCol && 
                                    currentCol <= wordEndCol) {
                                    hasValidAcrossWord = true;
                                    break;
                                }
                            }
                        }
                        if (!hasValidAcrossWord) return false;
                    }
                }
            }
            
            if (row > 0 && !this.grid[row - 1][col].isBlack) return false;
            if (row + wordLength < this.gridSize && !this.grid[row + wordLength][col].isBlack) return false;
        }
        
        return true;
    }

    canPlaceWordBasic(word, row, col, direction) {
        const wordLength = word.length;
        
        if (direction === 'across') {
            if (col + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const cell = this.grid[row][col + i];
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
            }
            
            if (col > 0 && !this.grid[row][col - 1].isBlack) return false;
            if (col + wordLength < this.gridSize && !this.grid[row][col + wordLength].isBlack) return false;
        } else {
            if (row + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const cell = this.grid[row + i][col];
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
            }
            
            if (row > 0 && !this.grid[row - 1][col].isBlack) return false;
            if (row + wordLength < this.gridSize && !this.grid[row + wordLength][col].isBlack) return false;
        }
        
        return true;
    }

    canPlaceWord(word, row, col, direction) {
        const wordLength = word.length;
        
        if (direction === 'across') {
            if (col + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const cell = this.grid[row][col + i];
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
            }
            
            if (col > 0 && !this.grid[row][col - 1].isBlack) return false;
            if (col + wordLength < this.gridSize && !this.grid[row][col + wordLength].isBlack) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const currentCol = col + i;
                const cell = this.grid[row][currentCol];
                
                if (cell.letter === '') {
                    if (row > 0 && !this.grid[row - 1][currentCol].isBlack) {
                        let hasDownWord = false;
                        for (let checkRow = row - 1; checkRow >= 0 && !this.grid[checkRow][currentCol].isBlack; checkRow--) {
                            if (this.grid[checkRow][currentCol].downWord) {
                                hasDownWord = true;
                                break;
                            }
                        }
                        for (let checkRow = row + 1; checkRow < this.gridSize && !this.grid[checkRow][currentCol].isBlack; checkRow++) {
                            if (this.grid[checkRow][currentCol].downWord) {
                                hasDownWord = true;
                                break;
                            }
                        }
                        if (!hasDownWord) return false;
                    }
                    
                    if (row < this.gridSize - 1 && !this.grid[row + 1][currentCol].isBlack) {
                        let hasDownWord = false;
                        for (let checkRow = row - 1; checkRow >= 0 && !this.grid[checkRow][currentCol].isBlack; checkRow--) {
                            if (this.grid[checkRow][currentCol].downWord) {
                                hasDownWord = true;
                                break;
                            }
                        }
                        for (let checkRow = row + 1; checkRow < this.gridSize && !this.grid[checkRow][currentCol].isBlack; checkRow++) {
                            if (this.grid[checkRow][currentCol].downWord) {
                                hasDownWord = true;
                                break;
                            }
                        }
                        if (!hasDownWord) return false;
                    }
                }
            }
        } else {
            if (row + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const cell = this.grid[row + i][col];
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
            }
            
            if (row > 0 && !this.grid[row - 1][col].isBlack) return false;
            if (row + wordLength < this.gridSize && !this.grid[row + wordLength][col].isBlack) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const currentRow = row + i;
                const cell = this.grid[currentRow][col];
                
                if (cell.letter === '') {
                    if (col > 0 && !this.grid[currentRow][col - 1].isBlack) {
                        let hasAcrossWord = false;
                        for (let checkCol = col - 1; checkCol >= 0 && !this.grid[currentRow][checkCol].isBlack; checkCol--) {
                            if (this.grid[currentRow][checkCol].acrossWord) {
                                hasAcrossWord = true;
                                break;
                            }
                        }
                        for (let checkCol = col + 1; checkCol < this.gridSize && !this.grid[currentRow][checkCol].isBlack; checkCol++) {
                            if (this.grid[currentRow][checkCol].acrossWord) {
                                hasAcrossWord = true;
                                break;
                            }
                        }
                        if (!hasAcrossWord) return false;
                    }
                    
                    if (col < this.gridSize - 1 && !this.grid[currentRow][col + 1].isBlack) {
                        let hasAcrossWord = false;
                        for (let checkCol = col - 1; checkCol >= 0 && !this.grid[currentRow][checkCol].isBlack; checkCol--) {
                            if (this.grid[currentRow][checkCol].acrossWord) {
                                hasAcrossWord = true;
                                break;
                            }
                        }
                        for (let checkCol = col + 1; checkCol < this.gridSize && !this.grid[currentRow][checkCol].isBlack; checkCol++) {
                            if (this.grid[currentRow][checkCol].acrossWord) {
                                hasAcrossWord = true;
                                break;
                            }
                        }
                        if (!hasAcrossWord) return false;
                    }
                }
            }
        }
        
        return true;
    }

    placeWord(wordObj, row, col, direction, number) {
        const word = wordObj.word;
        const wordData = {
            word: wordObj.word,
            clue: wordObj.clue,
            number: number,
            row: row,
            col: col,
            direction: direction
        };

        for (let i = 0; i < word.length; i++) {
            const currentRow = direction === 'across' ? row : row + i;
            const currentCol = direction === 'across' ? col + i : col;
            
            this.grid[currentRow][currentCol].letter = word[i];
            this.grid[currentRow][currentCol].isBlack = false;
            
            if (direction === 'across') {
                this.grid[currentRow][currentCol].acrossWord = wordData;
            } else {
                this.grid[currentRow][currentCol].downWord = wordData;
            }
            
            if (i === 0) {
                if (!this.grid[currentRow][currentCol].numbers.includes(number)) {
                    this.grid[currentRow][currentCol].numbers.push(number);
                }
            }
        }
        
        this.words.push(wordData);
    }

    validateAllWordLists() {
        console.log('Validating all word lists...\n');
        let totalErrors = 0;
        const results = {};

        Object.keys(this.wordLists).forEach(category => {
            const wordList = this.wordLists[category];
            const errors = this.validateWordList(wordList);
            
            if (errors[0] === "Word list is valid") {
                console.log(`✅ ${category}: Valid (${wordList.length} words)`);
                results[category] = { valid: true, wordCount: wordList.length };
            } else {
                console.log(`❌ ${category}: ERRORS FOUND`);
                results[category] = { valid: false, errors: errors, wordCount: wordList.length };
                errors.forEach(error => {
                    console.log(`   - ${error}`);
                    totalErrors++;
                });
                console.log('');
            }
        });

        console.log(`\nValidation complete. Total errors found: ${totalErrors}`);
        return results;
    }

    hasUserProgress() {
        // Check if the puzzle exists and user has entered any input
        if (!this.words || this.words.length === 0 || !this.grid) {
            return false;
        }
        
        // Check if any cells have user input
        const actualHeight = this.actualGridHeight || this.gridSize;
        const actualWidth = this.actualGridWidth || this.gridSize;
        
        for (let row = 0; row < actualHeight; row++) {
            for (let col = 0; col < actualWidth; col++) {
                if (this.grid[row] && this.grid[row][col] && 
                    this.grid[row][col].userInput && 
                    this.grid[row][col].userInput.trim() !== '') {
                    return true;
                }
            }
        }
        
        return false;
    }

    async generatePuzzle() {
        // Check if user has made progress and confirm before regenerating
        if (this.hasUserProgress()) {
            const confirmed = confirm('You have made progress on this puzzle. Generating a new puzzle will lose your current progress. Are you sure you want to continue?');
            if (!confirmed) {
                return;
            }
        }
        
        const selectedWordList = document.getElementById('wordListSelector').value;
        const fullWordList = this.wordLists[selectedWordList];
        
        if (!fullWordList || fullWordList.length === 0) {
            console.error('Word list not found or empty');
            return;
        }
        
        // No need to validate since we only load valid word lists

        // Reset completion flag and hints for new puzzle
        this.puzzleCompleted = false;
        this.hintsUsed = 0;
        this.updateHintButton();
        this.lastClickedCell = null; // Reset click tracking for new puzzle
        
        // Update current selection tracking
        this.currentWordListSelection = selectedWordList;
        
        this.showLoading();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Store the full word pool for replacement purposes
        this.currentWordPool = fullWordList;
        
        // Select 10 interconnected words from the 30-word pool
        const selectedWords = await this.selectInterconnectedWords(fullWordList, 10);
        
        await this.generatePuzzleWithTimeout(selectedWords);
        
        this.hideLoading();
        this.updateHintButton();
    }
    
    async selectInterconnectedWords(fullWordList, targetCount) {
        const maxAttempts = 50;
        let bestSelection = [];
        let bestScore = 0;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const selection = await this.attemptWordSelection(fullWordList, targetCount);
            const score = this.calculateInterconnectionScore(selection);
            
            if (score > bestScore) {
                bestScore = score;
                bestSelection = selection;
                
                // If we found a fully interconnected set, use it
                if (this.allWordsInterconnected(selection)) {
                    break;
                }
            }
        }
        
        return bestSelection.length > 0 ? bestSelection : fullWordList.slice(0, targetCount);
    }
    
    async attemptWordSelection(fullWordList, targetCount) {
        // Start with the longest word
        const sortedWords = [...fullWordList].sort((a, b) => b.word.length - a.word.length);
        const selected = [sortedWords[0]];
        const remaining = sortedWords.slice(1);
        
        // Keep adding words that can connect to already selected words
        while (selected.length < targetCount && remaining.length > 0) {
            let bestCandidate = null;
            let bestConnectionCount = 0;
            let bestCandidateIndex = -1;
            
            for (let i = 0; i < remaining.length; i++) {
                const candidate = remaining[i];
                let connectionCount = 0;
                
                // Count how many selected words this candidate can connect to
                for (const selectedWord of selected) {
                    const intersections = this.findIntersections(candidate.word, selectedWord.word);
                    if (intersections.length > 0) {
                        connectionCount++;
                    }
                }
                
                if (connectionCount > bestConnectionCount || 
                    (connectionCount === bestConnectionCount && Math.random() < 0.3)) {
                    bestCandidate = candidate;
                    bestConnectionCount = connectionCount;
                    bestCandidateIndex = i;
                }
            }
            
            if (bestCandidate && bestConnectionCount > 0) {
                selected.push(bestCandidate);
                remaining.splice(bestCandidateIndex, 1);
            } else {
                // If no connections found, add a random word and continue
                const randomIndex = Math.floor(Math.random() * remaining.length);
                selected.push(remaining[randomIndex]);
                remaining.splice(randomIndex, 1);
            }
        }
        
        return selected;
    }
    
    calculateInterconnectionScore(wordList) {
        let score = 0;
        
        for (let i = 0; i < wordList.length; i++) {
            for (let j = i + 1; j < wordList.length; j++) {
                const intersections = this.findIntersections(wordList[i].word, wordList[j].word);
                score += intersections.length;
            }
        }
        
        return score;
    }
    
    allWordsInterconnected(wordList) {
        // Check if every word can connect to at least one other word
        for (const word of wordList) {
            let hasConnection = false;
            for (const otherWord of wordList) {
                if (word !== otherWord) {
                    const intersections = this.findIntersections(word.word, otherWord.word);
                    if (intersections.length > 0) {
                        hasConnection = true;
                        break;
                    }
                }
            }
            if (!hasConnection) {
                return false;
            }
        }
        return true;
    }
    
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
    
    updateLoadingProgress(text) {
        const progress = document.getElementById('loadingProgress');
        if (progress) {
            progress.textContent = text;
        }
    }
    
    async generatePuzzleWithTimeout(wordList) {
        const startTime = Date.now();
        const maxTime = 30000; // Increased timeout for difficult cases
        let bestAttempt = { words: [], score: 0 };
        let attemptCount = 0;
        
        // Store the original word pool for replacement purposes
        this.originalWordPool = this.currentWordPool || [];
        
        while (Date.now() - startTime < maxTime) {
            attemptCount++;
            
            this.initializeGrid();
            this.words = [];
        
            const sortedWords = [...wordList].sort((a, b) => b.word.length - a.word.length);
            let wordNumber = 1;
            
            if (sortedWords.length > 0) {
                const firstWord = sortedWords[0];
                // Vary the starting position slightly to create different layouts
                const baseRow = Math.floor(this.gridSize / 2);
                const baseCol = Math.floor((this.gridSize - firstWord.word.length) / 2);
                const startRow = baseRow + (attemptCount % 3) - 1;
                const startCol = baseCol + (attemptCount % 3) - 1;
                this.placeWord(firstWord, Math.max(0, startRow), Math.max(0, startCol), 'across', wordNumber++);
            }
            
            // Give more time per attempt, especially for later attempts
            const timeForThisAttempt = Math.min(4000, maxTime - (Date.now() - startTime));
            await this.placeWordsWithTimeLimit(sortedWords, wordNumber, timeForThisAttempt);
            
            const score = this.words.length;
            if (score > bestAttempt.score) {
                bestAttempt = {
                    words: JSON.parse(JSON.stringify(this.words)),
                    grid: JSON.parse(JSON.stringify(this.grid)),
                    score: score
                };
                
                this.updateLoadingProgress(`Best: ${score}/${wordList.length} words (Attempt ${attemptCount})`);
                
                if (score === wordList.length) {
                    break;
                }
            }
            
            // If we're getting close to all words, try many more times
            if (score >= wordList.length - 2) {
                if (attemptCount < 200) {
                    continue; // Keep trying aggressively when close
                }
            } else if (score >= wordList.length - 3 && attemptCount < 150) {
                continue; // Also try more when reasonably close
            }
            
            if (attemptCount % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        this.words = bestAttempt.words;
        this.grid = bestAttempt.grid;
        
        // Validate that all words are interconnected and fix if needed
        let isolatedWords = this.findIsolatedWords();
        if (isolatedWords.length > 0) {
            console.warn('Found isolated words:', isolatedWords.map(w => w.word));
            
            // Try to fix isolated words by replacing them with better candidates
            await this.fixIsolatedWords(isolatedWords);
            
            // Check again after fixes
            isolatedWords = this.findIsolatedWords();
            if (isolatedWords.length > 0) {
                console.warn('Still have isolated words after fixes:', isolatedWords.map(w => w.word));
            }
        }
        
        // Trim empty rows and columns for a more compact display
        this.trimGrid();
        
        // Renumber words to share numbers at intersections (after trimming)
        this.optimizeWordNumbers();
        
        this.addBlackSquares();
        this.renderGrid();
        this.renderClues();
    }
    
    optimizeWordNumbers() {
        // Clear existing numbers from grid
        const actualHeight = this.actualGridHeight || this.gridSize;
        const actualWidth = this.actualGridWidth || this.gridSize;
        
        for (let row = 0; row < actualHeight; row++) {
            for (let col = 0; col < actualWidth; col++) {
                this.grid[row][col].numbers = [];
            }
        }
        
        // Find all starting positions and group by location
        const startingPositions = new Map();
        
        this.words.forEach(word => {
            const key = `${word.row},${word.col}`;
            if (!startingPositions.has(key)) {
                startingPositions.set(key, []);
            }
            startingPositions.get(key).push(word);
        });
        
        // Assign numbers to starting positions
        const sortedPositions = Array.from(startingPositions.entries()).sort((a, b) => {
            const [rowA, colA] = a[0].split(',').map(Number);
            const [rowB, colB] = b[0].split(',').map(Number);
            
            // Sort by row first, then by column
            if (rowA !== rowB) return rowA - rowB;
            return colA - colB;
        });
        
        let currentNumber = 1;
        
        sortedPositions.forEach(([positionKey, wordsAtPosition]) => {
            const [row, col] = positionKey.split(',').map(Number);
            
            // All words at this position get the same number
            wordsAtPosition.forEach(word => {
                word.number = currentNumber;
            });
            
            // Add number to the grid cell
            this.grid[row][col].numbers.push(currentNumber);
            
            // Update word references in grid cells
            wordsAtPosition.forEach(word => {
                for (let i = 0; i < word.word.length; i++) {
                    const cellRow = word.direction === 'across' ? word.row : word.row + i;
                    const cellCol = word.direction === 'across' ? word.col + i : word.col;
                    
                    if (word.direction === 'across') {
                        this.grid[cellRow][cellCol].acrossWord = word;
                    } else {
                        this.grid[cellRow][cellCol].downWord = word;
                    }
                }
            });
            
            currentNumber++;
        });
    }
    
    trimGrid() {
        // Find the actual bounds of the puzzle (min/max rows and columns with content)
        let minRow = this.gridSize, maxRow = -1;
        let minCol = this.gridSize, maxCol = -1;
        
        // Find the boundaries of the used area
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col].letter !== '') {
                    minRow = Math.min(minRow, row);
                    maxRow = Math.max(maxRow, row);
                    minCol = Math.min(minCol, col);
                    maxCol = Math.max(maxCol, col);
                }
            }
        }
        
        // If no content found, don't trim (fallback to original grid)
        if (minRow === this.gridSize || maxRow === -1) {
            console.warn('No content found for trimming, keeping original grid');
            this.actualGridHeight = this.gridSize;
            this.actualGridWidth = this.gridSize;
            return;
        }
        
        // Add padding of 1 cell around the puzzle for better appearance
        const padding = 1;
        minRow = Math.max(0, minRow - padding);
        maxRow = Math.min(this.gridSize - 1, maxRow + padding);
        minCol = Math.max(0, minCol - padding);
        maxCol = Math.min(this.gridSize - 1, maxCol + padding);
        
        // Create new trimmed grid
        const trimmedHeight = maxRow - minRow + 1;
        const trimmedWidth = maxCol - minCol + 1;
        const trimmedGrid = Array(trimmedHeight).fill().map(() => 
            Array(trimmedWidth).fill().map(() => ({
                letter: '',
                isBlack: true,
                numbers: [],
                acrossWord: null,
                downWord: null,
                userInput: ''
            }))
        );
        
        // Copy content to trimmed grid and update word positions
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const newRow = row - minRow;
                const newCol = col - minCol;
                trimmedGrid[newRow][newCol] = { ...this.grid[row][col] };
            }
        }
        
        // Update word positions to match the new grid coordinates
        this.words.forEach(word => {
            word.row -= minRow;
            word.col -= minCol;
            
            // Validate that coordinates are within bounds
            if (word.row < 0 || word.col < 0 || 
                word.row >= trimmedHeight || word.col >= trimmedWidth) {
                console.error(`Word "${word.word}" has invalid coordinates after trimming:`, word.row, word.col);
            }
        });
        
        // Clear and rebuild grid references - don't update coordinates again
        for (let row = 0; row < trimmedHeight; row++) {
            for (let col = 0; col < trimmedWidth; col++) {
                const cell = trimmedGrid[row][col];
                cell.acrossWord = null;
                cell.downWord = null;
            }
        }
        
        // Rebuild word references in grid cells using updated word coordinates
        this.words.forEach(word => {
            for (let i = 0; i < word.word.length; i++) {
                const cellRow = word.direction === 'down' ? word.row + i : word.row;
                const cellCol = word.direction === 'across' ? word.col + i : word.col;
                
                // Validate bounds before accessing
                if (cellRow >= 0 && cellRow < trimmedHeight && 
                    cellCol >= 0 && cellCol < trimmedWidth) {
                    if (word.direction === 'across') {
                        trimmedGrid[cellRow][cellCol].acrossWord = word;
                    } else {
                        trimmedGrid[cellRow][cellCol].downWord = word;
                    }
                } else {
                    console.error(`Invalid cell access for word "${word.word}" at ${cellRow},${cellCol}`);
                }
            }
        });
        
        // Replace the original grid with the trimmed version
        this.grid = trimmedGrid;
        
        // Store original dimensions for potential future use
        this.originalGridSize = 25;
        this.actualGridHeight = trimmedHeight;
        this.actualGridWidth = trimmedWidth;
        
        // Don't update gridSize - keep it as the logical grid size for bounds checking
        // The rendering will use actualGridHeight/actualGridWidth for display
        
        console.log(`Grid trimmed from 25×25 to ${trimmedWidth}×${trimmedHeight}`);
    }
    
    findIsolatedWords() {
        const isolatedWords = [];
        
        for (const word of this.words) {
            let hasProperIntersection = false;
            
            // Check if this word properly intersects with any other word
            for (const otherWord of this.words) {
                if (word !== otherWord) {
                    // Check if they actually intersect on the grid (same cell, same letter)
                    const word1Positions = this.getWordPositions(word);
                    const word2Positions = this.getWordPositions(otherWord);
                    
                    for (const pos1 of word1Positions) {
                        for (const pos2 of word2Positions) {
                            if (pos1.row === pos2.row && pos1.col === pos2.col && pos1.letter === pos2.letter) {
                                hasProperIntersection = true;
                                break;
                            }
                        }
                        if (hasProperIntersection) break;
                    }
                    if (hasProperIntersection) break;
                }
            }
            
            if (!hasProperIntersection) {
                isolatedWords.push(word);
            }
        }
        
        return isolatedWords;
    }
    
    getWordPositions(wordData) {
        const positions = [];
        
        for (let i = 0; i < wordData.word.length; i++) {
            const row = wordData.direction === 'across' ? wordData.row : wordData.row + i;
            const col = wordData.direction === 'across' ? wordData.col + i : wordData.col;
            positions.push({ row, col, letter: wordData.word[i] });
        }
        
        return positions;
    }
    
    async fixIsolatedWords(isolatedWords) {
        if (!this.originalWordPool || this.originalWordPool.length === 0) {
            console.warn('No original word pool available for replacement');
            return;
        }
        
        // Get words currently used in the puzzle
        const usedWords = this.words.map(w => w.word);
        
        // Get unused words from the original pool
        const unusedWords = this.originalWordPool.filter(word => !usedWords.includes(word.word));
        
        for (const isolatedWord of isolatedWords) {
            console.log(`Trying to replace isolated word: ${isolatedWord.word}`);
            
            // Find replacement candidates that can connect to existing words
            const candidates = [];
            
            for (const candidate of unusedWords) {
                let connectionCount = 0;
                
                // Check how many existing words this candidate can connect to
                for (const existingWord of this.words) {
                    if (existingWord !== isolatedWord) {
                        const intersections = this.findIntersections(candidate.word, existingWord.word);
                        if (intersections.length > 0) {
                            connectionCount++;
                        }
                    }
                }
                
                if (connectionCount > 0) {
                    candidates.push({ word: candidate, connectionCount });
                }
            }
            
            // Sort candidates by connection count (most connections first)
            candidates.sort((a, b) => b.connectionCount - a.connectionCount);
            
            // Try to place the best candidate
            for (const candidate of candidates) {
                if (await this.tryReplaceWord(isolatedWord, candidate.word)) {
                    console.log(`Successfully replaced ${isolatedWord.word} with ${candidate.word.word}`);
                    break;
                }
            }
        }
    }
    
    async tryReplaceWord(oldWord, newWord) {
        // Create a backup of the current state
        const backupWords = JSON.parse(JSON.stringify(this.words));
        const backupGrid = JSON.parse(JSON.stringify(this.grid));
        
        // Remove the old word from the grid and words array
        this.removeWordFromGrid(oldWord);
        this.words = this.words.filter(w => w !== oldWord);
        
        // Try to place the new word
        let placed = false;
        
        // Try intersection-based placement first
        for (const existingWord of this.words) {
            if (placed) break;
            
            const intersections = this.findIntersections(newWord.word, existingWord.word);
            
            for (const intersection of intersections) {
                if (placed) break;
                
                const newDirection = existingWord.direction === 'across' ? 'down' : 'across';
                let newRow, newCol;
                
                if (existingWord.direction === 'across') {
                    newRow = existingWord.row - intersection.word1Index;
                    newCol = existingWord.col + intersection.word2Index;
                } else {
                    newRow = existingWord.row + intersection.word2Index;
                    newCol = existingWord.col - intersection.word1Index;
                }
                
                if (newRow >= 0 && newCol >= 0 && newRow < this.gridSize && newCol < this.gridSize &&
                    this.canPlaceWordBasic(newWord.word, newRow, newCol, newDirection) &&
                    this.wouldCreateValidCrossword(newWord.word, newRow, newCol, newDirection)) {
                    
                    const nextWordNumber = Math.max(...this.words.map(w => w.number)) + 1;
                    this.placeWord(newWord, newRow, newCol, newDirection, nextWordNumber);
                    placed = true;
                }
            }
        }
        
        if (placed) {
            // Verify the new word is properly connected
            const newWordInPuzzle = this.words.find(w => w.word === newWord.word);
            if (newWordInPuzzle && !this.findIsolatedWords().includes(newWordInPuzzle)) {
                return true; // Success
            }
        }
        
        // If placement failed, restore the backup
        this.words = backupWords;
        this.grid = backupGrid;
        return false;
    }
    
    removeWordFromGrid(wordToRemove) {
        // Clear the word from the grid
        for (let i = 0; i < wordToRemove.word.length; i++) {
            const row = wordToRemove.direction === 'across' ? wordToRemove.row : wordToRemove.row + i;
            const col = wordToRemove.direction === 'across' ? wordToRemove.col + i : wordToRemove.col;
            
            const cell = this.grid[row][col];
            
            // Only clear if this cell is not part of another word
            let shouldClear = true;
            for (const otherWord of this.words) {
                if (otherWord !== wordToRemove) {
                    const otherPositions = this.getWordPositions(otherWord);
                    for (const pos of otherPositions) {
                        if (pos.row === row && pos.col === col) {
                            shouldClear = false;
                            break;
                        }
                    }
                    if (!shouldClear) break;
                }
            }
            
            if (shouldClear) {
                cell.letter = '';
                cell.isBlack = true;
                cell.acrossWord = null;
                cell.downWord = null;
                cell.numbers = [];
            } else {
                // Just remove the reference to this word
                if (wordToRemove.direction === 'across') {
                    cell.acrossWord = null;
                } else {
                    cell.downWord = null;
                }
                
                // Remove the word number if it's only for this word
                if (cell.numbers.includes(wordToRemove.number)) {
                    cell.numbers = cell.numbers.filter(num => num !== wordToRemove.number);
                }
            }
        }
    }
    
    async placeWordsWithTimeLimit(sortedWords, wordNumber, timeLimit) {
        const startTime = Date.now();
        let attempts = 0;
        const maxAttempts = 100; // Increased attempts
        
        while (Date.now() - startTime < timeLimit && attempts < maxAttempts) {
            let placedThisRound = false;
            attempts++;
            
            // Try to place words through intersections - multiple passes
            for (let pass = 0; pass < 3; pass++) {
                for (let i = 1; i < sortedWords.length; i++) {
                    const currentWord = sortedWords[i];
                    
                    if (this.words.find(w => w.word === currentWord.word)) {
                        continue;
                    }
                    
                    let placed = false;
                    
                    // Try all possible intersections with already placed words
                    for (const placedWord of this.words) {
                        if (placed) break;
                        
                        const intersections = this.findIntersections(currentWord.word, placedWord.word);
                        
                        // Try intersections in random order to vary placement
                        const shuffledIntersections = [...intersections].sort(() => Math.random() - 0.5);
                        
                        for (const intersection of shuffledIntersections) {
                            if (placed) break;
                            
                            const newDirection = placedWord.direction === 'across' ? 'down' : 'across';
                            let newRow, newCol;
                            
                            if (placedWord.direction === 'across') {
                                newRow = placedWord.row - intersection.word1Index;
                                newCol = placedWord.col + intersection.word2Index;
                            } else {
                                newRow = placedWord.row + intersection.word2Index;
                                newCol = placedWord.col - intersection.word1Index;
                            }
                            
                            if (newRow >= 0 && newCol >= 0 && newRow < this.gridSize && newCol < this.gridSize &&
                                this.canPlaceWordBasic(currentWord.word, newRow, newCol, newDirection) &&
                                this.wouldCreateValidCrossword(currentWord.word, newRow, newCol, newDirection)) {
                                this.placeWord(currentWord, newRow, newCol, newDirection, wordNumber++);
                                placed = true;
                                placedThisRound = true;
                            }
                        }
                    }
                }
                
                if (placedThisRound) break; // If we placed something, move to next round
            }
            
            // If no intersections worked, try placing remaining words anywhere they fit
            if (!placedThisRound) {
                const placed = this.tryPlaceRemainingWordsAnywhere(sortedWords, wordNumber);
                if (placed) {
                    wordNumber++;
                    placedThisRound = true;
                }
            }
            
            // All words placed successfully
            if (this.words.length === sortedWords.length) {
                break;
            }
            
            // If we're stuck, try a different approach - attempt isolated placement
            if (!placedThisRound && attempts > 20) {
                const placed = this.tryPlaceWordsIsolated(sortedWords, wordNumber);
                if (placed) {
                    wordNumber++;
                    placedThisRound = true;
                }
            }
        }
        
        // Final aggressive attempt to place any remaining words
        if (this.words.length < sortedWords.length) {
            this.tryPlaceRemainingWordsAnywhere(sortedWords, wordNumber);
        }
    }
    

    tryPlaceRemainingWordsAnywhere(sortedWords, wordNumber) {
        const remainingWords = sortedWords.filter(word => 
            !this.words.find(placedWord => placedWord.word === word.word)
        );
        
        let placedAny = false;
        
        for (const word of remainingWords) {
            let placed = false;
            
            // Try placing in all possible positions
            for (let row = 0; row < this.gridSize && !placed; row++) {
                for (let col = 0; col < this.gridSize && !placed; col++) {
                    for (const direction of ['across', 'down']) {
                        if (placed) break;
                        
                        if (direction === 'across' && col + word.word.length > this.gridSize) continue;
                        if (direction === 'down' && row + word.word.length > this.gridSize) continue;
                        
                        if (this.canPlaceWordBasic(word.word, row, col, direction)) {
                            let hasIntersection = false;
                            
                            // Check for intersections with existing words
                            for (let i = 0; i < word.word.length; i++) {
                                const checkRow = direction === 'across' ? row : row + i;
                                const checkCol = direction === 'across' ? col + i : col;
                                
                                if (this.grid[checkRow][checkCol].letter === word.word[i]) {
                                    hasIntersection = true;
                                    break;
                                }
                            }
                            
                            // Place the word if it has at least one intersection and creates valid crossword
                            if (hasIntersection && this.wouldCreateValidCrossword(word.word, row, col, direction)) {
                                this.placeWord(word, row, col, direction, wordNumber++);
                                placed = true;
                                placedAny = true;
                                break; // Move to next word
                            }
                        }
                    }
                }
            }
        }
        
        return placedAny;
    }

    tryPlaceWordsIsolated(sortedWords, wordNumber) {
        const remainingWords = sortedWords.filter(word => 
            !this.words.find(placedWord => placedWord.word === word.word)
        );
        
        // Try to place words in isolated areas where they can later connect
        for (const word of remainingWords) {
            let placed = false;
            
            // Try placing in empty areas of the grid
            for (let row = 2; row < this.gridSize - 2 && !placed; row += 2) {
                for (let col = 2; col < this.gridSize - 2 && !placed; col += 2) {
                    for (const direction of ['across', 'down']) {
                        if (placed) break;
                        
                        if (direction === 'across' && col + word.word.length > this.gridSize - 2) continue;
                        if (direction === 'down' && row + word.word.length > this.gridSize - 2) continue;
                        
                        // Check if this area is relatively empty
                        let isEmpty = true;
                        for (let i = 0; i < word.word.length; i++) {
                            const checkRow = direction === 'across' ? row : row + i;
                            const checkCol = direction === 'across' ? col + i : col;
                            
                            if (this.grid[checkRow][checkCol].letter !== '') {
                                isEmpty = false;
                                break;
                            }
                        }
                        
                        if (isEmpty && this.canPlaceWordBasic(word.word, row, col, direction)) {
                            // Check if this placement could potentially intersect with existing words
                            let couldIntersect = false;
                            
                            for (let i = 0; i < word.word.length; i++) {
                                const checkRow = direction === 'across' ? row : row + i;
                                const checkCol = direction === 'across' ? col + i : col;
                                
                                // Check surrounding cells for potential connections
                                for (let dr = -1; dr <= 1; dr++) {
                                    for (let dc = -1; dc <= 1; dc++) {
                                        if (dr === 0 && dc === 0) continue;
                                        const nearRow = checkRow + dr;
                                        const nearCol = checkCol + dc;
                                        
                                        if (nearRow >= 0 && nearRow < this.gridSize && 
                                            nearCol >= 0 && nearCol < this.gridSize &&
                                            this.grid[nearRow][nearCol].letter !== '') {
                                            couldIntersect = true;
                                            break;
                                        }
                                    }
                                    if (couldIntersect) break;
                                }
                                if (couldIntersect) break;
                            }
                            
                            if (couldIntersect && this.wouldCreateValidCrossword(word.word, row, col, direction)) {
                                this.placeWord(word, row, col, direction, wordNumber);
                                placed = true;
                                return true;
                            }
                        }
                    }
                }
            }
        }
        
        return false;
    }

    wouldCreateValidCrossword(word, row, col, direction) {
        const tempGrid = JSON.parse(JSON.stringify(this.grid));
        
        const wordData = {
            word: word,
            row: row,
            col: col,
            direction: direction
        };
        
        for (let i = 0; i < word.length; i++) {
            const currentRow = direction === 'across' ? row : row + i;
            const currentCol = direction === 'across' ? col + i : col;
            
            tempGrid[currentRow][currentCol].letter = word[i];
            tempGrid[currentRow][currentCol].isBlack = false;
            
            if (direction === 'across') {
                tempGrid[currentRow][currentCol].acrossWord = wordData;
            } else {
                tempGrid[currentRow][currentCol].downWord = wordData;
            }
        }
        
        for (let checkRow = 0; checkRow < this.gridSize; checkRow++) {
            for (let checkCol = 0; checkCol < this.gridSize; checkCol++) {
                const cell = tempGrid[checkRow][checkCol];
                if (cell.letter !== '' && !cell.isBlack) {
                    
                    if ((checkCol > 0 && !tempGrid[checkRow][checkCol - 1].isBlack) ||
                        (checkCol < this.gridSize - 1 && !tempGrid[checkRow][checkCol + 1].isBlack)) {
                        if (!cell.acrossWord) {
                            return false;
                        }
                    }
                    
                    if ((checkRow > 0 && !tempGrid[checkRow - 1][checkCol].isBlack) ||
                        (checkRow < this.gridSize - 1 && !tempGrid[checkRow + 1][checkCol].isBlack)) {
                        if (!cell.downWord) {
                            return false;
                        }
                    }
                }
            }
        }
        
        return true;
    }

    addBlackSquares() {
        const actualHeight = this.actualGridHeight || this.gridSize;
        const actualWidth = this.actualGridWidth || this.gridSize;
        
        for (let row = 0; row < actualHeight; row++) {
            for (let col = 0; col < actualWidth; col++) {
                const cell = this.grid[row][col];
                if (cell.letter === '') {
                    cell.isBlack = true;
                }
            }
        }
    }

    renderGrid() {
        const gridContainer = document.getElementById('crosswordGrid');
        gridContainer.innerHTML = '';
        
        const table = document.createElement('div');
        table.style.display = 'grid';
        
        // Use actual grid dimensions (may be rectangular after trimming)
        const actualWidth = this.actualGridWidth || this.gridSize;
        const actualHeight = this.actualGridHeight || this.gridSize;
        
        table.style.gridTemplateColumns = `repeat(${actualWidth}, 30px)`;
        table.style.gap = '1px';
        table.style.backgroundColor = '#ccc';
        table.style.padding = '1px';
        table.style.margin = '0 auto';
        table.style.justifySelf = 'center';
        
        for (let row = 0; row < actualHeight; row++) {
            for (let col = 0; col < actualWidth; col++) {
                const cell = this.grid[row][col];
                const cellDiv = document.createElement('div');
                cellDiv.className = 'crossword-cell';
                cellDiv.dataset.row = row;
                cellDiv.dataset.col = col;
                
                if (cell.isBlack) {
                    cellDiv.classList.add('black');
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.value = cell.userInput;
                    input.addEventListener('input', (e) => this.handleCellInput(e, row, col));
                    input.addEventListener('focus', (e) => this.handleCellFocus(e, row, col));
                    input.addEventListener('click', (e) => this.handleCellClick(e, row, col));
                    input.addEventListener('keydown', (e) => this.handleKeyDown(e, row, col));
                    input.addEventListener('keypress', (e) => this.handleKeyPress(e, row, col));
                    cellDiv.appendChild(input);
                    
                    if (cell.numbers && cell.numbers.length > 0) {
                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'cell-number';
                        // Since we now share numbers at intersections, there should only be one number per cell
                        numberSpan.textContent = cell.numbers[0];
                        cellDiv.appendChild(numberSpan);
                    }
                }
                
                table.appendChild(cellDiv);
            }
        }
        
        gridContainer.appendChild(table);
    }

    renderClues() {
        const acrossClues = document.getElementById('acrossClues');
        const downClues = document.getElementById('downClues');
        
        acrossClues.innerHTML = '';
        downClues.innerHTML = '';
        
        const acrossWords = this.words.filter(w => w.direction === 'across').sort((a, b) => a.number - b.number);
        const downWords = this.words.filter(w => w.direction === 'down').sort((a, b) => a.number - b.number);
        
        acrossWords.forEach(word => {
            const clueDiv = document.createElement('div');
            clueDiv.className = 'text-sm clue-text cursor-pointer';
            clueDiv.dataset.wordId = `${word.number}-across`;
            clueDiv.innerHTML = `<span class="font-bold">${word.number}.</span> ${word.clue}`;
            clueDiv.addEventListener('click', () => this.highlightWord(word));
            acrossClues.appendChild(clueDiv);
        });
        
        downWords.forEach(word => {
            const clueDiv = document.createElement('div');
            clueDiv.className = 'text-sm clue-text cursor-pointer';
            clueDiv.dataset.wordId = `${word.number}-down`;
            clueDiv.innerHTML = `<span class="font-bold">${word.number}.</span> ${word.clue}`;
            clueDiv.addEventListener('click', () => this.highlightWord(word));
            downClues.appendChild(clueDiv);
        });
    }

    handleCellInput(event, row, col) {
        const value = event.target.value.toUpperCase();
        this.grid[row][col].userInput = value;
        
        // Update the input field to show the capitalized value
        event.target.value = value;
        
        if (value && this.currentWord) {
            this.moveToNextCell(row, col);
        }
        
        // Check if puzzle is completed after each input
        this.checkPuzzleCompletion();
    }

    handleCellFocus(_, row, col) {
        const cell = this.grid[row][col];
        
        // If we're auto-navigating, preserve the current direction and word
        if (this.isAutoNavigating && this.currentWord && this.currentDirection) {
            // Only update currentWord if we're still within the same word
            if (this.currentDirection === 'across' && cell.acrossWord === this.currentWord) {
                // Stay with the same across word
            } else if (this.currentDirection === 'down' && cell.downWord === this.currentWord) {
                // Stay with the same down word
            } else {
                // We've moved outside the current word, switch to available word
                if (this.currentDirection === 'across' && cell.acrossWord) {
                    this.currentWord = cell.acrossWord;
                } else if (this.currentDirection === 'down' && cell.downWord) {
                    this.currentWord = cell.downWord;
                } else if (cell.acrossWord) {
                    this.currentDirection = 'across';
                    this.currentWord = cell.acrossWord;
                } else if (cell.downWord) {
                    this.currentDirection = 'down';
                    this.currentWord = cell.downWord;
                }
            }
        } else {
            // For focus events that aren't from auto-navigation, only set direction/word 
            // if we don't already have a current word, to avoid conflicts with click events
            if (!this.currentWord) {
                if (cell.acrossWord) {
                    this.currentDirection = 'across';
                    this.currentWord = cell.acrossWord;
                } else if (cell.downWord) {
                    this.currentDirection = 'down';
                    this.currentWord = cell.downWord;
                }
            }
        }
        
        this.highlightCurrentWord();
    }

    handleCellClick(_, row, col) {
        const cell = this.grid[row][col];
        const cellKey = `${row},${col}`;
        
        // Manual click should clear auto-navigation state
        this.isAutoNavigating = false;
        
        // Check if this cell has both across and down words (intersection)
        if (cell.acrossWord && cell.downWord) {
            // If clicking the same cell again, toggle direction
            if (this.lastClickedCell === cellKey) {
                this.currentDirection = this.currentDirection === 'across' ? 'down' : 'across';
            } else {
                // First click on a new intersection cell, default to across
                this.currentDirection = 'across';
            }
        } else if (cell.acrossWord) {
            this.currentDirection = 'across';
        } else if (cell.downWord) {
            this.currentDirection = 'down';
        }
        
        // Update tracking
        this.lastClickedCell = cellKey;
        this.currentWord = this.currentDirection === 'across' ? cell.acrossWord : cell.downWord;
        this.highlightCurrentWord();
    }

    handleKeyPress(event, _, __) {
        // For regular character input, clear the field first so it overwrites
        if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
            event.target.value = '';
        }
    }

    handleKeyDown(event, row, col) {
        if (event.key === 'ArrowRight') {
            this.isAutoNavigating = false; // Manual navigation
            this.moveFocus(row, col + 1);
            event.preventDefault();
        } else if (event.key === 'ArrowLeft') {
            this.isAutoNavigating = false; // Manual navigation
            this.moveFocus(row, col - 1);
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            this.isAutoNavigating = false; // Manual navigation
            this.moveFocus(row + 1, col);
            event.preventDefault();
        } else if (event.key === 'ArrowUp') {
            this.isAutoNavigating = false; // Manual navigation
            this.moveFocus(row - 1, col);
            event.preventDefault();
        } else if (event.key === 'Backspace' && !event.target.value) {
            this.moveToPreviousCell(row, col);
            event.preventDefault();
        }
    }

    moveFocus(newRow, newCol) {
        const actualWidth = this.actualGridWidth || this.gridSize;
        const actualHeight = this.actualGridHeight || this.gridSize;
        
        if (newRow >= 0 && newRow < actualHeight && newCol >= 0 && newCol < actualWidth) {
            const cell = this.grid[newRow][newCol];
            if (!cell.isBlack) {
                const input = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"] input`);
                if (input) input.focus();
            }
        }
    }

    moveToNextCell(row, col) {
        if (!this.currentWord) return;
        
        const direction = this.currentWord.direction;
        const nextRow = direction === 'down' ? row + 1 : row;
        const nextCol = direction === 'across' ? col + 1 : col;
        
        this.isAutoNavigating = true;
        this.moveFocus(nextRow, nextCol);
        this.isAutoNavigating = false;
    }

    moveToPreviousCell(row, col) {
        if (!this.currentWord) return;
        
        const direction = this.currentWord.direction;
        const prevRow = direction === 'down' ? row - 1 : row;
        const prevCol = direction === 'across' ? col - 1 : col;
        
        this.isAutoNavigating = true;
        this.moveFocus(prevRow, prevCol);
        this.isAutoNavigating = false;
    }

    highlightWord(word) {
        this.currentWord = word;
        this.currentDirection = word.direction;
        this.highlightCurrentWord();
        
        const firstInput = document.querySelector(`[data-row="${word.row}"][data-col="${word.col}"] input`);
        if (firstInput) firstInput.focus();
    }

    highlightCurrentWord() {
        // Clear all grid cell highlighting
        document.querySelectorAll('.crossword-cell').forEach(cell => {
            cell.classList.remove('active', 'highlighted');
        });
        
        // Clear all clue highlighting
        document.querySelectorAll('.clue-text').forEach(clue => {
            clue.classList.remove('active-clue');
        });
        
        if (this.currentWord) {
            // Highlight grid cells
            for (let i = 0; i < this.currentWord.word.length; i++) {
                const row = this.currentWord.direction === 'down' ? this.currentWord.row + i : this.currentWord.row;
                const col = this.currentWord.direction === 'across' ? this.currentWord.col + i : this.currentWord.col;
                
                const cellDiv = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cellDiv) {
                    cellDiv.classList.add('highlighted');
                }
            }
            
            // Highlight corresponding clue
            const wordId = `${this.currentWord.number}-${this.currentWord.direction}`;
            const clueDiv = document.querySelector(`[data-word-id="${wordId}"]`);
            if (clueDiv) {
                clueDiv.classList.add('active-clue');
            }
        }
    }

    validateAnswers() {
        let correctCount = 0;
        let totalWords = this.words.length;
        
        this.words.forEach(word => {
            let isCorrect = true;
            for (let i = 0; i < word.word.length; i++) {
                const row = word.direction === 'down' ? word.row + i : word.row;
                const col = word.direction === 'across' ? word.col + i : word.col;
                const userInput = this.grid[row][col].userInput;
                
                if (userInput !== word.word[i]) {
                    isCorrect = false;
                    break;
                }
            }
            if (isCorrect) correctCount++;
        });
        
        alert(`${correctCount} out of ${totalWords} words correct!`);
    }
    
    checkPuzzleCompletion() {
        // Don't check if already completed
        if (this.puzzleCompleted) return;
        
        let correctCount = 0;
        let totalWords = this.words.length;
        let allCellsFilled = true;
        
        // Check each word
        this.words.forEach(word => {
            let isCorrect = true;
            for (let i = 0; i < word.word.length; i++) {
                const row = word.direction === 'down' ? word.row + i : word.row;
                const col = word.direction === 'across' ? word.col + i : word.col;
                const userInput = this.grid[row][col].userInput;
                
                if (!userInput || userInput.trim() === '') {
                    allCellsFilled = false;
                    isCorrect = false;
                } else if (userInput !== word.word[i]) {
                    isCorrect = false;
                }
            }
            if (isCorrect) correctCount++;
        });
        
        // Show completion message if puzzle is fully solved
        if (correctCount === totalWords && allCellsFilled) {
            this.puzzleCompleted = true;
            this.showCompletionMessage();
        }
    }
    
    showCompletionMessage() {
        // Create fireworks display
        this.createFireworks();
        
        // Create completion overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50';
        
        const modal = document.createElement('div');
        modal.className = 'card-light rounded-2xl p-10 max-w-md mx-4 text-center shadow-2xl transform scale-95 animate-pulse';
        modal.style.animation = 'modalAppear 0.5s ease-out forwards';
        
        const title = document.createElement('h2');
        title.className = 'text-4xl font-bold text-primary mb-6';
        title.textContent = '🎉 Puzzle Completed!';
        
        const message = document.createElement('p');
        message.className = 'text-lg text-secondary mb-8';
        message.textContent = 'Congratulations! You have successfully completed the crossword puzzle!';
        
        const stats = document.createElement('div');
        stats.className = 'text-secondary mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600';
        stats.innerHTML = `
            <div class="text-lg font-semibold">✨ Perfect Score! ✨</div>
            <div class="mt-2">Total words: ${this.words.length}</div>
            <div>Hints used: ${this.hintsUsed}</div>
        `;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex space-x-4 justify-center';
        
        const newPuzzleBtn = document.createElement('button');
        newPuzzleBtn.className = 'btn-primary text-white px-8 py-3 rounded-xl font-semibold text-lg';
        newPuzzleBtn.textContent = '🎲 New Puzzle';
        newPuzzleBtn.onclick = () => {
            this.stopFireworks();
            document.body.removeChild(overlay);
            this.generatePuzzle();
        };
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn-dark text-white px-8 py-3 rounded-xl font-semibold text-lg';
        closeBtn.textContent = '✖️ Close';
        closeBtn.onclick = () => {
            this.stopFireworks();
            document.body.removeChild(overlay);
        };
        
        buttonContainer.appendChild(newPuzzleBtn);
        buttonContainer.appendChild(closeBtn);
        
        modal.appendChild(title);
        modal.appendChild(message);
        modal.appendChild(stats);
        modal.appendChild(buttonContainer);
        overlay.appendChild(modal);
        
        document.body.appendChild(overlay);
        
        // Add some celebration animation
        this.addCelebrationAnimation();
    }
    
    createFireworks() {
        // Create fireworks container
        const fireworksContainer = document.createElement('div');
        fireworksContainer.className = 'fireworks-container';
        fireworksContainer.id = 'fireworks-display';
        document.body.appendChild(fireworksContainer);
        
        // Colors for fireworks
        const colors = ['red', 'blue', 'gold', 'purple', 'green'];
        
        // Store interval reference for cleanup
        this.fireworksInterval = setInterval(() => {
            // Create multiple fireworks simultaneously
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    if (document.getElementById('fireworks-display')) {
                        this.createSingleFirework(fireworksContainer, colors);
                    }
                }, i * 200); // Stagger by 200ms within each batch
            }
        }, 800); // Create new batch every 800ms
        
        // Initial burst of fireworks
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                if (document.getElementById('fireworks-display')) {
                    this.createSingleFirework(fireworksContainer, colors);
                }
            }, i * 150);
        }
    }
    
    stopFireworks() {
        // Clear the interval
        if (this.fireworksInterval) {
            clearInterval(this.fireworksInterval);
            this.fireworksInterval = null;
        }
        
        // Remove fireworks container
        const fireworksContainer = document.getElementById('fireworks-display');
        if (fireworksContainer) {
            document.body.removeChild(fireworksContainer);
        }
    }
    
    createSingleFirework(container, colors) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const startX = Math.random() * window.innerWidth;
        const endY = 100 + Math.random() * 200; // Burst between 100-300px from top
        
        // Create the launching firework
        const firework = document.createElement('div');
        firework.className = `firework firework-${color}`;
        firework.style.left = `${startX}px`;
        firework.style.bottom = '0px';
        
        container.appendChild(firework);
        
        // Create the burst effect after the firework reaches its peak
        setTimeout(() => {
            this.createFireworkBurst(container, startX, endY, color);
            container.removeChild(firework);
        }, 225); // Burst at 15% of the animation (1.5s * 0.15 = 225ms)
    }
    
    createFireworkBurst(container, x, y, color) {
        const particleCount = 16;
        const radius = 120;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * 2 * Math.PI;
            const dx = Math.cos(angle) * radius + (Math.random() - 0.5) * 30;
            const dy = Math.sin(angle) * radius + (Math.random() - 0.5) * 30;
            
            const particle = document.createElement('div');
            particle.className = `firework-particle firework-${color}`;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--dx', `${dx}px`);
            particle.style.setProperty('--dy', `${dy}px`);
            
            container.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (container.contains(particle)) {
                    container.removeChild(particle);
                }
            }, 1200);
        }
    }
    
    addCelebrationAnimation() {
        // Add a subtle celebration effect to correct words
        this.words.forEach(word => {
            for (let i = 0; i < word.word.length; i++) {
                const row = word.direction === 'down' ? word.row + i : word.row;
                const col = word.direction === 'across' ? word.col + i : word.col;
                const cellDiv = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                
                if (cellDiv) {
                    cellDiv.style.animation = 'pulse 0.5s ease-in-out';
                    
                    // Use different colors for light and dark mode with !important to override CSS
                    if (this.isDarkMode) {
                        cellDiv.style.setProperty('background-color', '#10b981', 'important'); // Bright green for dark mode
                        cellDiv.style.setProperty('color', '#ffffff', 'important'); // Pure white text
                        cellDiv.style.setProperty('font-weight', 'bold', 'important'); // Bold text
                    } else {
                        cellDiv.style.setProperty('background-color', '#22c55e', 'important'); // Light green for light mode
                        cellDiv.style.setProperty('color', '#ffffff', 'important'); // White text
                        cellDiv.style.setProperty('font-weight', 'bold', 'important'); // Bold text
                    }
                    
                    setTimeout(() => {
                        cellDiv.style.animation = '';
                        cellDiv.style.removeProperty('background-color');
                        cellDiv.style.removeProperty('color');
                        cellDiv.style.removeProperty('font-weight');
                    }, 2000);
                }
            }
        });
    }

    giveRandomLetter() {
        // Find all words that have at least one completely empty cell
        const unsolvedWords = this.words.filter(word => {
            for (let i = 0; i < word.word.length; i++) {
                const row = word.direction === 'down' ? word.row + i : word.row;
                const col = word.direction === 'across' ? word.col + i : word.col;
                const userInput = this.grid[row][col].userInput;
                
                // Only consider completely empty cells (no user input at all)
                if (!userInput || userInput.trim() === '') {
                    return true;
                }
            }
            return false;
        });
        
        if (unsolvedWords.length === 0) {
            alert('No empty cells available for hints! All cells either have letters or are complete.');
            return;
        }
        
        // Pick a random unsolved word
        const randomWord = unsolvedWords[Math.floor(Math.random() * unsolvedWords.length)];
        
        // Find all completely empty positions in that word (no user input)
        const emptyPositions = [];
        for (let i = 0; i < randomWord.word.length; i++) {
            const row = randomWord.direction === 'down' ? randomWord.row + i : randomWord.row;
            const col = randomWord.direction === 'across' ? randomWord.col + i : randomWord.col;
            const userInput = this.grid[row][col].userInput;
            
            // Only fill completely empty cells (preserve any user input, even if wrong)
            if (!userInput || userInput.trim() === '') {
                emptyPositions.push({ row, col, letter: randomWord.word[i], position: i });
            }
        }
        
        if (emptyPositions.length === 0) return;
        
        // Pick a random empty position
        const randomPosition = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        
        // Fill in the letter
        this.grid[randomPosition.row][randomPosition.col].userInput = randomPosition.letter;
        
        // Update the input field in the DOM
        const input = document.querySelector(`[data-row="${randomPosition.row}"][data-col="${randomPosition.col}"] input`);
        if (input) {
            input.value = randomPosition.letter;
        }
        
        // Highlight the filled cell briefly
        const cellDiv = document.querySelector(`[data-row="${randomPosition.row}"][data-col="${randomPosition.col}"]`);
        if (cellDiv) {
            cellDiv.style.backgroundColor = '#10b981'; // Green highlight
            cellDiv.style.transition = 'background-color 0.3s';
            
            setTimeout(() => {
                cellDiv.style.backgroundColor = '';
            }, 1000);
        }
        
        // Increment hint counter and update button text
        this.hintsUsed++;
        this.updateHintButton();
        
        // Check if puzzle is completed after this hint
        this.checkPuzzleCompletion();
    }

    updateHintButton() {
        const button = document.getElementById('randomLetterBtn');
        if (button) {
            button.textContent = `💡 ${this.hintsUsed}`;
            
            // Remove any disabled state (no longer needed)
            button.disabled = false;
            button.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    loadDarkModePreference() {
        try {
            const saved = localStorage.getItem('crossword-dark-mode');
            return saved === 'true';
        } catch (error) {
            console.warn('Could not load dark mode preference:', error);
            return false; // Default to light mode
        }
    }

    saveDarkModePreference() {
        try {
            localStorage.setItem('crossword-dark-mode', this.isDarkMode.toString());
        } catch (error) {
            console.warn('Could not save dark mode preference:', error);
        }
    }

    applyDarkModePreference() {
        // Apply the loaded dark mode preference to the DOM
        document.body.classList.toggle('dark', this.isDarkMode);
        
        // Update the button text if it exists
        const button = document.getElementById('darkModeBtn');
        if (button) {
            button.textContent = this.isDarkMode ? '☀️' : '🌙';
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark', this.isDarkMode);
        
        const button = document.getElementById('darkModeBtn');
        button.textContent = this.isDarkMode ? '☀️' : '🌙';
        
        // Save the preference
        this.saveDarkModePreference();
    }


    initializeEventListeners() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    handleWordListChange() {
        // Check if user has made progress and confirm before changing puzzle type
        if (this.hasUserProgress()) {
            const confirmed = confirm('You have made progress on this puzzle. Changing the puzzle category will lose your current progress. Are you sure you want to continue?');
            if (!confirmed) {
                // Reset the dropdown to the previous selection
                // We need to track the current selection to revert if needed
                if (this.currentWordListSelection) {
                    document.getElementById('wordListSelector').value = this.currentWordListSelection;
                }
                return;
            }
        }
        
        // Store the new selection and generate the puzzle
        this.currentWordListSelection = document.getElementById('wordListSelector').value;
        this.generatePuzzle();
    }
    
    setupEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generatePuzzle());
        document.getElementById('validateBtn').addEventListener('click', () => this.validateAnswers());
        document.getElementById('randomLetterBtn').addEventListener('click', () => this.giveRandomLetter());
        document.getElementById('darkModeBtn').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('wordListSelector').addEventListener('change', () => this.handleWordListChange());
        
        // Only generate puzzle if word lists are loaded
        if (Object.keys(this.wordLists).length > 0) {
            this.generatePuzzle();
        }
    }
}

const game = new CrosswordGame();