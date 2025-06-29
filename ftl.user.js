// ==UserScript==
// @name        BetterFishtankS2
// @namespace   Violentmonkey Scripts
// @match       *://*.fishtank.live/*
// @grant       GM_getValue
// @grant       GM_setValue
// @version     1.41
// @author      codironblade
// @homepageURL https://github.com/codironblade/BetterFishtankS2
// @updateURL    https://raw.githubusercontent.com/codironblade/BetterFishtankS2/main/ftl.user.js
// @downloadURL  https://raw.githubusercontent.com/codironblade/BetterFishtankS2/main/ftl.user.js
// @description Improvements to the fishtank.live website.
// @icon        https://www.google.com/s2/favicons?sz=64&domain=fishtank.live
// @require     https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// ==/UserScript==

// PRESS NUMBER KEYS TO NAVIGATE CAMS

const sleep = function(s){return new Promise(resolve => setTimeout(resolve, s*1000));};
const clickThing = function(v) {
    v.click();
    document.activeElement?.blur();
}
const settings = {CHtts:false,CHsfx:false,CHemote:false,CHhappening:false,CHsystem:false,CHclan:false,CHdefault:false,bgbr:40,bg:"Blue",volume:75,muteNukes:true,acceptMissions:false};
const settingsInfo = [["CHtts","Chat hide TTS"],["CHsfx","Chat hide SFX"],["CHemote","Chat hide emotes/commands"],["CHhappening","Chat hide items"],["CHsystem","Chat hide system"],["CHclan","Chat hide clan stuff"],
                      ["CHdefault","Chat hide chats"],["bgbr","Background Brightness"],["bg","Background Image","Blue","Dark","S2 Green","Default"],["volume","Volume of UI sounds"],["muteNukes","Specifically mute nuke sfx"],
                     ["acceptMissions","Auto accept missions"]];
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
document.arrive("main",{existing:true},async function(main){
    main.style.gridTemplateRows = "5.5% auto 1fr 4% auto";
    main.style.gridTemplateColumns = "11% auto 16.7%";

main.arrive("#main-panel",{onceOnly:true,existing:true},function(m){
    //m.style.gridRow = "3/4";
    m.arrive(".livepeer-video-player_controls__y36El",function(v){
        v.style.zIndex = 5;
        //v.style.inset="20px";
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
    //ui visiblity
    m.arrive(".hls-stream-player_hls-stream-player__BJiGl > div",function(ui){
        if (ui.className.substring(0,4)==="live") {
            ui.style.display = "none";
        }
    });
    m.arrive(".live-stream-player_container__A4sNR",function(v){
        v.addEventListener("pointerout",function(){
            document.querySelectorAll(".live-stream-player_container__A4sNR > div").forEach(function(ui){
                if (ui.className.substring(0,4)==="live") {
                    ui.style.display = "none";
                }
            });
        });
        v.addEventListener("pointerover",function(){
            document.querySelectorAll(".live-stream-player_container__A4sNR > div").forEach(function(ui){
                if (ui.className.substring(0,4)==="live") {
                    ui.style.display = "";
                }
            });
        });

    });
    //default high quality
    m.arrive(".hls-stream-player_quality__RdZRA .select_option__lVOGV",function(v){
        if (v.textContent==="1080p" && !v.classList.contains("select_active__2Grrj")) {
            v.click();
        }
    });
});
main.arrive(".poll_footer__rALdX",{onceOnly:true},function(v){
    v.style.display="block";
});
main.arrive(".top-bar-user_top-bar-user__VUdJm",{onceOnly:true},function(v){
    v.style.zIndex=4;
});
    document.arrive(".status-bar_xp__VzguC",{onceOnly:true,existing:true},function(xp){
        xp.style.width = "130px";
        xp.arrive(".experience-bar_bar__HcNkR",{onceOnly:true,existing:true},function(v2){
            v2.style.height="100%";
        });
        xp.parentElement.parentElement.prepend(xp);
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
    h1.parentElement.style.height = "17px";
    h1.style.fontSize = "17px";
}
main.arrive(".led-text_led__xdruo > h1",{onceOnly:true,existing:false},function(h){
    h1 = h;
    smoother();
    (new MutationObserver(smoother)).observe(h1,{characterData:true,attributes:true});
});
//poll
main.arrive(".poll-question_text__PKByz",{onceOnly:false},function(h){
    h.style.animationDuration = "7s";
    h.style.animationTimingFunction = "steps(420, start)";
});
main.arrive(".narrative-poll_hide__vUHD1",{existing:true},function(v){
    v.parentElement.style.gap = "8px";
    const btn = document.createElement("button");
    btn.title="Close";
    btn.style.height = "18px";
    btn.style.width = "18px";
    btn.style.backgroundColor = "transparent";
    btn.style.cursor = "pointer";
    btn.style.gridRow = "1/2";
    btn.style.borderStyle = "none";
    btn.insertAdjacentHTML("afterbegin",'<svg viewBox="4 3 18 18" fill="currentColor"><path d="M11 9H9V7H7v2h2v2h2v2H9v2H7v2h2v-2h2v-2h2v2h2v2h2v-2h-2v-2h-2v-2h2V9h2V7h-2v2h-2v2h-2V9z" stroke="#FFFFFF" stroke-width="0.2"></path></svg>');
    v.insertAdjacentElement("afterend",btn);
    btn.addEventListener("click",function(){
        v.parentElement.parentElement.style.display = "none";
    });
});
//ad block
main.arrive(".ads_ads__Z1cPk",{existing:true},function(v){
    v.style.display = "none";
});
});

let currentCam = "";
let lastCam = "";
document.arrive(".live-stream-player_container__A4sNR ",function(v){
    const vcam = v.id.substring(19);
    if (vcam !== currentCam) {
        lastCam = currentCam;
        currentCam = vcam;
    }
});
//chat stuff
document.arrive("#chat-messages > div",async function(v){
    v.parentElement.parentElement.style.padding = "0px";
    if (v.className.indexOf("chat-message-default")>-1 && v.textContent.toLowerCase().indexOf("/redeem")>-1) {
        v.style.display = "none";
    }
    for (const[set,value] of Object.entries(settings)) {
        if (set.substring(0,2)=="CH" && (v.className.substring(0,set.length+11) === "chat-message-"+set.substring(2))) {
            if (value===true) {
                v.style.display = "none";
                //v.style.backgroundColor = "red";
            }
            if (set !== "CHtts") {
                return;
            }
            const roomText = v.querySelector(".chat-message-tts_room__1lmqo").textContent.toLowerCase();
            const history = document.querySelector(".tts-history_tts-history__8_9eB");
            const roomElement = history.querySelector(".tts-history_room__QNUZ0");
            if (roomElement) {
                roomElement.textContent = roomText;
            }
            for (let i=0; i<5; i++) {
                const curcam = document.querySelector(".live-stream-player_name__nhgrA")?.textContent.toLowerCase();
                if (curcam !== roomText) {
                    history.style.backgroundColor = "#740700";
                }
                await sleep(0.5);
                history.style.backgroundColor = null;
                await sleep(0.5);
            }
        }
    }
});
document.arrive(".chat-message-default_watching__TBGGz",function(v){
    v.nextSibling.textContent = "";
    v.childNodes[1].textContent="";
    v.style.color="gray";
});
//edits sounds
const oldPlay = HTMLAudioElement.prototype.play;
let tempMute = false;
HTMLAudioElement.prototype.play = function () {
    if (tempMute || this.src.substring(33,39)==="popup-" || (this.src.substring(33,38)==="nuke-" && settings.muteNukes)) {
        this.volume = 0;
    } else if (this.src.substring(33) === "fishtoy.wav" && settings.volume > 30) {
        this.volume = this.volume / 3;
    } else {
        this.volume = this.volume * (settings.volume/100);
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
//hide popups
document.arrive(".faction-troll_pop-up__i5p89",async function(v){
    tempMute=true;
    v.click();
    await sleep(0.2);
    tempMute=false;
});
document.arrive(".fake-pop-ups_pop-up__8PiOJ",async function(v){
    tempMute=true;
    v.click();
    await sleep(0.2);
    tempMute=false;
});
//S2 ARCHIVE
const archiveState = {r:'',d:'',h:'',v:null};
const onLoadingArchive = async function(){
    //deleted bc it got bugged
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
    if (XMLHttpRequest.modified) { return; };
    XMLHttpRequest.modified = true;
    const oldfetch = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(data){
        if (typeof(data)==="string" && data.indexOf('"hour":0')>-1) {
            const j = JSON.parse(data);
            j.day = j.day - 1;
            j.hour = 24;
            data = JSON.stringify(j);
        }
        return oldfetch.apply(this, arguments);
    }
});
//accept global missions
document.arrive(".global-mission-modal_accept__fjegf > button",async function(v){
    if (settings.acceptMissions) {
        await sleep(0.4);
        v.click();
    }
});
document.arrive(".announcement-bar_close__Y38aM",async function(v){
    await sleep(20);
    v.click();
});

//keyboard input
document.addEventListener("keydown",async function(event) {
    if (event.isComposing || document.activeElement?.selectionStart !== undefined || document.activeElement?.isContentEditable) {
        return;
    }
    let key = event.key.toLowerCase();
    if (key === "m") {
        const controls = document.querySelector(".live-stream-controls_mute__rHUC1");
        if ((!controls) || (controls.parentElement.contains(document.activeElement))) {
            return;
        }
        controls.click();
    } else if (key === "f") {
        if (document.fullscreen) {
            document.exitFullscreen()
        } else {
            document.querySelector("video")?.requestFullscreen();
        }
    } else if (key === "," || key == ".") {
        document.querySelector(".live-stream-player_close__c_GRv")?.click();
        await sleep(0.1);
        if (currentCam === "camera-13-4") {
            if (lastCam) {
                document.getElementById(lastCam)?.click();
            }
        } else {
            document.getElementById("camera-13-4")?.click();
        }
        document.activeElement?.blur();
    } else if (event.keyCode === 191) { // slash
        window.setTimeout(function(){ document.getElementById("chat-input").focus() },99);
    } else if (parseInt(key)<10 && parseInt(key)>-1) {
        if (key == "0") { key="12" };
        document.querySelector(".live-stream-player_close__c_GRv")?.click();
        await sleep(0.1)
        document.getElementById("camera-"+ key +"-4")?.click();
    }
});
