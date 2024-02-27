let active = false;
let playSoundtrack = false;

import { soundtrack } from './main.js'

export function startTimer() {
    if(!playSoundtrack){
        soundtrack()
        playSoundtrack = true;
    }
    if(active == true) {
        return;
    } else {
        active = true;
        let timeLimit = new Date(Date.now() + (2 * 60 * 1000));

        let interval = setInterval(function() {
            let now = new Date(Date.now());
            let timeLeft = timeLimit - now;
            let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            document.getElementById("time_left").innerHTML = "Time left " + minutes + ":" + ((seconds <= 9) ? "0" + seconds : seconds);

            if(minutes == 0 && seconds <= 59)
                document.getElementById("time_left").style.color = "red";
            if (timeLeft < 0) {
                clearInterval(interval);
                location.href = 'loss.html';
            }
        }, 1000);
    }
}

export function showValue(value){
    document.getElementById("picture_value").innerHTML = `<span>$${value}</span>`;
    setTimeout(function() {
        document.getElementById("picture_value").innerHTML = "";
    }, 1500);
}

export function updateValue(value){
    document.getElementById("total_value").innerHTML = `<span>$${value}</span>`;
}

export function numberOfPicsStolen(num){
    document.getElementById("pic_stolen").innerHTML = `<span>${num} (max 5)</span>`;
}