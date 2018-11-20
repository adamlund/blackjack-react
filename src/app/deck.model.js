// Card generator
export const SUITS = ['hearts', 'spades', 'diamonds', 'clubs'];
export const FACEVALUES = ['2','3','4','5','6','7','8','9','10','Jack','Queen','King','Ace'];
export const VALUES = [
    [2],[3],[4],[5],[6],[7],[8],[9],[10],[10],[10],[10],[1,11]
];
export class Card {
    constructor(suit, value, face) {
        this.suit = suit;
        this.value = value;
        this.face = face;
        this.isAce = (value === 11);
    }
}
export class Deck {
    constructor(){
        this.cards = this.shuffle();
    }
    /**
     * Make a deck of cards based on SUITS, VALUES, and FACEVALUES
     */
    generateDeck() {
        const deck = [];
        for (const suitidx in SUITS){
            for (const index in FACEVALUES){
                deck.push(new Card(SUITS[suitidx], VALUES[index], FACEVALUES[index]));
            }
        }
        return deck;
    }
    /** 
     * Return random index 0-51 for shuffling the deck
    */
    randomIdx(deckCount) {
        return Math.floor(Math.random() * deckCount);
    }
    /**
     * Recursive fn to place a card in a random spot in a target deck (array).
     * First attempt at a very simple shuffle algorithm.
     * @param {Card} card card to place at a spot in the deck
     * @param {Array<Card>} deck the deck to inject the card into
     */
    placeCardInDeck(card, deck) {
        const randidx = this.randomIdx(deck.length);
        if (deck[randidx] === undefined || !deck[randidx]) {
            deck[randidx] = card;
        }
        else {
            // try again
            this.placeCardInDeck(card, deck);
        }
    }
    /**
     * Generate a shuffled deck of cards (minus the Jokers of course)
     */
    shuffle() {
        const cards = this.generateDeck();
        const newDeck = new Array(cards.length);
        for (var card in cards) {
            this.placeCardInDeck(cards[card], newDeck);
        }
        this.cards = newDeck;
        return this.cards;
    }
    /**
     * Remove the top card from the stack
     */
    dealCard() {
        return this.cards.pop();
    }
}