const countryList=document.getElementById("country-list")
const channelGrid=document.getElementById("channel-grid")
const playerSection=document.getElementById("player-section")
const video=document.getElementById("tv-player")
const search=document.getElementById("search")

let hls
let data={}

async function init(){

const res=await fetch("data/channels.json")
data=await res.json()

renderCountries()

displayChannels(Object.keys(data)[0])

}

function renderCountries(){

countryList.innerHTML=""

Object.keys(data).forEach(country=>{

const li=document.createElement("li")

li.className="country-item"

li.innerText=country

li.onclick=()=>displayChannels(country)

countryList.appendChild(li)

})

}

function displayChannels(country){

channelGrid.innerHTML=""

data[country].forEach(chan=>{

const card=document.createElement("div")

card.className="channel-card"

card.innerHTML=`

<img src="${chan.logo}" class="channel-logo">

<h3>${chan.name}</h3>

<button class="btn-play">Assistir</button>

`

card.querySelector("button").onclick=()=>playStream(chan.url)

channelGrid.appendChild(card)

})

}

function playStream(url){

playerSection.style.display="block"

window.scrollTo({top:0,behavior:"smooth"})

if(Hls.isSupported()){

if(hls)hls.destroy()

hls=new Hls()

hls.loadSource(url)

hls.attachMedia(video)

video.play()

}else{

video.src=url

video.play()

}

}

function closePlayer(){

playerSection.style.display="none"

video.pause()

}

init()
