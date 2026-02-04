// DOM Elements
const displayMinutes = document.getElementById('minutes');
const displaySeconds = document.getElementById('seconds');
const displayMilliseconds = document.getElementById('milliseconds');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const lapList = document.getElementById('lapList');

// Stopwatch Variables
let timerInterval = null; // Stores the setInterval ID
let startTime = 0;      // Timestamp when the timer last started/resumed
let elapsedTime = 0;    // Total time elapsed in milliseconds (accumulates across pauses)
let isRunning = false;  // Flag to check if the stopwatch is running
let lapCounter = 0;     // Counter for lap numbers

/**
 * Formats a given number of milliseconds into MM:SS:CC (Centiseconds) format.
 * @param {number} ms - The time in milliseconds.
 * @returns {string} The formatted time string.
 */
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10); // Milliseconds to centiseconds (10ms intervals)

    // Pad with leading zeros for consistent display
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedCentiseconds = String(centiseconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}:${formattedCentiseconds}`;
}

/**
 * Updates the stopwatch display with the current elapsed time.
 * @param {number} timeToDisplay - The time in milliseconds to display.
 */
function updateDisplay(timeToDisplay) {
    const formattedTime = formatTime(timeToDisplay);
    const parts = formattedTime.split(':');

    displayMinutes.textContent = parts[0];
    displaySeconds.textContent = parts[1];
    displayMilliseconds.textContent = parts[2];
}

/**
 * Starts or stops the stopwatch.
 */
function startStop() {
    if (isRunning) {
        // Stop the timer
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        startStopBtn.textContent = 'Start';
        startStopBtn.classList.remove('running');
        // Lap button can still be used to record the final paused time before reset
    } else {
        // Start or resume the timer
        const now = Date.now();
        // Calculate startTime to ensure continuity: current time minus what has already elapsed
        startTime = now - elapsedTime;

        // Update every 10 milliseconds for centisecond precision
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay(elapsedTime);
        }, 10);

        isRunning = true;
        startStopBtn.textContent = 'Stop';
        startStopBtn.classList.add('running');
        lapBtn.disabled = false; // Enable lap button when timer is running
    }
}

/**
 * Resets the stopwatch to its initial state.
 */
function reset() {
    // Stop the timer if it's running
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;

    // Reset all time-related variables
    startTime = 0;
    elapsedTime = 0;
    lapCounter = 0;

    // Reset button texts and states
    startStopBtn.textContent = 'Start';
    startStopBtn.classList.remove('running');
    lapBtn.disabled = true; // Disable lap button until timer starts again

    // Clear the display and lap list
    updateDisplay(0);
    lapList.innerHTML = '';
}

/**
 * Records the current elapsed time as a lap.
 */
function recordLap() {
    // Only record a lap if the timer has been started at least once
    // and has some elapsed time, or if it's currently running.
    if (!isRunning && elapsedTime === 0) {
        return;
    }

    lapCounter++;
    const lapTime = elapsedTime; // Capture the current total elapsed time for this lap

    const listItem = document.createElement('li');
    // Use padStart for consistent lap numbering (e.g., Lap 01, Lap 02)
    listItem.innerHTML = `
        <span>Lap ${String(lapCounter).padStart(2, '0')}</span>
        <span>${formatTime(lapTime)}</span>
    `;
    
    // Prepend new lap to the top of the list
    lapList.prepend(listItem);

    // Announce lap for accessibility (ARIA live region)
    lapList.setAttribute('aria-label', `Lap ${lapCounter} recorded at ${formatTime(lapTime)}`);
}

// Event Listeners
startStopBtn.addEventListener('click', startStop);
resetBtn.addEventListener('click', reset);
lapBtn.addEventListener('click', recordLap);

// Initial state setup: Ensure display shows 00:00:00 on load
updateDisplay(0);
