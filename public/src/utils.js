const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// function to shuffle trials
const shuffleTrials = function (nTrials, catchIdx, nCalibrates) {
    // Create a shuffled array of trial indices
    const trialIndices = Array.from(Array(nTrials).keys()).sort(() => Math.random() - 0.5);

    // condition: 
    // the catch trials (catchIdx) cannot be a recalibration trial (<nCalibrates)

    // Find the index of catchIdx
    const catchIdxIndex = trialIndices.indexOf(catchIdx);

    // If catchIdx is below nCalibrates, swap it with an alternative random value >= nCalibrates
    if (catchIdxIndex < nCalibrates) {
        // Find a random index from nCalibrates to nTrials
        const randomIndex = clamp(Math.floor(Math.random() * (nTrials - nCalibrates)) + nCalibrates, 0, nTrials - 1);

        // Swap catchIdx with the random index
        [trialIndices[catchIdxIndex], trialIndices[randomIndex]] = [trialIndices[randomIndex], trialIndices[catchIdxIndex]];
    }

    return trialIndices;
}

// export functions for other scripts 
export { shuffleTrials }