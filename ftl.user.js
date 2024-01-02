// ==UserScript==
// @name        BetterFishtankS2
// @namespace   Violentmonkey Scripts
// @match       *://*.fishtank.live/*
// @grant       GM_getValue
// @grant       GM_setValue
// @version     0.6
// @author      codironblade
// @homepageURL https://github.com/codironblade/BetterFishtankS2
// @updateURL    https://github.com/codironblade/BetterFishtankS2/raw/main/ftl.user.js
// @downloadURL  https://github.com/codironblade/BetterFishtankS2/raw/main/ftl.user.js
// @description Improvements to the fishtank.live website.
// @icon        https://www.google.com/s2/favicons?sz=64&domain=fishtank.live
// @require     https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// ==/UserScript==

//features: bigger player, smaller margin elements, xp bar better spot, alt background, no scanlines, HQ stream by default, 60fps smooth banner, better fishtoy popup, no popup when toggling auto, fix for stream freezing, keybind for auto
//features (cont): persistent volume, no popup for season pass, better "last tts" (gets updated then hides itself), tts flashes room on map, hide garbage from chat
//planned features: move giant fishtoy popup to be somewhere visible

const sleep = function(s){return new Promise(resolve => setTimeout(resolve, s*1000));};
const clickThing = function(v) {
    v.click();
    document.activeElement?.blur();
}
const roomMapArray = [[5,2],[3,5],[3,2],[3,3],[3,4],[5,3],[5,4],[5,5],[6,3],[4,6],[4,5]];
const roomMapDict = {["bedroom 1"]:[5,2],["bedroom 2"]:[3,5],["bedroom 3"]:[3,2],["bunk"]:[3,3],["hallway upstairs"]:[3,4],["hallway downstairs"]:[5,3],["living room"]:[5,4],["lounge"]:[5,5],["bar"]:[6,3],["kitchen"]:[4,6],["dog house"]:[4,5]};
const settings = {CHtts:false,CHsfx:false,CHemote:false,CHhappening:false,CHsystem:false,CHclan:false,CHdefault:false,ttstime:51,bg:"Blue"};
const settingsInfo = [["CHtts","Chat hide TTS"],["CHsfx","Chat hide SFX"],["CHemote","Chat hide emotes/commands"],["CHhappening","Chat hide items"],["CHsystem","Chat hide system"],["CHclan","Chat hide clan stuff"],
                      ["CHdefault","Chat hide chats"],["ttstime","TTS popup seconds"],["bg","Background Image","Blue","Dark","Default"]];
const savedStr = GM_getValue("ftlsave");
//console.log("savedStr:",savedStr);
for (const [k,v] of Object.entries( savedStr ? JSON.parse(savedStr) : {} )) {
	settings[k] = v;
}
const save = function(){
    GM_setValue("ftlsave",JSON.stringify(settings));
}
const playerEdits = [[".live-stream-fullscreen_left__idsvZ",{flex:"2% 1"}],[".live-stream-fullscreen_right___UCNg",{flex:"2% 1"}],[".live-stream-fullscreen_video__PnHrq",{padding:"4px"}],
[".live-stream-fullscreen_close__JY_lb",{margin:"0px"}],[".live-stream-fullscreen_close__JY_lb > button",{height:"30px",width:"30px"}]];
const mapEdits = [[".house-map-panel_body__XeFna",{["--button-width"]:"33px",["--button-height"]:"33px"}],[".house-map-panel_top__lscc_",{["--horizontal-gap"]:"22px",["--button-width"]:"33px"}],[".house-map-panel_bottom__g0Ylc",{["--horizontal-gap"]:"40px"}],
[".house-map-panel_left__NsvAM",{["--vertical-gap"]:"41px",["--button-height"]:"32px"}],[".house-map-panel_right__6UZm4",{["--vertical-gap"]:"50px",["--button-height"]:"33px"}]];
const editStyle = function(v,editsList){
    for (let i=0; i<editsList.length; i++) {
        const e = editsList[i];
        v.arrive(e[0],{onceOnly:true,existing:true},function(v2){
            for (const [k, v] of Object.entries(e[1])) {
                v2.style.setProperty(k,v);
            }
        });
    }
}
document.arrive(".background_background__fNMDL",{onceOnly:true,existing:true},function(v){
    if (settings.bg === "Blue") {
        v.style.backgroundImage = "url(https://cdn.discordapp.com/attachments/618941660453142529/1190422264110391407/altbg.jpg)";
    } else if (settings.bg === "Dark") {
        v.style.backgroundImage = "none";
        v.style.backgroundColor = "#171616";
    }
    //remove scanlines
    let removeFilter = document.createElement('style');
    removeFilter.textContent = 'body::after { content: none }';
    document.body.appendChild(removeFilter);
});
document.arrive("main",{onceOnly:true,existing:true},function(v){
    v.style.gridTemplateRows = "52px auto 1fr auto";
    v.style.gridTemplateColumns = "220px auto 360px 360px";
});


document.arrive(".live-stream-fullscreen_live-stream-fullscreen__zpNvE",async function(v){
    v.parentElement.style.zIndex = 99;
    v.parentElement.parentElement.style.gridRow = "3/4";
    editStyle(v,playerEdits);
    let playing = Date.now();
    while (document.contains(v)) {
        await sleep(0.2);
        const player = v.querySelector("video");
        if (!player) {
            return;
        }
        if (player.paused===false || player.readyState > 0) {
            playing=Date.now();
        } else if ((Date.now()-playing)/1000 > 3) {
            //unfreeze the stream
            const curcam = document.querySelector(".live-stream-fullscreen_name__C3TdW").textContent;
            const autocams = document.querySelector(".live-streams-auto-mode_live-streams-auto-mode__pE2X_ > .checkbox_checked__ibaIs");
            autocams?.click();
            await sleep(0.05);
            document.querySelector(".live-stream-fullscreen_close__JY_lb > button")?.click();
            await sleep(0.05);
            document.getElementById(curcam.toLowerCase().replace(" ","-"))?.click();
            await sleep(0.1);
            autocams?.click();
            return;
        }
        const slider = document.querySelector(".live-stream-volume_slider__s0Oqh");
        if (slider) {
            player.volume = slider.valueAsNumber/100;
        }
    }
});
document.arrive(".house-map-panel_house-map-panel__yJhI_",function(v){
    editStyle(v,mapEdits);
});
document.arrive(".stats_stats__SIg_t",function(v){
    if (v.classList.length === 1) {
        v.style.alignSelf = "start";
    }
});
document.arrive(".secondary-panel_secondary-panel__vUc65",{onceOnly:true},function(v){
    document.arrive(".experience-bar_experience-bar__nVDge",{onceOnly:true,existing:true},function(e){
        v.prepend(e);
    });
});
document.arrive(".secondary-panel_header__MbhpO",{onceOnly:true},function(v){
    v.style.width = "23%";
});
//hide season pass
document.arrive(".toast_season-pass__cmkhU",function(v){
    v.arrive(".toast_close__iwAGl > button",{onceOnly:true,existing:true},clickThing);
});

//make LED banner smoother
let h1 = null;
const smoother = function() {
    const dur = h1.style.animationDuration;
    h1.style.animationTimingFunction = "steps(" + (Number(dur.substring(0,dur.length-1))*60) +",start)";
    h1.parentElement.style.height = "34px";
}
document.arrive(".led-text_led__xdruo > h1",{onceOnly:true},function(h){
    h1 = h;
    smoother();
    (new MutationObserver(smoother)).observe(h1,{characterData:true,attributes:true});
});

//default high quality
document.arrive(".live-stream-controls_right__u0Dox > label",{onceOnly:true},clickThing);

//no popup for toggling auto cams
document.arrive(".toast_message__l35K3 > h3",function(v){
    if (v.textContent.substring(0,9) === "Auto mode") {
        v.parentElement.parentElement.arrive("button",{onceOnly:true,existing:true},clickThing);
    }
})

//chat stuff
let initHideLast = true;
let roomElClone = null;
document.arrive(".chat_messages__2IBEJ > div > div",async function(v){
    for (const[set,value] of Object.entries(settings)) {
        if (set.substring(0,2)=="CH" && (v.className.substring(0,set.length+11) === "chat-message-"+set.substring(2))) {
            if (value===true) {
                v.style.display = "none";
                //v.style.backgroundColor = "red";
            }
            if (set !== "CHtts") {
                return;
            }
            //update the "last tts" because wes won't
            initHideLast = false;
            await sleep(0.5);
            document.querySelector(".tts-history_title__sfog8").childNodes[0].textContent = "New TTS";
            const userNodes = document.querySelector(".tts-history_user__Wzyf_").childNodes;
            if (userNodes.length>1) {
                userNodes[0].style.display = "none";
            }
            userNodes[userNodes.length-1].textContent = v.querySelector(".chat-message-tts_from__1QSqc").textContent;
            const text = v.querySelector(".chat-message-tts_message__sWVCc").textContent;
            const textElement = document.querySelector(".tts-history_text__ZVdV8");
            const roomElement = document.querySelector(".tts-history_room__QNUZ0");
            const timeElement = document.querySelector(".tts-history_timestamp__mVYdp");
            const roomText = v.querySelector(".chat-message-tts_room__1lmqo").textContent.toLowerCase();
            const roomPair = roomMapDict[roomText];
            textElement.style.color = "#ff1d00";
            textElement.style.animationTimingFunction = "steps(600, start)";
            textElement.style.textShadow = "0 0 8px #bd0000";
            textElement.textContent = text;
            if (roomElement) {
                roomElement.textContent = roomText;
                if (!roomElClone) {
                    roomElClone = roomElement.cloneNode(true);
                }
            } else if (roomElClone) {
                roomElClone.textContent = roomText;
                timeElement.parentElement.prepend(roomElClone);
                roomElClone = roomElClone.cloneNode(true);
            }
            timeElement.textContent = v.querySelector(".chat-message-tts_timestamp__pIVv0").textContent;
            document.querySelector(".tts-history_tts-history__8_9eB").style.display = "flex";
            if (roomPair) {
                //highlight tts on map
                const btnContainer = document.querySelector(".house-map-panel_click-area__xswcw:nth-child("+(roomPair[0])+")");
                const roomBtn = btnContainer?.querySelector("button:nth-child("+(roomPair[1])+")");
                if (roomBtn) {
                    for (let i=0; i<Math.min(6,settings.ttstime); i++) {
                        const curcam = document.querySelector(".live-stream-fullscreen_name__C3TdW")?.textContent.toLowerCase();
                        if (curcam !== roomText) {
                            roomBtn.style.opacity = "50%";
                            roomBtn.style.backgroundColor = "yellow";
                        }
                        await sleep(0.5);
                        roomBtn.style.opacity = null;
                        roomBtn.style.backgroundColor = null;
                        await sleep(0.5);
                    }
                }
            }
            await sleep(settings.ttstime-6);
            if (textElement.textContent === text) {
                document.querySelector(".tts-history_tts-history__8_9eB").style.display = "none";
            }
            return;
        }
    }
});
document.arrive(".chat_messages__2IBEJ",{onceOnly:true},function(chat){
    chat.style.padding = "0px";
});
window.setTimeout(function(){
    //hide TTS at start but then show it when there's a fishtoy
    const uilast = document.querySelector(".tts-history_tts-history__8_9eB");
    window.saveobserver123 = (new MutationObserver(function(){ uilast.style.display = "flex"; }));
    window.saveobserver123.observe(document.querySelector(".tts-history_footer__sgV9n"),{childList:true});
    if (initHideLast) {
        uilast.style.display = "none";
        roomElClone = document.querySelector(".tts-history_room__QNUZ0")?.cloneNode(true);
    }
},12*1000);

//settings ui
let ourBtn = null;
let ourSettings = null;
const onSetBtnClick = function() {
    if (document.contains(ourSettings)) {
        return;
    }
    const m = document.querySelector(".settings-modal_body__qdvDm");
    document.querySelector(".settings-modal_selected__mTdzu")?.classList.remove("settings-modal_selected__mTdzu");
    ourBtn.classList.add("settings-modal_selected__mTdzu");
    for (let i=0; i<m.children.length; i++) {
        m.children[i].style.display="none";
    }
    const container0 = document.createElement("div");
    container0.style.display = "flex";
    container0.style.flexDirection = "column";
    for (let i=0; i<settingsInfo.length; i++) {
        const thisInfo = settingsInfo[i];
        const setKey = thisInfo[0];
        const setDesc = thisInfo[1];
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.justifyContent = "space-between";
        if (i%2===0){
            container.style.backgroundColor = "#0000001A";
        }
        container.style.height = "40px";
        container.style.alignItems = "center";
        const lbl = document.createElement("span");
        lbl.textContent = setDesc;
        lbl.style.color = "black";
        lbl.style.fontSize = "22px";
        container.appendChild(lbl);
        if (typeof(settings[setKey]) === "boolean") {
            //bool button
            const btn = document.createElement("button");
            btn.style.width = "25%";
            btn.style.backgroundColor = "darkslategrey";
            btn.textContent = settings[setKey].toString();
            container.appendChild(btn);
            btn.addEventListener("click",function(){
                const newVal = !settings[setKey];
                settings[setKey] = newVal;
                btn.textContent = newVal.toString();
                save();
            });
        } else if (typeof(settings[setKey]) === "number") {
            //textbox for number
            const box = document.createElement("input");
            box.role = "text";
            box.contentEditable = true;
            box.contenteditable = true;
            box.style.width = "25%";
            box.style.backgroundColor = "#242424";
            box.style.textAlign = "center";
            box.value = settings[setKey];
            container.appendChild(box);
            const textBoxChanged = function(event) {
                if (event.keyCode && event.key !== "Enter") return;
                const input = event.target;
                let n = parseFloat((input.value || '').replaceAll(/[^\d\.]/g,""));
                if (n !== n) {
                    input.value = settings[setKey];
                    return;
                }
                input.value = n;
                if (settings[setKey] === n) return;
                settings[setKey] = n;
                save();
            }
            box.addEventListener("blur",textBoxChanged);
            box.addEventListener("keypress",textBoxChanged);
        } else if (thisInfo.length > 2) {
            //dropdown options
            const btn = document.createElement("select");
            btn.style.width = "25%";
            btn.style.backgroundColor = "#242424";
            btn.style.fontSize = "16px";
            btn.style.textAlign = "center";
            container.appendChild(btn);
            for (let j=2; j<thisInfo.length; j++) {
                const option = document.createElement("option");
                option.value = thisInfo[j];
                option.textContent = option.value;
                btn.appendChild(option);
            }
            btn.selectedIndex = thisInfo.indexOf(settings[setKey]) - 2;
            btn.addEventListener("change",function(){
                settings[setKey] = thisInfo[btn.selectedIndex+2];
                save();
                if (setKey === "bg") {
                    const back = document.querySelector(".background_background__fNMDL");
                    if (settings.bg === "Blue") {
                        back.style.backgroundImage = "url(https://cdn.discordapp.com/attachments/618941660453142529/1190422264110391407/altbg.jpg)";
                    } else if (settings.bg === "Dark") {
                        back.style.backgroundImage = "none";
                        back.style.backgroundColor = "#171616";
                    } else {
                        back.style.backgroundImage = "url(https://cdn.fishtank.live/images/patterns/green-bg.png)";
                    }
                }
            });
        }
        container0.appendChild(container);
    }
    m.appendChild(container0);
    ourSettings = container0;
    const mut = (new MutationObserver(function(){
        container0.remove();
        mut.disconnect();
        ourBtn.classList.remove("settings-modal_selected__mTdzu");
    }));
    mut.observe(m,{childList:true});
}
document.arrive(".settings-modal_password___da3r  > button > div",function(tocloned){
    if (document.contains(ourBtn)) {
        return;
    }
    ourBtn = tocloned.parentElement.parentElement.cloneNode(true);
    tocloned.parentElement.parentElement.parentElement.appendChild(ourBtn);
    ourBtn.querySelector("button > div").textContent = "SCRIPT";
    ourBtn.querySelector("button").addEventListener("click",onSetBtnClick);
})

//keyboard input
document.addEventListener("keydown", function(event) {
    if (event.isComposing || document.activeElement?.selectionStart !== undefined || document.activeElement?.isContentEditable) {
        return;
    }
    let keyn = parseInt(event.key);
    if (event.key === "-") {
        keyn = 11;
    } else if (keyn === 0 || event.key === "*") {
        keyn = 10;
    }

    if (keyn) {
        //disabled numpad navigation due to wes' worse implementation
        //const btnContainer = document.querySelector(".house-map-panel_click-area__xswcw:nth-child("+(roomMapArray[keyn-1][0])+")");
        //btnContainer?.querySelector("button:nth-child("+(roomMapArray[keyn-1][1])+")")?.click();
    } else if (event.key === "m") {
        if (document.activeElement?.classList.contains("livepeer-aspect-ratio-container")) {
            document.activeElement?.blur();
        }
        const slider = document.querySelector(".live-stream-volume_slider__s0Oqh");
        slider.value = (slider.valueAsNumber>0) ? 0 : 100;
        slider.dispatchEvent(new CustomEvent("input", { bubbles: true, cancelable: true }));
    } else if (event.key === ".") {
        document.querySelector(".live-streams-auto-mode_live-streams-auto-mode__pE2X_ > label")?.click();
        document.activeElement?.blur();
    } else if (event.keyCode === 191) { // slash
        window.setTimeout(function(){ document.getElementById("chat-input").focus() },99);
    }
});
