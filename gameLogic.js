function startGame() {
    if (isDealing.length != 0 || isChiping.length != 0)
        return;
    if (!Deal){ // Button display New game
        if (saving < 10)
            resetBtn.classList.add("show");
        if (!firstLoadCard){  // load card images
            suits.forEach(suit => {
                values.forEach(value => {
                    const img = new Image();
                    img.src = `./img/PNG/${value}${suit}.png`;
                    // img.src = `./img/${suit}-${value}.png`;
                    cardsImage[`${value}${suit}`] = img;
                });
            });
            firstLoadCard = true;
        }
        Deal = true;
        whoWin = false;
        playerScore = dealerScore = 0;
        if (saving > 1000)
            changeChip(1);
        else
            changeChip(0);
        inGameChip.classList.add('active');
        GameOrDeal.innerHTML = "Deal!";
        GameOrDeal.classList.remove("GameOrDeal");
        GameOrDeal.classList.add("GameOrDeal-deal");
        takeBackCard();
        return;
    }
    if (totalBet == 0){
        return;
    }
    // Button display Deal
    moveBet(1);
    GameOrDeal.classList.add('deactive');
    GameOrDeal.classList.remove("GameOrDeal-deal");
    GameOrDeal.classList.add("GameOrDeal");
    inGameChip.classList.remove('active');
    inGameoptions.classList.add('active');
    resetGame();
    gameStart = true;
    firstDeal = true;
    deck = createDeck();
    shuffleDeck(deck);
    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard(), drawCard()];
    timeOutdeal("dealer", true, 0, dealerHand[0].suit, dealerHand[0].value, false);
    timeOutdeal("dealer", false, 1, dealerHand[1].suit, dealerHand[1].value, false); 
    timeOutdeal("player", true, 2, playerHand[0].suit, playerHand[0].value, false); 
    timeOutdeal("player", true, 3, playerHand[1].suit, playerHand[1].value, false);
    setTimeout(() => {
        firstDeal = false;
    }, myTimeout * 4);
}

function resetGame() {
    whoWin = false;
    stand =false;
    playerScore = dealerScore = 0;
    playerHand = [];
    dealerHand = [];
    playerCards = [];
    dealerCards = [];
}

function toggleSignal(){
    signal = !signal;
    inGameChip.classList.toggle('active');
    ALLIN.classList.add('hover-image');
    ALLIN.classList.remove('transparent');
    if (signal)
        ALLIN.src = "./img/BACK.png"
    else
        ALLIN.src = "./img/ALLIN.png"
    inGameoptions.classList.toggle('active');
}

function playerHit() {
    if (isDealing.length != 0 || !gameStart || stand || firstDeal) return;
    dealerScore = calculateScore(dealerHand);
    let tmp = drawCard();
    playerHand.push(tmp);
    timeOutdeal("player", true, 0, tmp.suit, tmp.value, false);
}

function playerStand() {
    if (isDealing.length != 0 || !gameStart || stand || firstDeal) return;
    let i = 0;
    dealerScore = calculateScore(dealerHand);
    stand = true;
    animateFlip("dealer", 1);
    if (calculateScore(dealerHand) >= 17){
        setTimeout(determineWinner, flipTimeout);
        return;
    }
    while (calculateScore(dealerHand) < 17) {
        tmp = drawCard();
        dealerHand.push(tmp);
        timeOutdeal("dealer", true, i, tmp.suit, tmp.value, true);
        i++;
    }
    setTimeout(() => {
        dealerScore = calculateScore(dealerHand);
        determineWinner();
    }, myTimeout * i + flipTimeout);
}
  
function endGame(result) {
    whoWin = result;
    gameIndex ++;
    const gameData = {
        gameNumber: gameIndex,
        result: result,
        playerScore: playerScore,
        dealerScore: dealerScore,
        bet: totalBet,
        saving: saving
    };
    // saveGameData(gameData);
    // loadGameHistory();
    gameStart = false;
    if (stand)
        stand = false;
    Deal = false;
    totalBet = 0;
    // moveBet(2);
    chips = [];
    inGameoptions.classList.remove('active');
    GameOrDeal.classList.remove('deactive');
    GameOrDeal.innerHTML = "New Game!";
    drawScene();
    ///////////// change canvas

}

function createDeck() {
    // let suits = ["H", "S", "C", "D"];
    // let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    return suits.flatMap(suit => values.map(value => ({ suit, value })));
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}
  
function drawCard() {
    return deck.pop();
}

function determineWinner() {
    drawScene();
    if (playerScore > 21){
        endGame("LOSE");
        return;
    }else if (playerScore == 21 && playerCards.length == 2){
        saving += 2 * totalBet;
        endGame("BLACKJACK");
        return;
    }
    if (stand){
        if (dealerScore > 21 || playerScore > dealerScore) {
            saving += 2 * totalBet;
            endGame("WIN");
        } else if (playerScore < dealerScore) {
            endGame("LOSE");
        } else {
            saving += totalBet;
            endGame("PUSH");
        }
    }
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    hand.forEach(card => {
        if (card.value === "A") {
            aces++;
            score += 11;
        } else if (["K", "Q", "J"].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    });
    while (score > 21 && aces) {
      score -= 10;
      aces--;
    }
    return score;
}

function toggleHistory(){
    myHistory.classList.toggle("show");
}

function saveGameData(gameData) {
    let gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];
    gameHistory.push(gameData);

    localStorage.setItem("gameHistory", JSON.stringify(gameHistory));
    sessionStorage.setItem("gameHistory", JSON.stringify(gameHistory));
}

function loadGameHistory() {
    const gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];

    myHistory.innerHTML = `
        <tr>
            <th>Game #</th>
            <th>Result</th>
            <th>Player Score</th>
            <th>Dealer Score</th>
            <th>Bet</th>
            <th>Saving</th>
        </tr>
    `;

    gameHistory.forEach((game, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${game.gameNumber}</td>
            <td>${game.result}</td>
            <td>${game.playerScore}</td>
            <td>${game.dealerScore}</td>
            <td>${game.bet}</td>
            <td>${game.saving}</td>
        `;
        myHistory.appendChild(row);
    });
    if (gameHistory.length != 0){
        saving = gameHistory[gameHistory.length - 1].saving;
        gameIndex = gameHistory[gameHistory.length - 1].gameNumber;
    }
}
function clearGameHistory() {
    resetBtn.classList.remove("show");

    // localStorage.removeItem("gameHistory");
    // sessionStorage.removeItem("gameHistory");

    // const table = document.getElementById("gameHistory");
    // table.innerHTML = `
    //     <tr>
    //         <th>Game #</th>
    //         <th>Result</th>
    //         <th>Player Score</th>
    //         <th>Dealer Score</th>
    //         <th>Bet</th>
    //         <th>Saving</th>
    //     </tr>
    // `;

    saving = 1000;
    gameIndex = 0;
    changeChip(0);
    drawScene();
}

// function getValue(value){
//     if (value == "A")
//         return "Ace";
//     if (value == "K")
//         return "King";
//     if (value == "Q")
//         return "Queen";
//     if (value == "J")
//         return "Jack";
//     return value;
// }