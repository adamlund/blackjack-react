import React from 'react';
import PropTypes from 'prop-types';
import { CalculateHand, Check } from './play.model';

export class Player extends React.Component {
    render() {
        const { hand, funds } = this.props;
        const sums = CalculateHand(hand);
        const result = Check(hand);
        return (
            <React.Fragment>
                <div style={{ color: '#efefef' }}>Possible {sums && Object.keys(sums).map(sumKey => <span key={sumKey}>[{sumKey}]</span>)}</div>
                <div style={{ color: '#efefef' }}>Funds ${funds}</div>
                <div style={{ color: '#efefef' }}>{result}</div>
            </React.Fragment>
        );
    }
}
Player.propTypes = {
    name: PropTypes.string,
    funds: PropTypes.number,
    hand: PropTypes.arrayOf(
        PropTypes.shape({
            suit: PropTypes.string,
            face: PropTypes.string,
            value: PropTypes.arrayOf(PropTypes.number),       
        })
    )
};
Player.defaultProps = {
    name: 'Player X',
    funds: 0,
    hand: [],
};

export default Player;
