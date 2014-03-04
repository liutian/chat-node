var letters = 'abcdefghijklmnopqrstuvwxyz';
exports.randomLetters = function(length){
    var result = '';

    while(length--){
        result += letters[parseInt(Math.random() * 26)];
    }

    return result;
}