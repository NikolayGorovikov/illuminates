
    const can = document.createElement("canvas");
    document.getElementById("canvasHolder").append(can);
    can.width = can.height = Math.min(window.innerWidth, window.innerHeight)*0.44;
    const spots = [
        [0.5, 0.2],
        [0.2, 0.8],
        [0.8, 0.8],
        [0.5,0.5]
    ];
    let speed = 0.5;
    let color = "rgb(123,212,321)";
    function setSpot(index, cords) {
        cords = [...cords];
        spots[index] = cords;
        localStorage.setItem(`spot${index}`, JSON.stringify(spots[index]));
    }
    setTimeout(()=>{
        if (!localStorage.getItem("spot0")) {
            for (let i = 0; i < 4; i++) setSpot(i, spots[i]);
        }
        else {
            setSpot(0, JSON.parse(localStorage.getItem("spot0")));
            setSpot(1, JSON.parse(localStorage.getItem("spot1")));
            setSpot(2, JSON.parse(localStorage.getItem("spot2")));
            setSpot(3, JSON.parse(localStorage.getItem("spot3")));
        }
        if (!localStorage.getItem("color")) setColor(color);
        else setColor(localStorage.getItem("color"));
        if (!localStorage.getItem("speed")) setSpeed(speed);
        else setSpeed(localStorage.getItem("speed"));
        drawFrame();
    });

    function setColor(rgb) {
        localStorage.setItem(`color`, String(rgb));
        color = String(rgb);
        can.style.boxShadow = `${String(rgb)} 0 0 15px`;
        document.getElementById("color").style.border = `border: ${String(rgb)} 0.6vmin solid;`
    }
    function setSpeed(speed) {
        localStorage.setItem(`speed`, String(speed));
        speed = Number(speed);
    }

    const con = can.getContext("2d");

    function drawFrame() {
        con.beginPath();
        con.clearRect(0,0,can.width,can.height);
        con.lineWidth = can.width/100;
        con.lineCap = "round";
        con.strokeStyle = color;
        con.moveTo(spots[0][0]*can.width, spots[0][1]*can.width);
        con.lineTo(spots[1][0]*can.width, spots[1][1]*can.width);
        con.moveTo(spots[1][0]*can.width, spots[1][1]*can.width);
        con.lineTo(spots[2][0]*can.width, spots[2][1]*can.width);
        con.moveTo(spots[2][0]*can.width, spots[2][1]*can.width);
        con.lineTo(spots[0][0]*can.width, spots[0][1]*can.width);
        con.stroke();
        con.closePath();
        con.beginPath();
        con.fillStyle = "rgba(50,50,50,0.7)";
        con.arc(spots[0][0]*can.width, spots[0][1]*can.width, can.width/30, 0, Math.PI*2);
        con.fill();
        con.closePath();
        con.beginPath();
        con.arc(spots[1][0]*can.width, spots[1][1]*can.width, can.width/30, 0, Math.PI*2);
        con.fill();
        con.closePath();
        con.beginPath();
        con.arc(spots[2][0]*can.width, spots[2][1]*can.width, can.width/30, 0, Math.PI*2);
        con.fill();
        con.closePath();
        con.beginPath();
        con.arc(spots[3][0]*can.width, spots[3][1]*can.width, can.width/30, 0, Math.PI*2);
        con.fill();
        con.closePath();
    }

    window.onresize = () => {
        can.width = can.height = Math.min(window.innerWidth, window.innerHeight)*0.44;
        drawFrame();
        actualHeight = document.documentElement.getBoundingClientRect().height;
        actualWidth = document.documentElement.getBoundingClientRect().width;
        document.querySelectorAll(".slider>.dragger, .sliderLightness>.dragger, .sliderSaturation>.dragger").forEach((e)=>{
            e.style.width= "3.5vmin";
            e.style.height= "14vmin";
            e.style.left = (e.parentElement.getBoundingClientRect().width - e.getBoundingClientRect().width)*e.left+(Math.min(actualWidth, actualHeight)*5.95/100-Math.min(actualWidth, actualHeight)*3.5/100)/2+"px";
        });
    }

    let pressed = false;

    function moveListener(index, diffs, id, event) {
        if (id !== event.pointerId) return;
        const x = event.pageX - can.getBoundingClientRect().x;
        const y = event.pageY - can.getBoundingClientRect().y;
        setSpot(index, [Math.min(1-1/30, Math.max((can.width/30+1)/can.width, (x + diffs[0])/can.width)), Math.min(1-1/30, Math.max((can.width/30+1)/can.width, (y + diffs[1])/can.width))]);
        drawFrame();
    }

    function remover() {
        document.removeEventListener("pointermove", actualListener);
        pressed = false;
    }

    let actualListener, animation, angle = 0;


    function rotate() {
        pressed = true;
        let at = performance.now();
        function fn1(time) {
            const t2 = time - at;
            angle = t2*speed/500*Math.PI;
            at = time;
            angleSpots();

            animation = requestAnimationFrame(fn1);
        }
        animation = window.requestAnimationFrame(fn1);
        stopRotate = () => {
            window.cancelAnimationFrame(animation);
            pressed = false;
        }
    }

    let stopRotate = () => {};

    function angleSpots() {
        const xx = spots[3][0];
        const yy = spots[3][1];
        for (let i = 0; i < 3; i++) {
            const r = Math.sqrt( (xx - spots[i][0])**2 + (yy - spots[i][1])**2 );
            const dx = xx - spots[i][0];
            const dy = yy - spots[i][1];
            let atan = Math.atan(dy/dx);
            if (dx > 0) atan+=Math.PI;
            const an = atan+angle;
            setSpot(i, [xx+r*Math.cos(an), yy+r*Math.sin(an)]);
        }
        drawFrame();
    }


    document.addEventListener("pointerdown", (event)=>{
        if (!pressed) {
            const x = event.pageX - can.getBoundingClientRect().x;
            const y = event.pageY - can.getBoundingClientRect().y;
            for (let i = 0; i < 4; i++) {
                const xx = spots[i][0]*can.width;
                const yy = spots[i][1]*can.height;
                if (Math.sqrt( (xx - x)**2 + (yy-y)**2 ) <= can.width/30) {
                    actualListener = moveListener.bind(null, i, [xx - x, yy-y], event.pointerId);
                    document.addEventListener("pointermove", actualListener);
                    document.addEventListener("pointerup", remover.bind(event.pointerId), {once: true});
                    pressed = true;
                    break;
                }
            }
        }
    });

    document.querySelector(`[data-link="rotate"]`).addEventListener("pointerdown", (event)=>{
        console.log(event.target.dataset.link);
        event.stopImmediatePropagation();
        if (event.target.dataset.link === "rotate") {
            event.target.dataset.link = "stop";
            event.target.innerHTML = "Остановить!";
            rotate();
        }
        else {
            event.target.dataset.link = "rotate";
            event.target.innerHTML = "Вращать!";
            stopRotate();
        }
    });

    let gradient;
    for (let i of document.querySelectorAll(".dragger")) i.insertAdjacentHTML("afterbegin", '<div class="drin"></div>');
    function randomInteger(a,b){
        return a+Number(((b-a)*Math.random()).toFixed(0));
    }
    let actualWidth = innerWidth;
    let actualHeight = innerHeight;
    function getAmount(e, max, main, spec){
        let actualLeft = parseFloat(e.style.left) - ((max - e.getBoundingClientRect().width) > 0?max - e.getBoundingClientRect().width:0)/2;
        if (actualLeft < 0) actualLeft = 0;
        else if (actualLeft + e.getBoundingClientRect().width > e.parentElement.getBoundingClientRect().width) actualLeft = e.parentElement.getBoundingClientRect().width - e.getBoundingClientRect().width;
        if (!main || spec){
            e.left = actualLeft/(e.parentElement.getBoundingClientRect().width-e.getBoundingClientRect().width);
            return actualLeft/(e.parentElement.getBoundingClientRect().width-e.getBoundingClientRect().width);
        }
        else return e.left;
    }
    document.querySelectorAll(".dragger").forEach((e)=>e.style.left = randomInteger(0, Math.floor(e.parentElement.getBoundingClientRect().width - e.getBoundingClientRect().width))+"px");
    function refactor(a,b,c){
        let deg = getAmount(document.querySelector(".slider > .dragger"), Math.min(actualHeight, actualWidth)*5.95/100, a, a&&b&&c)*360;
        let satur = getAmount(document.querySelector(".sliderSaturation .dragger"), Math.min(actualHeight, actualWidth)*5.95/100, b,a&&b&&c)*100;
        let light = getAmount(document.querySelector(".sliderLightness .dragger"), Math.min(actualHeight, actualWidth)*5.95/100, c,a&&b&&c)*100;
        if (a){
            gradient="linear-gradient(90deg";
            for (let i = 0;i<360; i++){
                gradient+=",hsl("+(i+1)+", "+satur+"%, "+light+"%)";
            }
            gradient+=")";
            document.querySelector(".slider").style.backgroundImage = gradient;
        }
        if (b){
            gradient="linear-gradient(90deg";
            for (let i = 0;i<100; i+=0.5){
                gradient+=",hsl("+deg+", "+i+"%, "+light+"%)";
            }
            gradient+=")";
            document.querySelector(".sliderSaturation").style.backgroundImage = gradient;
        }
        if (c){
            gradient="linear-gradient(90deg";
            for (let i = 0;i<100; i+=0.5){
                gradient+=",hsl("+deg+", "+satur+"%, "+i+"%)";
            }
            gradient+=")";
            document.querySelector(".sliderLightness").style.backgroundImage = gradient;
        }
        document.getElementById("color").style.backgroundColor = "hsl("+deg+","+satur+"%,"+light+"%)";
        let one6=document.getElementById("color").style.backgroundColor.split("rgb").join("").split(")").join("").split("(").join("").split(",").map((e)=>e.split(" ").join(""));
        setColor("#"+Number(one6[0]).toString(16).padStart(2, "0")+Number(one6[1]).toString(16).padStart(2, "0")+Number(one6[2]).toString(16).padStart(2, "0"));
        drawFrame();
    }
    refactor(true, true, true);
    function begin(elem){
        clearInterval(elem.drop);
        let finalWidth = Math.min(actualWidth, actualHeight)*3.5*0.7/100;
        elem.interval = setInterval(function (){
            if (parseFloat(elem.style.width) > Math.min(actualWidth, actualHeight)*5.95/100) {
                clearInterval(elem.interval);
                return;
            }
            elem.style.width = parseFloat(elem.style.width) + finalWidth/15 + "px";
            if (parseFloat(elem.style.left) - finalWidth/30 > 0 && parseFloat(elem.style.left) - finalWidth/30 + parseFloat(elem.style.width) < elem.parentElement.offsetWidth) elem.style.left = parseFloat(elem.style.left) - finalWidth/30 + "px";
            else if (parseFloat(elem.style.left) - finalWidth/30 < 0) elem.style.left = "0";
            else elem.style.left = elem.parentElement.offsetWidth - parseFloat(elem.style.width) + "px";
        }, 6);
    }
    function move(elem){
        if (parseFloat(elem.style.left) < 0) elem.style.left = "0";
        else if (elem.offsetLeft+elem.getBoundingClientRect().width > elem.parentElement.getBoundingClientRect().width) elem.style.left = elem.parentElement.getBoundingClientRect().width - elem.getBoundingClientRect().width + "px";
        if (elem.parentElement.classList.contains("slider")) refactor(false, true, true);
        else if (elem.parentElement.classList.contains("sliderSaturation")) refactor(true, false, true);
        else refactor(true, true, false);
    }
    function drop(elem){
        clearInterval(elem.interval);
        let finalWidth = Math.min(actualWidth, actualHeight)*3.5*0.7/100;
        elem.drop = setInterval(function (){
            if (parseFloat(elem.style.width) < Math.min(actualWidth, actualHeight)*3.5/100) {
                clearInterval(elem.drop);
                return;
            }
            elem.style.left = parseFloat(elem.style.left) + finalWidth/30 + "px";
            elem.style.width = parseFloat(elem.style.width) - finalWidth/15 + "px";
        }, 6);
    }

    window.addEventListener("touchend", (e)=>e.preventDefault());
