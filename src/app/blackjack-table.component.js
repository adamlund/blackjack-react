import React from 'react';
import { Deck, Card } from './deck.model';
import { Player } from './player.component';
import { PlayingCard } from './playingcard.component';
import {
    Check,
    soft17,
    CONDITIONS,
    PLAYER_ACTION_TYPES,
    PLAY_PHASES,
    WINNER
} from './play.model';
import '../main.css';

export class BlackJackTable extends React.Component {
    static newPlayer() {
        return {
            id: 'player_1',
            name: 'Player 1',
            result: '',
            cards: [],
            funds: 200,
            bet_amount: 10,
            bet: 0,
            playedHands: []
        };
    }
    constructor(props) {
        super(props);
        this.newHand = this.newHand.bind(this);
        this.resetHand = this.resetHand.bind(this);
        this.playerAction = this.playerAction.bind(this);
        this.state = {
            deck: null,
            inPlay: false,
            phase: PLAY_PHASES.bet,
            hands: [],  // audit trail of hands
            result: '',
            dealercards: [], // array of cards for dealer
            players: {
                player_1: BlackJackTable.newPlayer()
            },
        };
    }
    async newHand() {
        const { players } = this.state;
        const dealercards = [];
        const deck = new Deck();

        // clear out player card hands
        Object.values(players).map(player => {
            player.cards = [];
            player.result = '';
            player.bet = (player.funds >= player.bet_amount) ? player.bet_amount : player.funds;
            player.funds -= player.bet;
            return player;
        });
        await new Promise(resolve => setTimeout(() => {
            deck.shuffle();
            resolve();
        }, Math.floor(Math.random() * 100)));
        // deal two cards to each player then the dealer
        for (let i=0; i < 2; i++) {
            Object.values(players).map(player => {
                player.cards.push(deck.dealCard());
                return player;
            });
            dealercards.push(deck.dealCard());
        }
        // TODO: Following dealt cards, if dealer card 1 is an Ace, offer insurance bet
        this.setState({
            inPlay: true,
            result: '',
            phase: PLAY_PHASES.player,
            deck,
            players,
            dealercards
        });
    }
    nextPlayer() {
        this.setState({ phase: PLAY_PHASES.dealer });
        this.dealerAction();        
    }
    playerAction(event) {
        const { name, value } = event.target;
        const { players, deck } = this.state;
        const subjectAction = name.split(':');
        let mPlayers = Object.assign(players);

        switch(subjectAction[1]) {
            case PLAYER_ACTION_TYPES.hit:
                mPlayers[subjectAction[0]].cards.push(deck.dealCard());
                this.setState({ players: mPlayers });
                // evaluate cards
                if (Check(mPlayers[subjectAction[0]].cards) === CONDITIONS.bust) {
                    this.nextPlayer();
                }
            break;
            case PLAYER_ACTION_TYPES.double:
                mPlayers[subjectAction[0]].cards.push(deck.dealCard());
                mPlayers[subjectAction[0]].bet += mPlayers[subjectAction[0]].bet_amount;
                mPlayers[subjectAction[0]].funds -= mPlayers[subjectAction[0]].bet_amount;
                this.setState({ players: mPlayers });
                this.nextPlayer();
            break;
            case PLAYER_ACTION_TYPES.stand:
                this.nextPlayer();
            break;
            case PLAYER_ACTION_TYPES.bet_amount:
                mPlayers[subjectAction[0]].bet_amount = parseInt(value, 10);
                this.setState({ players: mPlayers });
            break;
        }    
    }
    resolveHand(playerKey, playerCheck, winner, result) {
        const { hands } = this.state;
        const { players } = this.state;
        const mPlayers = Object.assign(players);
        let winnings = 0;

        if (winner === WINNER.DEALER) {
            mPlayers[playerKey].bet = 0;
        }
        if (winner === WINNER.PLAYER) {
            // blackjack pays 3:2
            if (playerCheck === CONDITIONS.blackjack) {
                winnings = Math.ceil((mPlayers[playerKey].bet * 3) / 2);
            // all others pay 1:1
            } else {
                winnings = mPlayers[playerKey].bet;
            }
            // refund the original bet along with winnings
            mPlayers[playerKey].funds += (winnings + mPlayers[playerKey].bet);
        }
        else if (winner === WINNER.DRAW) {
            mPlayers[playerKey].funds += mPlayers[playerKey].bet;
        }

        mPlayers[playerKey].bet = 0;
        mPlayers[playerKey].playedHands.push({winner, result});
        mPlayers[playerKey].result = `${winnings > 0 ? `Won $${winnings}. ` : ''}${result}`;

        const updatedHands = hands;
        updatedHands.push({winner, result});
        this.setState({
            phase: PLAY_PHASES.complete,
            result: `Winner: ${winner}, ${result}`,
            hands: updatedHands,
            players: mPlayers
        });
    }
    call() {
        const { dealercards, players } = this.state;
        this.setState({ phase: PLAY_PHASES.resolve });
        const dealerCheck = Check(dealercards);

        // Resolve win/loss/draw condition for each player
        Object.keys(players).forEach(playerKey => {
            const playerCheck = Check(players[playerKey].cards);
            let winner = '';
            let result = '';

            if (dealerCheck === CONDITIONS.bust) {
                result = (playerCheck === dealerCheck) ? 'BOTH BUST, DEALER WINS' : 'DEALER BUST';
                winner = (playerCheck === dealerCheck) ? WINNER.DEALER : WINNER.PLAYER;
            }
            else if (dealerCheck === CONDITIONS.blackjack) {
                result = (playerCheck === dealerCheck) ? 'PLAYER AND DEALER BLACKJACK' : 'BLACKJACK ';
                winner = (playerCheck === dealerCheck) ? WINNER.DRAW : WINNER.DEALER;
            }
            else if (playerCheck === CONDITIONS.bust) {
                result = 'PLAYER BUSTS';
                winner = WINNER.DEALER;
            }
            else if (playerCheck === CONDITIONS.blackjack) {
                result = 'PLAYER WINS WITH BLACKJACK';
                winner = WINNER.PLAYER;
            }
            else if (playerCheck === dealerCheck) {
                result = 'DRAW BETWEEN PLAYER AND DEALER';
                winner = WINNER.DRAW;
            }
            else {
                result = (dealerCheck > playerCheck) ? `DEALER WINS WITH ${dealerCheck}` : `PLAYER WINS WITH ${playerCheck}`;
                winner = (dealerCheck > playerCheck) ? WINNER.DEALER : WINNER.PLAYER;
            }
            this.resolveHand(playerKey, playerCheck, winner, result);
        });
    }
    dealerAction() {
        const { dealercards, players, deck } = this.state;
        const checkValue = Check(dealercards);
        const playerValue = Check(players.player_1.cards);

        // dealer logic
        // check my cards
        // if blackjack or bust = call
        // if best value <= 16 = draw a card and rerun
        // if player is going to win with a higher score, draw a card anyway

        if (checkValue === CONDITIONS.blackjack
            || checkValue === CONDITIONS.bust
            // TODO: adjust this to check all player busts
            || playerValue === CONDITIONS.bust) {
            this.call();
        // this logic assumes dealer hit on soft 17 (S17)
        } else if (checkValue >= 17 && !soft17(dealercards)) {
            this.call();
        // do not hit if playercards are lower
        } else if (checkValue > playerValue) {
            this.call();
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
        const players = {
            player_1: BlackJackTable.newPlayer()
        }
        this.setState({ inPlay: false, deck: null, dealercards: [], players });
    }
    render() {
        const {
            inPlay,
            phase,
            result,
            hands,
            players,
            dealercards,
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
                    <div className="row">
                        <div className="cardHand">
                            {(phase >= PLAY_PHASES.dealer) && 
                                dealercards.map(card => (
                                    <PlayingCard
                                        key={`card-${card.suit}-${card.face}`}
                                        suit={card.suit}
                                        face={card.face}
                                        value={card.value}
                                    />
                                ))
                            }
                            {(phase <= PLAY_PHASES.player) &&
                                <React.Fragment>
                                    <PlayingCard
                                        key={`card-${dealercards[0].suit}-${dealercards[0].face}`}
                                        suit={dealercards[0].suit}
                                        face={dealercards[0].face}
                                        value={dealercards[0].value}
                                    />
                                    <div className="playingCard back"></div>
                                </React.Fragment>
                            }
                        </div>
                    </div>
                    <Player {...players.player_1} phase={phase} handler={this.playerAction} />
                </React.Fragment>
            }
            </div>
        </React.Fragment>
        );
    }
}

export default BlackJackTable;
