import React from 'react';
import { Deck, Card } from './deck.model';
import { PlayingCard } from './playingcard.component';
import { Player } from './player.component';
import { Check, CONDITIONS } from './play.model';
import '../main.css';

const PLAYER_ACTION_TYPES = {
    hit: 'hit',
    stand: 'stand',
    double: 'double',
    split: 'split',
};

const PLAY_PHASES = {
    bet: 'place bets',  // place bets prior to play
    player: 'player',   // player's turn
    dealer: 'dealer',   // dealer'r turn
    resolve: 'call',    // dealer has finished
    complete: 'hand completed', // 
};

export class BlackJackTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deck: null,
            inPlay: false,
            phase: '',
            result: '',
            bettingPool: {}, // key value pairs, one value for each player
            hands: [],  // audit trail of hands
            // TODO: create Player class, to scale for multiple 1-5 players
            dealercards: [], // array of cards for now
            playercards: [], // array of cards for now assume 1 player
            playerMoney: 100,
            
        };
        this.start = this.start.bind(this);
        this.newHand = this.newHand.bind(this);
        this.resetHand = this.resetHand.bind(this);
        this.playerAction = this.playerAction.bind(this);
    }
    start() {
        this.setState({ inPlay: true, phase: PLAY_PHASES.bet });
    }
    newHand() {
        const deck = new Deck();
        deck.shuffle();
        const randDelay = Math.floor(Math.random() * 100);
        setTimeout(() => {
            deck.shuffle();
            // deal two cards to each player then the dealer
            const playercards = [deck.dealCard(), deck.dealCard()];
            const dealercards = [deck.dealCard(), deck.dealCard()];

            // TODO: Following dealt cards, dealer card 1 is an Ace, offer insurance bet
            this.setState({ inPlay: true, result: '', phase: PLAY_PHASES.player, deck, dealercards, playercards });
        }, randDelay);
    }
    playerAction(event) {
        const { target } = event;
        const { name } = target;
        const { playercards, deck } = this.state;

        if (name === PLAYER_ACTION_TYPES.hit) {
            const newCards = playercards;
            newCards.push(deck.dealCard());
            this.setState({ playercards: newCards });
            // evaluate cards
            if (Check(newCards) === CONDITIONS.bust) {
                this.setState({ phase: PLAY_PHASES.dealer });
                this.dealerAction();
            }
        }
        if (name === PLAYER_ACTION_TYPES.stand) {
            this.setState({ phase: PLAY_PHASES.dealer });
            this.dealerAction();
        }       
    }
    resolveHand(winner, result) {
        const { hands } = this.state;
        const updatedHands = hands;
        updatedHands.push({winner, result});
        const displayResult = `Winner: ${winner}, ${result}`;
        this.setState({ phase: PLAY_PHASES.complete, result: displayResult, hands: updatedHands });
        return true;
    }
    call() {
        const { dealercards, playercards } = this.state;
        this.setState({ phase: PLAY_PHASES.resolve });
        const dealerCheck = Check(dealercards);

        // TODO, resolve for an array of players
        const playerCheck = Check(playercards);
        let winner = '';
        let result = '';

        if (dealerCheck === CONDITIONS.bust) {
            result = (playerCheck === dealerCheck) ? 'BOTH BUST' : 'DEALER BUST';
            winner = (playerCheck === dealerCheck) ? 'PUSH' : 'PLAYER';
            return this.resolveHand(winner, result);
        }

        if (dealerCheck === CONDITIONS.blackjack) {
            result = (playerCheck === dealerCheck) ? 'PLAYER AND DEALER BLACKJACK' : 'BLACKJACK ';
            winner = (playerCheck === dealerCheck) ? 'PUSH' : 'DEALER';
            return this.resolveHand(winner, result);
        }

        if (playerCheck === CONDITIONS.bust) {
            return this.resolveHand('DEALER', 'PLAYER BUSTS');    
        }

        if (playerCheck === CONDITIONS.blackjack) {
            return this.resolveHand('PLAYER', 'PLAYER WINS WITH BLACKJACK'); 
        }

        result = (dealerCheck >= playerCheck) ? `DEALER WINS WITH ${dealerCheck}` : `PLAYER WINS WITH ${playerCheck}`;
        winner = (dealerCheck > playerCheck) ? 'DEALER' : 'PLAYER';
        return this.resolveHand(winner, result);
    }
    dealerAction() {
        const { dealercards, playercards, deck } = this.state;
        const checkValue = Check(dealercards);
        const playerValue = Check(playercards);
        console.log('dealer action, dealer:', checkValue, 'player:', playerValue);

        // dealer logic
        // check my cards
        // if blackjack or bust = call
        // if best value <= 16 = draw a card and rerun
        // if player is going to win with a higher score, draw a card anyway

        if (checkValue === CONDITIONS.blackjack
            || checkValue === CONDITIONS.bust
            || playerValue === CONDITIONS.bust) {
            this.call();
        } else if (checkValue > 16) {
            // based on player check values
            // iterate through players and decide what to do
            if (playerValue > checkValue) {
                // dealer hits
                const newCards = dealercards;
                newCards.push(deck.dealCard());
                // evaluate cards
                this.setState({ dealercards: newCards });
                this.dealerAction();
            } else {
                this.call();
            }
        } else {
            // dealer hits
            const newCards = dealercards;
            newCards.push(deck.dealCard());
            // evaluate cards
            this.setState({ dealercards: newCards });
            this.dealerAction();
        }
    }
    resetHand() {
        this.setState({ inPlay: false, deck: null, dealercards: [], playercards: [] });
    }
    render() {
        const {
            inPlay,
            phase,
            result,
            hands,
            playercards,
            dealercards,
            playerMoney
        } = this.state;
        let dealerWins = 0;
        let playerWins = 0;
        let draws = 0;
        hands.forEach(hand => {
            switch(hand.winner) {
                case 'DEALER':
                dealerWins += 1;
                break;
                case 'PLAYER':
                playerWins += 1;
                break;
                case 'PUSH':
                draws += 1;
                break;
            }
        });
        return (
            <React.Fragment>
            <div className="d-flex flex-row align-items-center bg-dark">
                <div className="p-2">
                    <h1 className="text-light text-muted m-0">BlackJack!</h1>
                </div>
                <div className="p-2">
                    {!inPlay &&
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={this.newHand}
                        >Start New Hand</button>
                    }
                    {inPlay &&
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={this.resetHand}
                        >Start Over...</button>
                    }
                </div>
                {inPlay &&
                    <div className="p-2 text-light"><div>Play state {phase}</div></div>              
                }
                {hands && hands.length > 0 &&
                    <div className="p-2 text-light"><div>Dealer {dealerWins} Player {playerWins} Draw {draws}</div></div> 
                }
            </div>
            {result && result.length > 0 &&
                <div className="d-flex flex-row align-items-center bg-light">
                    <div className="p-2">{result}<button style={{ marginLeft: '1em' }} className="btn btn-primary" onClick={this.newHand}>Deal New Hand</button></div>
                </div>
            }
            <div className="container cardTable">
            {inPlay &&
                <React.Fragment>
                    <div className="text-light">Dealer</div>
                    <div><Player name="dealer" hand={dealercards} funds={100} /></div>
                    <div className="row">
                        <div className="cardHand">
                            {dealercards.map(card => (
                                <PlayingCard
                                    key={`card-${card.suit}-${card.face}`}
                                    suit={card.suit}
                                    face={card.face}
                                    value={card.value}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="text-light">Player</div>
                    <div><Player name="player" hand={playercards} funds={playerMoney} /></div>
                    {(phase === PLAY_PHASES.player) &&
                        <div className="btn-group">
                            <button
                                className="btn btn-primary"
                                name={PLAYER_ACTION_TYPES.hit}
                                onClick={this.playerAction}
                            >Hit
                                </button>
                            <button 
                                className="btn btn-primary"
                                name={PLAYER_ACTION_TYPES.stand}
                                onClick={this.playerAction}
                            >Stand
                                </button>
                        </div>
                    }
                    <div className="row">
                        <div className="cardHand">
                            {playercards.map(card => (
                                <PlayingCard
                                    key={`card-${card.suit}-${card.face}`}
                                    suit={card.suit}
                                    face={card.face}
                                    value={card.value}
                                />
                            ))}
                        </div>
                    </div>
                </React.Fragment>
            }
            </div>
        </React.Fragment>
        );
    }
}

export default BlackJackTable;
