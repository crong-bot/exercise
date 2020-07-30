
const chatform = document.getElementById('chat-form')
const chatMessages=document.querySelector('.chat-messages')
const chatmain=document.querySelector('.chat-main')
const roomname=document.getElementById('room-name')
const userslist=document.getElementById('users')

const localturnmark=document.querySelector('.local-mark')
const localimg=document.querySelector('.localimg')
const localname=document.querySelector('#localname')
const localscore=document.querySelector('.localscore')

const giveme=document.querySelector('.giveme-card')
const gamestart=document.querySelector('.game-start')

const aa=document.getElementById('player-hand-card')

const passbtn=document.querySelector('#pass-btn')
// throw버튼 클릭시에 카드제출하고 검사하는 함수 구현
const test=document.querySelector('.throw-btn')
const target = document.getElementById('panel-notice-text');//게임텍스트패널
const target2 = document.getElementById('panel-notice-text2')
const navranking =document.getElementById('rank-content')//nav랭킹

const {username, room} =Qs.parse(location.search,{
    ignoreQueryPrefix:true
})
//모든 카드정보 전역변수로 관리
let infonum=0
let infocount= 0
let infoid=0

gamestart.hidden=true
giveme.hidden=true
function togglechat(id) {
  const vv = document.getElementById(id);
  if (vv.style.visibility == "visible") {
    vv.style.visibility = 'hidden';
  } else {
    vv.style.visibility = 'visible';
  }
}
//---------------------------------------------------------------
const slot1=document.querySelector('.slot-1')
const slot2=document.querySelector('.slot-2')
const slot3=document.querySelector('.slot-3')
const slot4=document.querySelector('.slot-4')
const slot5=document.querySelector('.slot-5')
const slot6=document.querySelector('.slot-6')
const slot7=document.querySelector('.slot-7')
//----------------------------------------------------------------
const socket = io()
socket.emit('joinRoom',{username,room})
//룸에 있는 게임플레이어 배열만들기--------------------------------------
class Player{
  constructor(name,socketid){
    this.name=name
    this.socketid=socketid
    this.slotnum
    this.hand=[]
    this.score=0
    this.turn=false
    this.finish=false
  }
}
class Players{
  constructor(){
    this.players=[]
    this.gamestate='ready'
  }
  changestate(state){
    this.gamestate= state
  }
  newplayer(name, socketid){
    let p = new Player(name,socketid)
    this.players.push(p)
    return p
  }
  //디스커넥한 유저 소켓접수 인덱스찾고 소켓아이디로 돔 찾아서 지우고 리스트에서지우고
  removeplayers(data){
    let playerinx=league.players.findIndex(e=>{e.socketid==data.id})    
    const c=document.getElementById(`${data.id}`)
    c.parentNode.removeChild(c)
    league.players.splice(playerinx, 1);
  }
  playerpos(){               
    //슬롯의 위치를 바꿔주면서 map으로 로컬을 제외한 플레이어를 만들고 그자리에 스폰
    const myind=league.players.findIndex(e=>e.name==username)
    function poslogic(enemydiv,data){
      enemydiv.innerHTML=`<span class="turn-mark"><img id="mark${data.socketid}" style="visibility:hidden" src="/source/turnmark.png"></span>
          <img class="bird-img" id="img${data.socketid}" src="/source/1.svg">
          <span class="enemy-name">ID:${data.name}</span>
          <span class="enemy-score" id="score${data.socketid}">${data.score}</span>
          <span class="score-title">Score</span>`
      return enemydiv.innerHTML;     
    }
    const newmap=league.players.filter(e=>{ 
      if(e.name!== username)return e
       })
    switch(league.players.length){
      case 4:
        const s =[slot2,slot4,slot6]       
        for(let i=0;i<myind;i++){
          let a =s.pop()
          s.unshift(a)                    
        }
        for(let j=0;j<s.length;j++){
          const enemydiv= document.createElement('div')
          enemydiv.classList.add('enemy')
          enemydiv.id=newmap[j].socketid
          s[j].appendChild(enemydiv) 
          poslogic(enemydiv,newmap[j])                 
        }
        break;        
      case 5:
        const s5 =[slot1,slot3,slot5,slot7]       
        for(let i=0;i<myind;i++){
          let a =s5.pop()
          s5.unshift(a)                    
        }
        for(let j=0;j<s5.length;j++){
          const enemydiv= document.createElement('div')
          enemydiv.classList.add('enemy')
          enemydiv.id=newmap[j].socketid
          s5[j].appendChild(enemydiv) 
          poslogic(enemydiv,newmap[j])                   
        }
        break;         
      case 6:
        const s6 =[slot1,slot3,slot4,slot5,slot7]       
        for(let i=0;i<myind;i++){
          let a =s6.pop()
          s6.unshift(a)                    
        }
        for(let j=0;j<s6.length;j++){
          const enemydiv= document.createElement('div')
          enemydiv.classList.add('enemy')
          enemydiv.id=newmap[j].socketid
          s6[j].appendChild(enemydiv) 
          poslogic(enemydiv,newmap[j])                
        }
        break;         
      case 7:
        const s7 =[slot1,slot2,slot3,slot4,slot5,slot7]       
        for(let i=0;i<myind;i++){
          let a =s7.pop()
          s7.unshift(a)                    
        }
        for(let j=0;j<s7.length;j++){
          const enemydiv= document.createElement('div')
          enemydiv.classList.add('enemy')
          enemydiv.id=newmap[j].socketid
          s7[j].appendChild(enemydiv) 
          poslogic(enemydiv,newmap[j])                   
        }
        break;         
      case 8:
        const s8 =[slot1,slot2,slot3,slot4,slot5,slot6,slot7]       
        for(let i=0;i<myind;i++){
          let a =s8.pop()
          s8.unshift(a)                    
        }
        for(let j=0;j<s8.length;j++){
          const enemydiv= document.createElement('div')
          enemydiv.classList.add('enemy')
          enemydiv.id=newmap[j].socketid
          s8[j].appendChild(enemydiv) 
          poslogic(enemydiv,newmap[j])                
        }
        break;          
    }        
  }
  newpos(){
    let emptyind =slots.findIndex(e=>{return e.hasChildNodes()==false})
    slots[emptyind].appendChild(enemydiv)
  } 
}
//----------------------------------------------------------------------
const league=  new Players()
let localsocket =1 
///////////////////////////////////////////////////////////////////////
socket.on('connect',()=>{
  localsocket=socket.id
})
// 룸에 있는 플레이어 인스턴스 생성
socket.on('exitstmemeber',({users})=>{ 
  for(let i=0;i<users.length;i++){
    if(users[i].username!==username){
      league.newplayer(users[i].username, users[i].id)      
    }
    else{
     /*  const localimg=document.querySelector('.localname')
      const localname=document.querySelector('#localname')
      const localscore=document.querySelector('#localscore') */
      localturnmark.id="mark"+localsocket
      localimg.id="img"+localsocket
      localscore.id="score"+localsocket
      localname.innerText=`ID: ${users[i].username}`
      localscore.innerText=`0`
    }   
  }  
})
//users가 id,username, roomname 배열임 여기 왔음.
socket.on('userListroomName',({users,room, id, name})=>{
  outputRoomName(room)
  outputUsers(users)
  if(name!==undefined){
    league.newplayer(name,id)            
    }                 
})
//플레이어 나갔을 때 플레이어리스트에서 지우기
socket.on('removeplayer', data =>{
  league.removeplayers(data)
})
//호스트 메시지 받았을때
socket.on('host',()=>{
  gamestart.hidden=false
  giveme.hidden=false
  //호스트 dom 띄우기=>
}) 
//message from server      
socket.on('message', message=>{
     outputMessage(message);     
     //scroll down
     chatmain.scrollTop =chatmain.scrollHeight
})
chatform.addEventListener('submit',e=>{
    e.preventDefault();
    const msg =e.target.elements.msg.value;
    socket.emit('chat-message',msg)
    //clear input
    e.target.elements.msg.value=''
    e.target.elements.msg.focus()
})
socket.on('makerank',data=>{
    outranking(data)
})
function outputMessage(message){
    //let chatimg=document.getElementById("img"+message.id)
    if(message.id==undefined){
      const div = document.createElement('div')
      div.classList.add('message')
      div.innerHTML=
      `<img class='chat-img' src="/source/chatbotimg.svg"></img>
      <p class='meta'> ${message.username} <span>${message.time}</span></p>
      <p class='text'>
        ${message.text}
      </p>`
      document.querySelector('.chat-messages').appendChild(div)
    }else if(message.id==localsocket){
      let chatimg=document.getElementById("img"+message.id)
      const div = document.createElement('div')
      div.classList.add('local-message')
      div.innerHTML=
      `<img class='chat-img' src="${chatimg.src}"></img>
      <p class='meta'> ${message.username} <span>${message.time}</span></p>
      <p class='text'>
        ${message.text}
      </p>`
      document.querySelector('.chat-messages').appendChild(div)
    }else{
      //let chatimg=document.getElementById("img"+message.id)
      const div = document.createElement('div')
      div.classList.add('message')
      div.innerHTML=
      `<img class='chat-img' src="/source/1.svg"></img>
      <p class='meta'> ${message.username} <span>${message.time}</span></p>
      <p class='text'>
        ${message.text}
      </p>`
      document.querySelector('.chat-messages').appendChild(div)
    }     
}
// ADD ROOM NAME TO DOM
function outputRoomName(room){
    roomname.innerText=room
}
//ADD USER NAME TO DOM
function outputUsers(users){
userslist.innerHTML=`${users.map(user=>`<li>${user.username}</li>`).join(``)}`
}
function outranking(users){
  navranking.innerHTML=`${users.map(user=>`<li>${user.name} score:${user.score}</li>`).join(``)}`
}
// 
gamestart.addEventListener('click',(e)=>{
  e.preventDefault()
  e.stopPropagation()
  socket.emit('startgame',{data:league.players,room:room})
  offdom(gamestart)
})
//스타트게임 메시지 서버한테 받고 게임state바꾸기('ingame'), 플레이어스폰하기
socket.on('sgame',(data)=>{  
  if(league.gamestate==='ready'){league.playerpos()}
  league.changestate(data)
  changedomtext(target,'game start')
})
//card 버튼 누르면 카드를 받고 타이머시작
giveme.addEventListener('click',(e)=>{
  e.preventDefault()
  e.stopPropagation()
  socket.emit('giveme',room)
  offdom(giveme)
})
//카드덱을 받아서 VALUE값 추출해서 DOM에 집어넣기
socket.on('carddeck',(data)=>{  
    showcard(data)
})
//받은 카드 배열로 카드 DOM 생성하는 함수//드래그 리스너달기
function showcard(dd){
  const cardnumber= dd.map(e=>e.value)  
  const ab=document.querySelector('.player-hand')
  for(let i=0;i<cardnumber.length;i++){        
    const aa = document.createElement('div')
    aa.classList.add('card')
    aa.setAttribute('draggable','true')
    aa.innerText = `${cardnumber[i]}`
    ab.appendChild(aa)
    aa.addEventListener('dragstart',()=>{
      setTimeout(()=>{aa.classList.add('dragging'),0})
      //setTimeout(()=>{aa.className='invisible'},0)
    })
    aa.addEventListener('dragend',()=>{
      aa.classList.remove('dragging')
    })    
  }
  sortable()
} 
//카드가 놓이는 패널들의 자식들을 가져와서 반복으로 이벤트 리스너 달아준다.
//커서위치의 엘리먼트의 정보를 가져오고,현재드래그중인 엘리먼트를 가져와서
// 어펜드해준다.
function sortable(){
  const allthrow =document.querySelectorAll('.player-hand','.throw-panel')
  allthrow.forEach(throws=>{
    throws.addEventListener('dragover',e=>{
      e.preventDefault()
      const afterElement= getDragAfterElement(throws,e.clientX)
      const dragg= document.querySelector('.dragging')
      if(afterElement==null){
        throws.appendChild(dragg)
      }else{
        throws.insertBefore(dragg,afterElement)
      }
    })
  })
}
//마우스 커서의 엘리먼트 위치 정보 구하는 함수
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')]

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.left - box.width / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}
// 턴을 받았을때 실행하는 함수
socket.on('your_turn',data=>{
  let ind= league.players.findIndex(i=>i.socketid==localsocket)
  //if(league.players[ind].turn==false)return
  league.players[ind].turn=true
  test.disabled=false
  //let a=document.getElementById(`mark${localsocket}`)
  //a.style.visibility='visible'
  changedomtext(target,'your turn!')   
  processbar=document.querySelector(".progress-bar-inner")
  let pt=100  
  let b=setInterval(() => {
    processbar.style.width=pt+'%'
    pt=pt-0.84
    if(pt==0||league.players[ind].turn==false){
      clearInterval(b)
      processbar.style.width='0%'
      league.players[ind].turn=false}       
    }, 500);   
})
socket.on('showturnmark',data=>{
  let a=document.getElementById(`mark${data}`)
  a.style.visibility='visible'
})
socket.on('hiddenturnmark', data=>{
  let a=document.getElementById(`mark${data}`)
  let hind=league.players.findIndex(e=>e.socketid==data)
  console.log("388.ind"+hind)
  league.players[hind].turn=false
  a.style.visibility='hidden'
})
//모든유저한테 allcardslot에 카드보이게 하기
socket.on('cardshowall',({Scard,Sname})=>{
  const allcardslot=document.querySelector('.game-panel-allcard')
  allcardslot.innerHTML=""
  for(let i=0;i<Scard.length;i++){        
    const aa = document.createElement('div')
    aa.classList.add('card')
    aa.setAttribute('draggable','false')
    aa.innerText = `${Scard[i]}`
    allcardslot.appendChild(aa)
  } 
  target2.innerText=`${Sname}'s card`
})
socket.on('pointtoclient',(data)=>{
  //데이타 소켓을 찾아서 거기다 포인트를 넣기
  changedomtext(target,`${data.name} get ${data.point}point`)
  let a=document.querySelector("#score"+data.id)
  a.textContent=data.point
  let avatar=document.querySelector("#img"+data.id)
  let ind= league.players.findIndex(i=>i.socketid==data.id)
  league.players[ind].score += data.point 
  let nowscore=league.players[ind].score 
  
  if(nowscore>44){
    avatar.src="/source/8.svg"
  }else if(nowscore>38){
    avatar.src="/source/7.svg"
  }else if(nowscore>32){
    avatar.src="/source/6.svg"
  }else if(nowscore>26){
    avatar.src="/source/5.svg"
  }else if(nowscore>20){
    avatar.src="/source/4.svg"
  }else if(nowscore>14){
    avatar.src="/source/3.svg"
  }else if(nowscore>8){
    avatar.src="/source/2.svg"
  }
  
})
//패스버튼**패스누를시에 로컬의 초가 초기화지않음
passbtn.addEventListener('click',(e)=>{
  e.preventDefault()
  e.stopPropagation()
  let ind= league.players.findIndex(i=>i.socketid==localsocket) 
  if(league.players[ind].turn==true){    
    socket.emit('pass', {room:room, id:localsocket})
    league.players[ind].turn=false
    //let a=document.querySelector("#mark"+localsocket)
    //a.style.visibility='hidden'
  }else{
    changedomtext(target,'Not your turn')
  }
})
socket.on('allcardinfo',({Snum,Scount,Sroom,Sid})=>{
  infonum =Snum
  infocount=Scount
  infoid=Sid
  console.log(Snum,Scount,Sroom,Sid)      
  })
//-----------------------------------------------------------
let mycard=[]
let mycard2=[]//조커 숫자로 변환한 행렬 서버로 보내기 위해
//--------------------------------------------------
//throw버튼에 클릭이벤트=//throw되고 나면 throw 버튼 막기
test.addEventListener('click',(e)=>{
  e.preventDefault()
  e.stopPropagation()
  if(getdom('#throw-panel').hasChildNodes()==false)return 

  let ind= league.players.findIndex(i=>i.socketid==localsocket)  
  const nowthrow=document.querySelectorAll('#throw-panel>div')
  const nowallcard=document.querySelectorAll('.game-panel-allcard')
  //const allcardslot=document.querySelector('.all-card')
   mycard=[]
   mycard2=[]
  if(league.players[ind].turn==true){
    for(let i of nowthrow){
      mycard.push(i.textContent)
    }   
    checkplayercard();    
  }else{
    changedomtext(target,'Not your turn...')
  } 
}) 
//조커를 변환하고 카드확인하는 함수
function check(){  
  if(mycard.some(e=>!isNaN(e))==false){
    mycard.forEach((e,i)=>{
      mycard2[i]='13'      
    })
    console.log('all joker')
  }else{
    mycard2=mycard.filter(e=>{if( e!=='joker')return e})
    if(mycard2.every(e=>mycard2[0]==e)==true){
      for(let j=0;j<mycard.length-mycard2.length;j++){
        mycard2.push(mycard2[0])
      }
      console.log('change joker')      
    }else{
      return false
    }           
  }
}
function checkplayercard(){
  const nowthrow=document.querySelectorAll('#throw-panel>div')
  const allcardslot=document.querySelector('.game-panel-allcard')
  if(infoid==localsocket){infonum=0,infocount=0};
  if(infonum==0&&infocount==0){
    if(check()==false)return;
    for(let a of nowthrow){
      allcardslot.appendChild(a)
    }
    socket.emit('throw',{num:mycard2[0],count:mycard.length,room:room,card:mycard,id:localsocket, name:username})
    wincheck()
    test.disabled=true 
    changedomtext(target,'success!')
    return
  }else if(mycard.length!==infocount){
    changedomtext(target,'Check how many cards you threw')
    return
  }
  if(check()==false)return;
  if(Number(mycard2[0])>infonum){
    changedomtext(target,`Check your card number. your number is: ${mycard2[0]}, count: ${infonum}`)
    return
  }
  for(let a of nowthrow){
    allcardslot.appendChild(a)
  }
  if(check()==false)return;
  socket.emit('throw',{num:mycard2[0],count:mycard.length,room:room,card:mycard,id:localsocket, name:username})
  wincheck()
  test.disabled=true  
  changedomtext(target,'success!')
}
function changedomtext(dom,content){
  dom.textContent=content 
}
function getdom(dom){
  return document.querySelector(dom)
}
function getalldom(dom){
  return document.querySelectorAll(dom)
}
function changedomimg(dom){
  return document.querySelector(dom)
}
function offdom(domname){
  domname.disabled=true
}
function ondom(domname){
  domname.disabled=false
}

function wincheck(){
  if(getdom('#real-hand').hasChildNodes()==true||getdom('#throw-panel').hasChildNodes()==true) return; 
  socket.emit('iwin',{name:username, room:room,id:localsocket})
  let playerinx=league.players.findIndex(e=>e.socketid==localsocket)
  league.players[playerinx].finish=true
  league.players[playerinx].turn=false
  //pass버튼 비활성화
}
socket.on('roundend',e=>{
  for(let i=0;i<league.players.length;i++){
    league.players[i].turn=false
  }
  //ondom(gamestart)
  ondom(giveme)
  league.changestate(e)
  const allcardslot=document.querySelector('.game-panel-allcard')
  allcardslot.innerHTML=''
  const realhand =document.getElementById('real-hand')
  realhand.innerHTML=''
  const throwpanel =document.getElementById('throw-panel')
  throwpanel.innerHTML=''
  changedomtext(target,e)
})
const callback=function textanimation(){
  target.classList.toggle('ta')//text-animation
  setTimeout(() => {
    target.classList.toggle('ta')
  }, 1000)};
var observer = new MutationObserver(callback)
var config = {
  //attributes: true,
  childList: true,
  characterData: true,
  //subtree: true || null,
  //attributeOldValue: true || null,
  //characterDataOldValue: true || null,
}; // 감시할 내용 설정
observer.observe(target, config); // 감시할 대상 등록