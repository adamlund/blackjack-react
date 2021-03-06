export const CONDITIONS = {
    blackjack: 'BLACKJACK',
    bust: 'BUST',
}

export const WINNER = {
    PLAYER: 'PLAYER',
    DEALER: 'DEALER',
    DRAW: 'PUSH',
};

export const PLAYER_ACTION_TYPES = {
    hit: 'hit',
    stand: 'stand',
    double: 'double',
    split: 'split',
    bet_amount: 'bet_amount',
};

export const PLAY_PHASES = {
    bet: 0,         // place bets prior to play
    player: 1,      // player's turn
    dealer: 2,      // dealer's turn
    resolve: 3,     // dealer has finished
    complete: 4,    // display results
};

/**
 * Provide an array of cards to calculate sum possibilities
 * @param {Array<Card>} cards a player's hand
 * @returns an array of possible hand sums
 */
export const CalculateHand = (cards) => {
    const sums = {};
    if (cards && cards.length > 0) {
        // build an array of all the values, which might include aces
        const numCards = cards.map(card => card.value);
        const combine = (list) => {
            var prefixes, combinations;
        
            if (list.length === 1) {
              return list[0];
            }
        
            prefixes = list[0];
            combinations = combine(list.slice(1)); // recurse
        
            // flat list of each of the current
            // set of values prepended to each combination
            // of the remaining sets
            return prefixes.reduce((memo, prefix) => {
              return memo.concat(combinations.map((combination) => {
                return [prefix].concat(combination);
              }));
            }, []);
        }

        const combinations = combine(numCards);
        combinations.forEach(set => {
            const sumVal = set.reduce((acc, curr) => acc + curr);
            sums[sumVal] = sumVal;
        });
    }
    return sums;
};

/**
 * Check for possible conditions.
 * Blackjack - if one potential = 21
 * Bust - if all potentials are above 21
 * @param {Array<Card>} cards hand of cards
 */
export const Check = (cards) => {
    const results = Object.values(CalculateHand(cards));
    // check for blackjack - 2 cards, one is an ace
    const true_blackjack = (cards.length === 2 && results.find(value => value === 21));
    if (true_blackjack) {
        return CONDITIONS.blackjack;
    }
    // check for bust
    const bust = results.filter(value => value <=21);
    if (bust.length === 0) {
        return CONDITIONS.bust;
    }
    // return best value, under 21
    const bestValue = results.reduce((bestvalue, currentValue) =>
        (currentValue > bestvalue && currentValue <= 21) ? currentValue : bestvalue);
    return bestValue;
}

/**
 * Test for presence of Ace and 6, which is known as a "soft 17"
 * @param {Array<Card>} cards 
 */
export const soft17 = (cards) => {
    const results = Object.values(CalculateHand(cards));
    return (cards.length == 2 && results.length === 2 && results[0] === 7);
};
