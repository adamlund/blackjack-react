import {
    CalculateHand,
    Check,
    soft17,
    CONDITIONS
} from '../src/app/play.model';
import { Card } from '../src/app/deck.model';

const twoOfHearts = new Card('hearts', [2], '2');
const threeOfSpades = new Card('spades', [3], '3');
const fourOfClubs = new Card('clubs', [4], '4');
const sixOfHearts = new Card('hearts', [6], '6');
const sevenOfClubs = new Card('clubs', [7], '7');
const eightOfDiamonds = new Card('diamonds', [8], '8');
const nineofDiamonds = new Card('diamonds', [9], '9');
const tenofSpades = new Card('spades', [10], '10');
const kingOfSpades = new Card('spades', [10], 'king');
const queenOfHearts = new Card('hearts', [10], 'queen');
const aceOfDiamonds = new Card('diamonds', [1,11], 'ace');
const aceOfClubs = new Card('clubs', [1,11], 'ace');
const aceOfHearts = new Card('hearts', [1,11], 'ace');
const aceOfSpades = new Card('spades', [1,11], 'ace');

/**
 * Unit testing the efficacy of CalculateHand and Check functions
 * "Hand sums are attractive"
 */
test('Simple hand sum calculations', () => {
    // some hands to sum
    const hand_1 = [twoOfHearts, sevenOfClubs];
    const sum_hand_1 = CalculateHand(hand_1);
    expect(Object.keys(sum_hand_1)).toHaveLength(1);
    expect(sum_hand_1['9']).toBeDefined();

    const hand_2 = [kingOfSpades, sevenOfClubs, twoOfHearts];
    const sum_hand_2 = CalculateHand(hand_2);
    expect(Object.keys(sum_hand_2)).toHaveLength(1);
    expect(sum_hand_2['19']).toBeDefined();
});

test('Hand with single ace', () => {
    // some hands to sum
    const hand_1 = [sevenOfClubs, aceOfDiamonds];
    const sum_hand_1 = CalculateHand(hand_1);
    expect(Object.keys(sum_hand_1)).toHaveLength(2);
    expect(sum_hand_1['8']).toBeDefined();
    expect(sum_hand_1['18']).toBeDefined();
});

test('Hand with multiple aces', () => {
    // [1,11] + [7] + [1,11] = [9, 19, 19, 29]
    const hand_2 = [aceOfClubs, sevenOfClubs, aceOfDiamonds];
    const sum_hand_2 = CalculateHand(hand_2);
    expect(Object.keys(sum_hand_2)).toHaveLength(3);
    expect(sum_hand_2['9']).toBeDefined();
    expect(sum_hand_2['19']).toBeDefined();
    expect(sum_hand_2['29']).toBeDefined();
});

test('Hand with all the aces', () => {
    // [1,11],[2],[1,11][1,11],[1,11] = [6, 16, 26, 46]
    const hand_1 = [
        aceOfClubs,
        twoOfHearts,
        aceOfHearts,
        aceOfDiamonds,
        aceOfSpades
    ];
    const sum_hand_1 = CalculateHand(hand_1);
    expect(Object.keys(sum_hand_1).length).toBeGreaterThan(3);
    expect(sum_hand_1['6']).toBeDefined();
    expect(sum_hand_1['16']).toBeDefined();
    expect(sum_hand_1['26']).toBeDefined();
    expect(sum_hand_1['46']).toBeDefined();
});

test('Checking conditions for hand outcomes', () => {
    // 11, 21 - true blackjack
    const blackJack = Check([aceOfSpades, kingOfSpades]);
    expect(blackJack).toBe(CONDITIONS.blackjack);

    // 11, 21 - true blackjack
    const blackJack_2 = Check([tenofSpades, aceOfSpades]);
    expect(blackJack_2).toBe(CONDITIONS.blackjack);

    // 11, 21 - not true blackjack, 21
    const twentyOne_1 = Check([sevenOfClubs, aceOfHearts, threeOfSpades]);
    expect(twentyOne_1).toBe(21);

    // 21
    const twentyOne_2 = Check([nineofDiamonds, kingOfSpades, twoOfHearts]);
    expect(twentyOne_2).toBe(21);

    // 20, 21, 31, 41 -- rare case with 3 aces
    const twentyOne_3 = Check([aceOfDiamonds, eightOfDiamonds, aceOfHearts, aceOfSpades]);
    expect(twentyOne_3).toBe(21);

    // 8, 18
    const bestEighteen = Check([aceOfClubs, sevenOfClubs]);
    expect(bestEighteen).toBe(18);

    // 9, 19, 29
    const bestNinteen = Check([aceOfClubs, sevenOfClubs, aceOfDiamonds]);
    expect(bestNinteen).toBe(19);

    // 16
    const bestSixteen = Check([nineofDiamonds, sevenOfClubs]);
    expect(bestSixteen).toBe(16);

    // 20, 30
    const bestTwenty = Check([nineofDiamonds, aceOfSpades, kingOfSpades]);
    expect(bestTwenty).toBe(20);

    // 26
    const bust26 = Check([nineofDiamonds, sevenOfClubs, kingOfSpades]);
    expect(bust26).toBe(CONDITIONS.bust);

    // 23, 33
    const bust23 = Check([twoOfHearts, aceOfHearts, queenOfHearts, kingOfSpades]);
    expect(bust23).toBe(CONDITIONS.bust);

});

test('Soft 17 hands', () => {
    const soft17_yes_1 = [aceOfClubs, sixOfHearts];
    expect(soft17(soft17_yes_1)).toBe(true);

    const soft17_yes_2 = [sixOfHearts, aceOfDiamonds];
    expect(soft17(soft17_yes_2)).toBe(true);
    
    // same hand sum potentials [7, 17] but with three cards
    const soft17_no_1 = [fourOfClubs, aceOfSpades, twoOfHearts];
    expect(soft17(soft17_no_1)).toBe(false);

    // hard 17
    const soft17_no_2 = [kingOfSpades, sevenOfClubs];
    expect(soft17(soft17_no_2)).toBe(false);

    // not 17 at all
    const soft17_no_3 = [tenofSpades, nineofDiamonds];
    expect(soft17(soft17_no_3)).toBe(false);
});