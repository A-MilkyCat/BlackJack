const myTimeout = 300; // Change this value for different DEAL CARD SPEED
const flipTimeout = 500; // FLIP CARD SPEED
const maxChip = 10; //  Chips NUM shown on the table
const gameDiv = document.querySelector(".Game");

const inGameoptions = document.getElementById('inGame');
const inGameChip = document.getElementById('chip');
const ALLIN = document.getElementById('ALLIN');
const canvas = document.getElementById("myCanvas");
const GameOrDeal = document.getElementById("GameOrDeal");
GameOrDeal.classList.add('deactive');
let chipImg = [];
for (let i=1;i<=3;i++){
    chipImg.push(document.getElementById(`chip${i}`)); 
}
const myHistory = document.getElementById("gameHistory");
const resetBtn = document.getElementById("resetBtn");
// load Images
const chipImages = [];
const deckImage = new Image();
deckImage.src = "./img/card_back.png";
const savingImage = new Image();
savingImage.src = "./img/pile-chip.png";
const winImage = new Image();
winImage.src = "./img/win.png";
const loseImage = new Image();
loseImage.src = "./img/lose.png";
const pushImage = new Image();
pushImage.src = "./img/push.png";
const blackjackImage = new Image();
blackjackImage.src = "./img/blackjack.png";
const cardsImage = {};

const context = canvas.getContext("2d");
let cardSizeX, cardSizeY, cardIntervalX, placeBetX, chipInterval, chipIntervalHorizon;
let firstCardX, dealerCardY, playerCardY, chipLength, chipX, chipY, chipPlaceY;
let betChipPosition, deckPosition;
let fontSize, savingX, savingImgX, outputY, outputSizeX, outputSizeY, oppo;
let bottomChip01;
const suits = ["H", "S", "C", "D"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
// let suits = ["Hearts", "Spades", "Clubs", "Diamond"];
// let values = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
////////////////////////////////// Initialize
if (canvas.clientHeight < canvas.clientWidth){
    canvas.width = 1920;
    canvas.height = 911;
}else{
    canvas.width = 540;
    canvas.height = 1200;
}
updateConstant(canvas.width, canvas.height);

for (let i=0;i<3;i++){
    const img = new Image();
    chipImages.push(img);
    chipImages[i].src = `./img/${bottomChip01[0][i].path}.png`;
}
tmpImg = new Image();
chipImages.push(new Image());
chipImages[3].src = `./img/${bottomChip01[1][2].path}.png`;
/////////////////////// resize
function resizeCanvas() {
    // TODO  
    // change the dealed card, bet, deck position when size changed
    if (canvas.clientHeight < canvas.clientWidth){
        canvas.width = 1920;
        canvas.height = 911;
    }else{
        canvas.width = 1080;
        canvas.height = 1920;
    }
    console.log(canvas.width, canvas.height);
    updateConstant(canvas.width, canvas.height);
    drawScene();
 }
 
 let resizeTimeout;
 window.addEventListener("resize", () => {
     clearTimeout(resizeTimeout);
     resizeTimeout = setTimeout(resizeCanvas, 100); 
 });
//  resizeCanvas();
deckImage.onload = () => {
    setTimeout(() => {
        GameOrDeal.classList.remove('deactive');
        // loadGameHistory();
        drawScene();
    }, myTimeout);
};
// define coordinate constant;
function updateConstant(w, h){
    let h_10 = h / 10;
    let w_10 = w / 10;
    dealerCardY = h_10 * 0.8;
    playerCardY = h_10 * 6.2;
    placeBetX = w_10; // middle - placeBetX
    chipPlaceY = h_10 * 2;
    chipInterval = w_10 / 10;
    chipIntervalHorizon =  w_10 / 30;
    outputSizeX = w_10 * 5;
    outputSizeY = h_10 ;
    outputY = h_10 * 4.5;
    chipLength =  h_10;
    chipX = w/2 - 2*chipLength;
    chipY = h - (40 + chipLength);
    if (w > h){
        oppo = 3 * w_10; // symmetric for saving and bet
        betChipPosition = {x: w/2 + oppo, y: h_10 * 9 , Length: h_10/2};
        savingX = w/2 - oppo;
        savingImgX = h_10;
        fontSize = h / 36;
        cardSizeY = h_10 * 2;
        cardSizeX = cardSizeY * 2 / 3;
        deckPosition = { x: w_10 * 2, y: h_10 * 1.2 };
        firstCardX = w_10 * 3;
        cardIntervalX = w_10 / 2;
    }else{ // mobile NOT FINISH YET
        oppo = 4.3 * w_10; // symmetric for saving and bet
        betChipPosition = {x: w/2 + oppo, y: h_10 * 5 , Length: w_10/2};
        savingX = w/2 - oppo;
        savingImgX = w_10 ;
        placeBetX = w_10 * 3;
        fontSize = w / 30;
        dealerCardY = h_10 * 1.5;
        cardSizeX = w_10 * 1.6;
        cardSizeY = cardSizeX * 3 / 2;
        deckPosition = { x: -1 * w_10 * 2, y: h_10 * 1.2 };
        firstCardX = w_10 * 1;
        cardIntervalX = w_10 / 20;
    }
    bottomChip01 = [
        [{path:"10chip", x: chipX, y:chipY, money: 10, idx:0},
        {path:"25chip", x: chipX + chipLength, y:chipY, money: 25, idx:1},
        {path:"100chip", x: chipX + 2 * chipLength, y:chipY, money: 100, idx:2}],
        [{path:"25chip", x: chipX, y:chipY, money: 25, idx:1},
        {path:"100chip", x: chipX + chipLength, y:chipY, money: 100, idx:2},
        {path:"500chip", x: chipX + 2 * chipLength, y:chipY, money: 500, idx:3}]
    ];
}
//  variable
let bottomChips = bottomChip01[0];
let saving = 1000;
let totalBet = 0;
let gameIndex = 0;
let gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];
let dealerCards = [], dealerHand = [];
let playerCards = [], playerHand = [];
let isDealing = [], isChiping = [], deck = [], chips = [];
let gameStart = whoWin = Deal = signal = stand = firstDeal = firstLoadCard = false;
let playerScore = 0, dealerScore = 0;
ALLIN.addEventListener('click', function() {
    if (signal) {
        toggleSignal();
    } else {
        allin();
    }
});
function timeOutdeal(dealingTo, isFace, t, suit, value, forFlip){
    forFlip ? fliptime = flipTimeout : fliptime = 0;
    setTimeout(() => {
        dealCard(dealingTo, isFace, suit, value); 
    }, myTimeout * t + fliptime);
}

function updateScores() {
    // dealer
    if (!gameStart){
        context.font = `bold ${fontSize}px 'Comic Sans MS', cursive`;
        context.fillStyle = "white"; 
        context.textAlign = "right"; 
        context.textBaseline = "top"; 
        context.fillText("Dealer: " + dealerScore, canvas.width - 10, 10);  
    }
    // palayer
    context.font = `bold ${fontSize}px 'Comic Sans MS', cursive`;
    context.fillStyle = "white";
    context.textAlign = "right";
    context.textBaseline = "bottom";
    context.fillText("Player: " + playerScore, canvas.width - 10, canvas.height - 10);
    // Saving
    context.font = `bold ${fontSize}px 'Comic Sans MS', cursive`;
    context.fillStyle = "white";
    context.textAlign = "left";
    context.textBaseline = "bottom";
    context.drawImage(savingImage, savingX, betChipPosition.y - (savingImgX + fontSize)/2, savingImgX, savingImgX);
    context.fillText(" " + saving, savingX + savingImgX, betChipPosition.y);
    // Bet
    if (gameStart){
        context.font = `bold ${fontSize}px 'Comic Sans MS', cursive`;
        context.fillStyle = "white";
        context.textAlign = "right";
        context.textBaseline = "bottom";
        context.fillText("Bet: " + totalBet + " ", betChipPosition.x, betChipPosition.y);
    }
}

function drawScene() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(deckImage, deckPosition.x, deckPosition.y, cardSizeX, cardSizeY);

    dealerCards.forEach(card => {
        if (card.isFaceUp) {
            const cardKey = `${card.value}${card.suit}`;
            context.drawImage(cardsImage[cardKey], card.x, card.y, cardSizeX, cardSizeY); 
        } else {
            context.drawImage(deckImage, card.x, card.y, cardSizeX, cardSizeY); 
        }
    });
    playerCards.forEach(card => {
        if (card.isFaceUp) {
            const cardKey = `${card.value}${card.suit}`;
            context.drawImage(cardsImage[cardKey], card.x, card.y, cardSizeX, cardSizeY);
        } else {
            context.drawImage(deckImage, card.x, card.y, cardSizeX, cardSizeY);
        }
    });
    chips.forEach(chip => {
        const a = new Image();
        a.src = `./img/${chip.path}.png`;
        context.drawImage(a, chip.x, chip.y, chip.Length, chip.Length);
    });
    ////////////////
    updateScores();
    ///////////////
    if (!whoWin){
        context.globalAlpha = 0.5;
        context.drawImage(blackjackImage, canvas.width / 2 - outputSizeX/2, outputY, outputSizeX, outputSizeY);
        context.globalAlpha = 1;
    }else{
        if (whoWin === "WIN") {
            context.drawImage(winImage, canvas.width / 2 - outputSizeX/2, outputY, outputSizeX, outputSizeY);
        } else if (whoWin === "LOSE") {
            context.globalAlpha = 0.9;
            context.drawImage(loseImage, canvas.width / 2 - outputSizeX/2, outputY, outputSizeX, outputSizeY);
            context.globalAlpha = 1;
        } else if (whoWin == "BLACKJACK"){
            context.drawImage(blackjackImage, canvas.width / 2 - outputSizeX/2, outputY, outputSizeX, outputSizeY);
        }else{
            context.drawImage(pushImage, canvas.width / 2 - outputSizeX/2, outputY, outputSizeX, outputSizeY);
        }
    }
}

function dealCard(dealingTo, isFace, suit, value) {
    // if (isDealing.length != 0) return;
    isDealing.push(true);
    initCard = { ...deckPosition, isFaceUp: isFace, suit: suit, value: value};
    CCP = { ...deckPosition };
    if (dealingTo === "dealer"){
        dealerCards.push(initCard);
        animateDeal(dealingTo, isFace, suit, value, CCP, dealerCards.length-1);
    }else{
        playerCards.push(initCard);
        animateDeal(dealingTo, isFace, suit, value, CCP, playerCards.length-1);
    }
}

function animateDeal(dealingTo, isFace, suit, value, currentCardPosition, idx) {
    const targetPosition = dealingTo === "dealer"
        ? { x: firstCardX + idx * (cardSizeX + cardIntervalX), y: dealerCardY }
        : { x: firstCardX + idx * (cardSizeX + cardIntervalX), y: playerCardY };
    const dx = (targetPosition.x - currentCardPosition.x) / 10;
    const dy = (targetPosition.y - currentCardPosition.y) / 10;
    currentCardPosition.x += dx;
    currentCardPosition.y += dy;
    if (dealingTo === "dealer"){
        dealerCards[idx].x = currentCardPosition.x;
        dealerCards[idx].y = currentCardPosition.y;
    }else{
        playerCards[idx].x = currentCardPosition.x;
        playerCards[idx].y = currentCardPosition.y;
    }
    drawScene();
    if (Math.abs(currentCardPosition.x - targetPosition.x) < 1 &&
        Math.abs(currentCardPosition.y - targetPosition.y) < 1) {

        if (dealingTo === "dealer") {  // dealer only determineWinner when playerStand
            // dealerScore = calculateScore(dealerCards);   
        } else {  // only player needs to determineWinner 
            playerScore = calculateScore(playerCards);
            determineWinner();
        }
        isDealing.pop();
    } else {
        requestAnimationFrame(()=>animateDeal(dealingTo, isFace, suit, value, currentCardPosition, idx));
    }
}

function animateTackBack(){
    
    let AllCardTakeBack = true;
    for (let i=0;i<dealerCards.length;i++){
        if ((dealerCards[i].x != deckPosition.x || dealerCards[i].y != deckPosition.y)){
            const dx = (dealerCards[i].x - deckPosition.x) / 10;
            const dy = (dealerCards[i].y - deckPosition.y) / 10;
            dealerCards[i].x -= dx;
            dealerCards[i].y -= dy;
            AllCardTakeBack = false;
            if (Math.abs(dealerCards[i].x - deckPosition.x) < 1 &&
                Math.abs(dealerCards[i].y - deckPosition.y) < 1) {
                
                dealerCards[i] = { ...deckPosition }; // ignore the suit and value
            }
        }
    }
    for (let i=0;i<playerCards.length;i++){
        if ((playerCards[i].x != deckPosition.x || playerCards[i].y != deckPosition.y)){
            const dx = (playerCards[i].x - deckPosition.x) / 10;
            const dy = (playerCards[i].y - deckPosition.y) / 10;
            playerCards[i].x -= dx;
            playerCards[i].y -= dy;
            AllCardTakeBack = false;
            if (Math.abs(playerCards[i].x - deckPosition.x) < 1 &&
                Math.abs(playerCards[i].y - deckPosition.y) < 1) {
                
                    playerCards[i] = { ...deckPosition };
            }
        }
    }
    drawScene();
    if (AllCardTakeBack){
        isDealing.pop();
    }else{
        requestAnimationFrame(animateTackBack);
    }
}

function moveBet(j){
    let moveDone = true;
    if (chips.length >= maxChip){
        lastChip = chips[chips.length-1];
        while(chips.length >= maxChip)
            chips.pop();
        chips.push(lastChip);
    }
    for (let i=0;i<chips.length;i++){
        let targetX, targetY;
        if (j == 1){
            targetX = betChipPosition.x;
            targetY = betChipPosition.y - i * chipIntervalHorizon - betChipPosition.Length;
        }else{
            targetX = betChipPosition.x - 2 * oppo;
            targetY = betChipPosition.y;
        }
        if ((chips[i].x != targetX || chips[i].y != targetY)){
            const dx = (chips[i].x - targetX) / 10;
            const dy = (chips[i].y - targetY) / 10;
            const dsize = (chips[i].Length - betChipPosition.Length) / 10;
            chips[i].x -= dx;
            chips[i].y -= dy;
            chips[i].Length -= dsize;
            moveDone = false;
            if (Math.abs(chips[i].x - targetX) < 1 &&
                Math.abs(chips[i].y - targetY) < 1) {
                
                chips[i].x = targetX;
                chips[i].y = targetY; 
                chips[i].Length = betChipPosition.Length;
            }
        }
    }
    drawScene();
    if (moveDone){
        if (j != 1)
            chips = [];
    }else
        requestAnimationFrame(()=>moveBet(j));
}

function allin(){
    while(placeBet(2));
    while(placeBet(1));
    while(placeBet(0));
}
function changeChip(i){
    bottomChips = bottomChip01[i];
    for (let j=0;j<3;j++){
        chipImg[j].src = `./img/${bottomChips[j].path}.png`;
        if (saving < bottomChips[j].money){
            chipImg[j].classList.add('transparent')
            chipImg[j].classList.remove('hover-image');
        }else{
            chipImg[j].classList.add('hover-image')
            chipImg[j].classList.remove('transparent');
        }
    }
    if (saving < bottomChips[0].money && !signal){
        ALLIN.classList.add('transparent');
        ALLIN.classList.remove('hover-image');
    }else{
        ALLIN.classList.add('hover-image');
        ALLIN.classList.remove('transparent');
    }
}

function placeBet(i) {
    if (saving < bottomChips[i].money){
        return false;
    }
    let chipPosition = { x: bottomChips[i].x, y: bottomChips[i].y};
    let targetPosition;
    if (gameStart)
        targetPosition = { x: betChipPosition.x, y: betChipPosition.y - Math.min(chips.length, maxChip+4) * chipIntervalHorizon  - betChipPosition.Length};
    else
        targetPosition = { x: canvas.width / 2 - placeBetX + Math.min(chips.length, maxChip-1) * chipInterval, y: chipPlaceY};
    isChiping.push(true);
    animateChip(chipPosition, targetPosition, bottomChips[i].path, i);

    totalBet += bottomChips[i].money;
    saving -= bottomChips[i].money;
    bottomChips[0].money == 10? changeChip(0) : changeChip(1); // If use all the saving, transparent the chip
    return true;
}

function animateChip(startPosition, targetPosition, path, idx) {
    const chip = { ...startPosition, path: path, Length: chipLength, idx:bottomChips[0].money == 10? idx : idx+1};
    let targetLength = gameStart ? betChipPosition.Length : chipLength;
    function moveChip() {
        drawScene();
        const dx = (targetPosition.x - chip.x) / 10;
        const dy = (targetPosition.y - chip.y) / 10;
        const dsize = (targetLength - chip.Length) / 10;

        chip.x += dx;
        chip.y += dy;
        chip.Length += dsize;
        context.drawImage(chipImages[chip.idx], chip.x, chip.y, chip.Length, chip.Length);

        if (Math.abs(chip.x - targetPosition.x) > 1 || Math.abs(chip.y - targetPosition.y) > 1) {
            requestAnimationFrame(moveChip);
        } else {
            chip.x = targetPosition.x;
            chip.y = targetPosition.y;
            isChiping.pop();
            drawScene();
        }
    }
    moveChip();
    chips.push(chip);
}

function animateFlip(oner, cardIndex) {
    let angle = 0;
    const card = (oner == "dealer" ? dealerCards[cardIndex] : playerCards[cardIndex]);
    const flipInterval = setInterval(() => {
        context.clearRect(card.x, card.y, cardSizeX, cardSizeY);
        context.save();

        context.translate(card.x + 25, card.y + 35);
        context.scale(Math.abs(Math.cos(angle)), 1); 
        context.translate(-card.x - 25, -card.y - 35);

        if (Math.abs(Math.cos(angle)) < 0.1) {
            card.isFaceUp = !card.isFaceUp;
        }
        const cardKey = `${card.value}${card.suit}`;
        context.drawImage(card.isFaceUp ? cardsImage[cardKey] : deckImage, card.x, card.y, cardSizeX, cardSizeY);
        context.restore();
        angle += Math.PI / 20; 
        if (angle >= Math.PI) { 
            clearInterval(flipInterval);
            drawScene(); 
        }
    }, 20);
}

function takeBackCard(){
    for (let i=0;i<dealerCards.length;i++){
        if (dealerCards[i].isFaceUp)
            animateFlip("dealer", i);
    }
    for (let i=0;i<playerCards.length;i++){
        if (playerCards[i].isFaceUp)
            animateFlip("player", i);
    }
    setTimeout(() => {
        isDealing.push(true);
        animateTackBack(); 
    }, flipTimeout);
}
