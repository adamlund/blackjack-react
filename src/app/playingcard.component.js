import React from 'react';
import PropTypes from 'prop-types';

/**
 * Present visual playing card
 */
export class PlayingCard extends React.Component {
    static getSuitChar(suit) {
        switch(suit){
            case 'diamonds':
                return '&#9830;';
            case 'clubs':
                return '&#9827;';
            case 'spades':
                return '&#9824;';
            case 'hearts':
                return '&#9829;';
            default:
                return '&#9733;';
        }
    };
    render() {
        const { suit, face } = this.props;
        const faceValue = (face.length >= 3) ? face.charAt(0) : face;
        const suitCharacter = PlayingCard.getSuitChar(suit);
        return (
            <div className="playingCard">
                <div className={`cardValue ${suit}`}>
                    <div>{faceValue}</div>
                    <div dangerouslySetInnerHTML={{ __html: suitCharacter}} />
                </div>
                <div className={`cardFace ${suit}`}>
                    <div>{face}</div>
                </div>
                <div className={`cardValue bottom ${suit}`}>
                    <div>{faceValue}</div>
                    <div dangerouslySetInnerHTML={{ __html: suitCharacter}} />
                </div>
            </div>
        );
    }
}

PlayingCard.propTypes = {
    suit: PropTypes.string,
    face: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.number),
};
PlayingCard.defaultProps = {
    suit: '',
    face: '',
    value: [0],
};

export default PlayingCard;
