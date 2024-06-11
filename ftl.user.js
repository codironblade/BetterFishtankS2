// ==UserScript==
// @name        BetterFishtankS2
// @namespace   Violentmonkey Scripts
// @match       *://*.fishtank.live/*
// @grant       GM_getValue
// @grant       GM_setValue
// @version     0.97
// @author      codironblade
// @homepageURL https://github.com/codironblade/BetterFishtankS2
// @updateURL    https://raw.githubusercontent.com/codironblade/BetterFishtankS2/main/ftl.user.js
// @downloadURL  https://raw.githubusercontent.com/codironblade/BetterFishtankS2/main/ftl.user.js
// @description Improvements to the fishtank.live website.
// @icon        https://www.google.com/s2/favicons?sz=64&domain=fishtank.live
// @require     https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// ==/UserScript==

const sleep = function(s){return new Promise(resolve => setTimeout(resolve, s*1000));};
const clickThing = function(v) {
    v.click();
    document.activeElement?.blur();
}
const settings = {CHtts:false,CHsfx:false,CHemote:false,CHhappening:false,CHsystem:false,CHclan:false,CHdefault:false,bgbr:40,bg:"Default",muteAll:false};
const settingsInfo = [["CHtts","Chat hide TTS"],["CHsfx","Chat hide SFX"],["CHemote","Chat hide emotes/commands"],["CHhappening","Chat hide items"],["CHsystem","Chat hide system"],["CHclan","Chat hide clan stuff"],
                      ["CHdefault","Chat hide chats"],["bgbr","Background Brightness"],["bg","Background Image","Blue","Dark","S2 Green","Default"],["muteAll","Mute all UI sounds"]];
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
const mapEdits = [[".house-map-panel_body__XeFna",{["--button-width"]:"33px",["--button-height"]:"33px"}],[".house-map-panel_top__lscc_",{["--horizontal-gap"]:"2px",["--button-width"]:"33px"}],[".house-map-panel_bottom__g0Ylc",{["--horizontal-gap"]:"40px"}],
[".house-map-panel_left__NsvAM",{["--vertical-gap"]:"41px",["--button-height"]:"32px"}],[".house-map-panel_right__6UZm4",{["--vertical-gap"]:"41px",["--button-height"]:"33px"}]];
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
let defaultbg = "";
document.arrive(".background_background__fNMDL",{onceOnly:true,existing:true},function(v){
    defaultbg = v.style.backgroundImage;
    if (settings.bg === "Blue") {
        v.style.backgroundImage = "url(https://i.imgur.com/mbrRNrf.jpeg)";
    } else if (settings.bg === "Dark") {
        v.style.backgroundImage = "none";
        v.style.backgroundColor = "#171616";
    } else if (settings.bg === "S2 Green") {
        v.style.backgroundImage = "url(https://cdn.fishtank.live/images/patterns/green-bg.png)";
        v.style.backgroundSize = "cover";
    }
    v.style.opacity = (settings.bgbr > 99) ? 1 : "0."+settings.bgbr;
    //remove scanlines
    let removeFilter = document.createElement('style');
    removeFilter.textContent = 'body::after { content: none }';
    document.body.appendChild(removeFilter);
});
document.arrive("main",{onceOnly:true,existing:true},function(v){
    v.style.gridTemplateRows = "5% auto 1fr auto";
    v.style.gridTemplateColumns = "11% auto 16.7%";
});

document.arrive("#main-panel",{onceOnly:true},function(m){
    //m.style.gridRow = "3/4";
    m.arrive("#live-stream-player",function(v){
        //handle new player
        v.parentElement.style.zIndex = 99;
        //editStyle(v,playerEdits);
    });
    m.arrive("#livepeer-video-player > div > div",function(v){
        v.style.height="94%";
    });
    m.arrive(".happening_item__Y7BtW",async function(v){
        //move the big fishtoy popup
        await sleep(0.2)
        v.style.fontSize = "25px";
        const clone = v.parentElement.parentElement.cloneNode(true);
        clone.style.height = "75%";
        clone.style.top = "6%";
        document.getElementById("chat-messages")?.parentElement.appendChild(clone);
        await sleep(6);
        clone.remove();
    });
});
document.arrive(".poll_footer__rALdX",{onceOnly:true},function(v){
    v.style.display="block";
})
document.arrive(".top-bar-user_top-bar-user__VUdJm",{onceOnly:true},function(v){
    v.style.zIndex=3;
});
document.arrive(".health_health___IPyk",{onceOnly:true},function(v){
    document.arrive(".status-bar_xp__VzguC",{onceOnly:true,existing:true},function(xp){
        xp.style.width = "130px";
        xp.arrive(".experience-bar_bar__HcNkR",{onceOnly:true,existing:true},function(v2){
            v2.style.height="100%";
        });
        v.parentElement.appendChild(xp);
    });
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
    h1.parentElement.style.height = "30px";
}
document.arrive(".led-text_led__xdruo > h1",{onceOnly:true},function(h){
    h1 = h;
    smoother();
    (new MutationObserver(smoother)).observe(h1,{characterData:true,attributes:true});
});
//poll
let h2 = null;
const smoother2 = async function() {
    h2.style.animationDuration = "7s";
    h2.style.animationTimingFunction = "steps(420, start)";
}
document.arrive(".poll-question_text__PKByz",{onceOnly:true},function(h){
    h2 = h;
    smoother2();
    (new MutationObserver(smoother2)).observe(h2,{characterData:true,attributes:true});
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
document.arrive("#chat-messages > div",async function(v){
    v.parentElement.parentElement.style.padding = "0px";
    for (const[set,value] of Object.entries(settings)) {
        if (set.substring(0,2)=="CH" && (v.className.substring(0,set.length+11) === "chat-message-"+set.substring(2))) {
            if (value===true) {
                v.style.display = "none";
                //v.style.backgroundColor = "red";
            }
        }
    }
});
//edits sounds
const oldPlay = HTMLAudioElement.prototype.play;
let tempMute = false;
HTMLAudioElement.prototype.play = function () {
    if (settings.muteAll || tempMute || this.src.substring(33,39)==="popup-") {
        this.volume = 0;
    } else if (this.src.substring(33) === "fishtoy.wav") {
        this.volume = this.volume / 3;
    }
    return oldPlay.apply(this);
}

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
        lbl.style.color = "white";
        lbl.style.fontSize = "22px";
        lbl.style.fontWeight = "500";
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
                if (setKey === "bgbr") {
                    document.querySelector(".background_background__fNMDL").style.opacity = (settings.bgbr > 99) ? 1 : "0."+settings.bgbr;
                }
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
                    back.style.backgroundSize = null;
                    if (settings.bg === "Blue") {
                        back.style.backgroundImage = "url(https://i.imgur.com/mbrRNrf.jpeg)";
                    } else if (settings.bg === "Dark") {
                        back.style.backgroundImage = "none";
                        back.style.backgroundColor = "#171616";
                    } else if (settings.bg === "S2 Green") {
                        back.style.backgroundImage = "url(https://cdn.fishtank.live/images/patterns/green-bg.png)";
                        back.style.backgroundSize = "cover";
                    } else {
                        back.style.backgroundImage = defaultbg;
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
document.arrive(".settings-modal_password___da3r",function(tocloned){
    //new ui
    if (document.contains(ourBtn)) {
        return;
    }
    ourBtn = tocloned.cloneNode(true);
    tocloned.parentElement.appendChild(ourBtn);
    ourBtn.textContent = "SCRIPT";
    ourBtn.addEventListener("click",onSetBtnClick);
})
//download button for clips
document.arrive(".clip-player_date__Xk3xl",{existing:true},function(v){
    const btn = document.createElement("button");
    btn.title="Download";
    btn.style.height = "24px";
    btn.style.width = "24px";
    btn.style.backgroundColor = "transparent";
    btn.insertAdjacentHTML("afterbegin",'<svg viewBox="0 2 24 24" fill="none"><path d="M12 16L12 8M9 13L11.913 15.913V15.913C11.961 15.961 12.039 15.961 12.087 15.913V15.913L15 13M3 15L3 16L3 19C3 20.1046 3.89543 21 5 21L19 21C20.1046 21 21 20.1046 21 19L21 16L21 15" stroke="#FFFFFF" stroke-width="1.5"></path></svg>');
    v.parentElement.parentElement.appendChild(btn);
    btn.addEventListener("click",function(){
        window.open(document.querySelector('video').src);
    });
});
//hide popups
document.arrive(".faction-troll_pop-up__i5p89",async function(v){
    tempMute=true;
    v.click();
    await sleep(0.2);
    tempMute=false;
});
//S2 ARCHIVE
const archiveState = {r:'',d:'',h:'',v:null};
const onLoadingArchive = async function(){
    archiveState.init = false;
    await sleep(0.06);
    const selectLabels = document.querySelectorAll(".select_current__qZY2v");
    selectLabels.forEach(function(e){ e.style.color=null; });
    const newState = {r:selectLabels[0].textContent,d:selectLabels[1].textContent,h:selectLabels[2].textContent};
    if (newState.r !== archiveState.r) {
        if (newState.d.length === 0) {
            archiveState.doseek = true;
            let anyRed = false;
            tempMute = true;
            for (let i=1; i<3; i++) {
                const stateKey = (i===1 ? "d" : "h")
                const label = selectLabels[i];
                const btn1 = Array.from(label.parentElement.nextElementSibling.children).find(btn => btn.firstElementChild.textContent === archiveState[stateKey]);
                label.textContent = archiveState[stateKey];
                newState[stateKey] = archiveState[stateKey];
                if (anyRed || !btn1) {
                    label.style.color = "red";
                    anyRed = true
                }
                if (btn1) {
                    btn1.click();
                    await sleep(0.2);
                }
            }
            tempMute=false;
        }
    } else {
        archiveState.doseek = false;
    }
    archiveState.r = newState.r; archiveState.d = newState.d; archiveState.h = newState.h;
};
document.arrive(".s2_body__Zco_w",{existing:true},function(s2body){
    s2body.style.width = "1300px";
    archiveState.init = true;
    s2body.arrive(".s2_download__ji7Ga",function(v){
        v.style.position = "absolute";
        v.style.left = "88%";
    });
    s2body.arrive(".s2_video__C3TBK > video",function(v){
        v.style.height = "auto";
        v.parentElement.style.height = "auto";
        v.autoplay=true;
        if (archiveState.v) {
            v.volume = archiveState.v.volume;
            v.muted = archiveState.v.muted;
            if (archiveState.doseek) {
                v.currentTime = archiveState.v.currentTime;
                v.autoplay = !archiveState.paused2;
            } else {
                archiveState.paused2 = false;
            }
        }
        v.addEventListener("pause", function(){
            //if autopause on removal then confirmed wasn't paused
            archiveState.paused2 = document.contains(v);
        });
        v.addEventListener("error",function(){
            //reload properly when it errors instead of freezing
            const t = v.currentTime;
            v.addEventListener("loadstart",function(){v.currentTime=t},{once:true});
            sleep(0.33).then(function(){
                if (v.error && v.error.message.length>1) {
                    v.load();
                }
            });
        });
        archiveState.v = v;
        if (archiveState.init) {
            onLoadingArchive();
        }
    });
    s2body.arrive(".s2_loading__U68cP",onLoadingArchive);
    s2body.arrive(".select_option__lVOGV > span:not(.date)",function(lbl){
        //adds date help to dropdown menu
        if (s2body.querySelector(".s2_options__jWVWM").firstElementChild.contains(lbl)) {
            //room
            return;
        }
        const clone = lbl.cloneNode();
        clone.style.color = "gray";
        clone.style.position = "absolute";
        clone.style.left = "60px";
        clone.className = "date";
        if (s2body.querySelector(".s2_options__jWVWM").lastElementChild.contains(lbl)) {
            //hour
            let hour = parseInt(lbl.textContent);
            hour = hour - 2;
            if (hour < 0) {
                hour = hour + 24;
            }
            clone.textContent = ((hour + 11) % 12 + 1) + (hour >= 12 ? " PM":" AM");
        } else {
            //day
            let n = parseInt(lbl.textContent);
            let mo = "Dec ";
            n = n + 16;
            if (n > 31) {
                n = n - 31;
                mo = "Jan ";
                if (n < 10) {
                    n = "0"+n;
                }
            }
            clone.textContent = mo+n;
        }
        lbl.parentElement.append(clone);
    });
});
document.arrive(".footer_shop__HhQQ3",{existing:true},function(v){
    if (document.location.href.indexOf("archive") > -1) {
        v.remove();
    }
});
//keyboard input
document.addEventListener("keydown", function(event) {
    if (event.isComposing || document.activeElement?.selectionStart !== undefined || document.activeElement?.isContentEditable) {
        return;
    }
    if (event.key === "m") {
        const controls = document.querySelector(".livepeer-video-player_bottom-controls__lU5b3");
        if ((!controls) || (controls.contains(document.activeElement))) {
            return;
        }
        controls.querySelector("button:nth-child(2)")?.click();
    } else if (event.key === "," || event.keyCode === 190) {
        document.querySelector(".status-bar_director__YrTCo")?.click();
        document.activeElement?.blur();
    } else if (event.keyCode === 191) { // slash
        window.setTimeout(function(){ document.getElementById("chat-input").focus() },99);
    }
});
