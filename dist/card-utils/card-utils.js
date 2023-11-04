"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardUtils = exports.Compare = void 0;
var Compare;
(function (Compare) {
    Compare[Compare["LT"] = 0] = "LT";
    Compare[Compare["EQ"] = 1] = "EQ";
    Compare[Compare["GT"] = 2] = "GT";
})(Compare || (exports.Compare = Compare = {}));
class CardUtils {
    static getSuit(card) {
        return card.substring(card.length - 1);
    }
    static getValue(card) {
        return card.substring(0, card.length - 1);
    }
    static compare(card1, card2, trumps) {
        console.log(`Comparing - card1: ${card1}, card2: ${card2}, trumps: ${trumps}`);
        if (CardUtils.getSuit(card1) !== CardUtils.getSuit(card2)) {
            console.log(`Suits not the same - card1 suit: ${CardUtils.getSuit(card1)}, card2 suit: ${CardUtils.getSuit(card2)}`);
            if (CardUtils.getSuit(card2) === trumps) {
                console.log("card2 trumps card1");
                return Compare.LT;
            }
            else {
                return Compare.GT;
            }
        }
        let card1value = this.getValue(card1);
        let card1score = this.values.findIndex(v => v === card1value);
        let card2value = this.getValue(card2);
        let card2score = this.values.findIndex(v => v === card2value);
        console.log(`Card scores - card1: ${card1score}, card2: ${card2score}`);
        if (card1score < card2score)
            return Compare.LT;
        if (card1score === card2score)
            return Compare.EQ;
        if (card1score > card2score)
            return Compare.GT;
    }
}
exports.CardUtils = CardUtils;
CardUtils.values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
