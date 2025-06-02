const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// function to shuffle trials
const shuffleTrials = function (nTrials, catchIdx, nCalibrates) {
    // Ensure catchIdx is an array
    const catchIndices = Array.isArray(catchIdx) ? catchIdx : [catchIdx];

    // Create a shuffled array of trial indices
    const trialIndices = Array.from(Array(nTrials).keys()).sort(() => Math.random() - 0.5);

    // For each catch trial, ensure it's not in the calibration phase
    catchIndices.forEach(catchIdx => {
        // Find the index of catchIdx in the shuffled array
        const catchIdxIndex = trialIndices.indexOf(catchIdx);

        // If catchIdx is below nCalibrates, swap it with an alternative random value >= nCalibrates
        if (catchIdxIndex < nCalibrates) {
            // Find a random index from nCalibrates to nTrials that isn't another catch trial
            let randomIndex;
            do {
                randomIndex = clamp(Math.floor(Math.random() * (nTrials - nCalibrates)) + nCalibrates, 0, nTrials - 1);
            } while (catchIndices.includes(trialIndices[randomIndex]));

            // Swap catchIdx with the random index
            [trialIndices[catchIdxIndex], trialIndices[randomIndex]] = [trialIndices[randomIndex], trialIndices[catchIdxIndex]];
        }
    });

    return trialIndices;
}

// export functions for other scripts 
export { shuffleTrials }