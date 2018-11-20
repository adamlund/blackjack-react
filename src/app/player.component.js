import React from 'react';
import PropTypes from 'prop-types';
import { PlayingCard } from './playingcard.component';
import {
    CalculateHand,
    Check,
    PLAYER_ACTION_TYPES,
    PLAY_PHASES,
    CONDITIONS
} from './play.model';

export class Player extends React.Component {
    render() {
        const {
            id,
            phase,
            name,
            cards,
            funds,
            bet,
            bet_amount,
            handler,
            result,
            playedHands
        } = this.props;
        const sums = CalculateHand(cards);
        const best = Check(cards);
        const funded = (funds > 0);
        const canHit = (best !== CONDITIONS.blackjack && best !== CONDITIONS.bust);
        const canDouble = (cards.length === 2 && (best === 9 || best === 11 || best === 10));
        let win = 0;
        let loss = 0;
        let draw = 0;
        playedHands.forEach(hand => {
            switch(hand.winner) {
                case 'DEALER':
                loss += 1;
                break;
                case 'PLAYER':
                win += 1;
                break;
                case 'PUSH':
                draw += 1;
                break;
            }
        });
        return (
            <React.Fragment>
                <div style={{ color: '#efefef' }}>
                    <ul className="list-inline">
                    <li className="list-inline-item"><strong>{name}</strong></li>
                        <li className="list-inline-item">
                            <span className="badge badge-info mr-2">Win {win}</span>
                            <span className="badge badge-info mr-2">Loss {loss}</span>
                            <span className="badge badge-info">Draw {draw}</span>
                        </li>
                    </ul>
                </div>
                <div className="mb-2">
                    <div style={{ color: '#efefef' }}>Showing <strong>{best}</strong>. Possible {sums && Object.keys(sums).map(sumKey => <span key={sumKey}>[{sumKey}]</span>)}</div>
                    <div style={{ color: '#efefef' }}>Funds ${funds} Current Bet: ${bet} Bet Amount: ${bet_amount}</div>
                    <div style={{ color: '#efefef' }}>{result}</div>
                    {!funded &&
                        <div className="alert alert-danger">You have run out of funds and must start over.</div>
                    }
                </div>
                {(phase === PLAY_PHASES.player && funded) &&
                    <React.Fragment>
                        <div className="btn-group mr-2">
                            {canHit &&
                                <button
                                    className="btn btn-primary"
                                    name={`${id}:${PLAYER_ACTION_TYPES.hit}`}
                                    onClick={handler}
                                >Hit</button>
                            }
                            <button
                                className="btn btn-primary"
                                name={`${id}:${PLAYER_ACTION_TYPES.stand}`}
                                onClick={handler}
                            >Stand</button>
                        </div>
                        {canDouble &&
                            <div className="btn-group">
                                <button
                                    className="btn btn-primary"
                                    name={`${id}:${PLAYER_ACTION_TYPES.double}`}
                                    onClick={handler}
                                >Double</button>
                            </div>
                        }
                    </React.Fragment>
                }
                <div className="row">
                    <div className="cardHand">
                        {cards.map(card => (
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
        );
    }
}
Player.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    funds: PropTypes.number,
    bet: PropTypes.number,
    bet_amount: PropTypes.number,
    cards: PropTypes.arrayOf(
        PropTypes.shape({
            suit: PropTypes.string,
            face: PropTypes.string,
            value: PropTypes.arrayOf(PropTypes.number),       
        })
    ),
    handler: PropTypes.func,
};
Player.defaultProps = {
    id: 'player_x',
    name: 'Player X',
    funds: 0,
    bet: 0,
    bet_amount: 0,
    cards: [],
    handler: () => {},
};

export default Player;
