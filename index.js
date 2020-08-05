const path =require('path')
const express = require('express');
const http = require('http')
const socketio=require('socket.io')
const cards = require('./client/card')
const formatMessage =require('./client/utils/messages');
const {userJoin,getCurrentUser, userLeave, getRoomUsers} =require('./client/utils/users');
const users = require('./client/utils/users');

//---------------------------------------------------------
//게임인스터스를 만든다. 게임인스턴스는 현재 룸의 유저를 받아서 저장
class game{
  constructor(){     
    this.currentturn=0
    this._turn=0
    this.players=[]//onlysocket need initial
    this.state= 'none'
    this.MAX_WAITING=60000
    this.ranking=[]//점수 주기위한 피니쉬 순서 배열 need initial
    this.playerspoint=[]
    this.timeOut
    this.MAX_POINT=10
    this.nowpoint=0
  }
  makegameinstance(clients){
    for(let e of clients){
      this.players.push(e)
    }
  }
  //실행해봐야됨 잘되나 7/8일 과제**
  givepoint(socket, data){
    let a= Manager.games[data.room].playerspoint.filter(e=>{if(e.socketid==data.id)return e}).map(e=>e.name)
    
    let index=  Manager.games[data.room].playerspoint.findIndex(e=>e.socketid==data.id)
    Manager.games[data.room].ranking.push(a)
    let b= Manager.games[data.room].ranking.findIndex(i=>i==data.name)
    this.nowpoint=this.MAX_POINT-b
    Manager.games[data.room].playerspoint[index].score += this.nowpoint
    io.in(data.room).emit('pointtoclient', {
      point:Manager.games[data.room].playerspoint[index].score,
      id:data.id, 
      name:data.name})
    //턴이 끝난 유저 피니쉬를 트루로 바꿔준다.
    Manager.games[data.room].playerspoint[index].finish=true 
    //턴에서 빠지게  Manager.games[data.room].players 에서 빼기
   /*  let c=Manager.games[data.room].players.findIndex(e=>e==data.id)
    Manager.games[data.room].players.splice(c,1) */          
  }
  finishgame(socket,data){
    if(Manager.games[data.room].players.length!==1){
      return 
    }else{     
      io.in(data.room).emit('pointtoclient', {
        point:this.nowpoint-2,
        id:this.players[0], 
        name:'loser'})  
      this.currentturn=this.playerspoint.findIndex(e=>e.name==this.ranking[0])
      let nowdalmuti=this.playerspoint[this.currentturn].socketid
      io.in(data.room).emit('roundend',{e:'newgame',d:nowdalmuti, p:this.players[0]})     
      Manager.games[data.room].state='end'
      clearTimeout(this.timeOut) //*    
      
      io.to(data.room).emit('hiddenturnmark',this.players[0])
      this.players=[]
      Manager.games[data.room].ranking=[]
      Manager.games[data.room].MAX_POINT=10
      io.in(data.room).emit('message',formatMessage(botname,'Game finish!'));  
    }   
  }
  spliceturn(data){
    let c=Manager.games[data.room].players.findIndex(e=>e==data.id)
    Manager.games[data.room].players.splice(c,1)
    Manager.games[data.room].currentturn=c
    console.log('this splice' + c)
  }
  //구현안함
  makeranking(){   
   let temp=this.playerspoint.slice().sort((a,b)=>{
      return a.score<b.score?1:a.score>b.score?-1:0
    })
    return temp
  }
  resetscore(data){
    Manager.games[data.room].playerspoint=[]
  }
}
//매니저인스턴스를 만들어서 매니저인스턴스의 games프로퍼티에다가 game인스턴스를 생성한다.
class manager{
  constructor(){
    this.games={}
  }
  ingameleft(){
    //게임중에 나갔을때 로직 games.에서 유저 지우기
  }
  next_turn(data){
    //매니저 배열의 게임인스턴스중에서 룸네임 키를 사용해서 g변수에 넣는다.
    //Manager.games[data]
    //if(roomcount[data]['state']!=='ingame')return   
    Manager.games[data]._turn = Manager.games[data].currentturn++ % Manager.games[data].players.length;
    io.to(Manager.games[data].players[Manager.games[data]._turn]).emit('your_turn',`your-turn!---${Manager.games[data]._turn}`);
    io.to(data).emit('showturnmark', Manager.games[data].players[Manager.games[data]._turn])
    //io.to(data).emit('hiddenturnmark', Manager.games[data].players[Manager.games[data].currentturn% Manager.games[data].players.length])
    if(Manager.games[data].state==='ingame'){
      this.triggerTimeout(data);
    }   
  }
  triggerTimeout(data){
    Manager.games[data].timeOut = setTimeout(()=>{
      if(Manager.games[data]==undefined)return
      io.to(data).emit('hiddenturnmark', Manager.games[data].players[Manager.games[data]._turn])
      this.next_turn(data);
   },60000);
  }
  //여기부분 수정해야함!
  resetTimeOut(data){
    if(typeof Manager.games[data.room].timeOut === 'object'){
      clearTimeout(Manager.games[data.room].timeOut);
    }
  }
  turnmodify(data){
    Manager.games[data.room].currentturn= Manager.games[data.room].ranking.findIndex(i=>i==data.name)
  }
}
//---------------------------------------------------------
Deck = new cards();
Manager =new manager()
const roomcount={'JavaScript':{"count":0,"state":'ready'}}

const app = express();
const server = http.createServer(app);
const io=socketio(server);

app.get('/chat.html',(req,res,next)=>{
  let a=req.query.room
   
  if(roomcount[a]['count']>=8||roomcount[a]['state']=='ingame'){
    res.sendFile('client/index.html' , { root : __dirname})
  }
  else{
    console.log(roomcount[a])
    next()
  }
})
app.use(express.static(path.join(__dirname, 'client')));

const botname ='Chat Bot'
io.on('connection',socket=>{
    //User join Room Request
    socket.on('joinRoom',({username,room})=>{
      const user = userJoin(socket.id, username, room)
      //if(Manager.games[room].state=='none'&& getRoomUsers(room).length<=8){
        socket.join(user.room)
        roomcount[room]['count']=getRoomUsers(room).length 
      //welcome current user
      socket.emit('message',formatMessage(botname,'welcome!'));
      //만약 유저수가 1이라면 호스트로 임명
      if(getRoomUsers(room).length===1){        
        socket.emit('message',formatMessage(botname,'you are host!'));
        socket.emit('host')
      }
      //Broadcast when a user connects
      socket.broadcast
      .to(user.room)
      .emit('message',formatMessage(botname,`${user.username} has joined the chat`))
      
      socket.emit('exitstmemeber',{users:getRoomUsers(user.room)})
      
      //6.14 send userlist and room
      io.to(user.room).emit('userListroomName',({
        users:getRoomUsers(user.room), room:user.room, id:user.id, name:user.username}))
    })   
    //Listen for chat-message
    socket.on('chat-message',msg=>{
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit('message',formatMessage(user.username,msg,user.id))
    })
    //게임스타트버튼 클라이언트가 누르면 받고 다시 스타트게임 메시지 보내면서 인게임 스테이트로
    socket.on('startgame',({data,room})=>{      
      //data는 league.players 
      Manager.games[room] =new game()
      Manager.games[room].state='ingame' 
      //playerspoint에 점수를 계산하기 위해 플레이어의 정보들을 가져온다.
      Manager.games[room].playerspoint.push(...data)
      const user = getCurrentUser(socket.id)//?
      io.to(room).emit('sgame','ingame')
      roomcount[room]['state']='ingame'
      io.in(room).emit('message',formatMessage(botname,'Game Start!'));  
    })    
    //룸 이름 받으면 룸의 인원구하고 카드 나눠주기    
    socket.on('giveme',data=>{
      //var room = io.sockets.adapter.rooms[`${data}`];      
      //---룸에 있는 클라이언트 소켓아이디 리스트------------------------
      //console.log('before makerank'+Manager.games[data])
      //io.to(data).emit('makerank', Manager.games[data].makeranking())
      io.of('/').in(`${data}`).clients((error, clients) => {       
        if (error) throw error;
        //덱이 0이 아니라면 클리어한다.
        Deck.cleardeck();
        //덱 생성
        Deck.generate();
        Deck.shuffle();
        //방의 클라이언트 인원수로 카드 분배해서 변수에 넣기
        let divcard= (Deck.deal_card(clients.length))
        // 방인원수가 1,2,3명이라면 경고표시
        if(divcard < 4){
          console.log('nob!')
        } else{
          console.log(clients.length)
         for(let i=0;i<clients.length;i++){
          io.to(clients[i]).emit('carddeck', divcard.get(i));
         } 
        } 
        //매니저 클래스의 게임스배열에 새로운 게임인스터스를 프로퍼티 data(룸네임)으로 집어 넣어서 관리 
        //Manager.games[data] =new game()        
        //새로운 게임인스턴의 메소드를 사용해 소켓들을 배열에 집어넣음
        Manager.games[data].makegameinstance(clients)
        Manager.next_turn(data);
      });                    
    })
    function passturn(data){
        Manager.resetTimeOut(data)//?
        Manager.next_turn(data.room)
        io.to(data.room).emit('hiddenturnmark', data.id)
    }
    //pass버튼 받으면 플레이어 소켓아이디로 찾아서 다음턴으로 넘기기
    socket.on('pass',(data)=>{
        passturn(data)
    })
    //throw버튼 받으면 올카드인포 보내고 카드보이게 브로드캐스트
    socket.on('throw',({num,count,room,card,id,name})=>{
      io.to(room).emit('allcardinfo',{Snum:num, Scount:count,Sroom:room,Sid:id})
      socket.to(room).emit('cardshowall', {Scard:card,Sname:name})
      console.log(num,count,room)      
    })
    //실행해봐야됨 잘되나 7/8일 과제**
    socket.on('iwin',(data)=>{
      Manager.games[data.room].givepoint(socket,data)
      Manager.games[data.room].spliceturn(data)
      passturn(data)
      if(Manager.games[data.room].players.length==1){
        io.to(data.room).emit('makerank', Manager.games[data.room].makeranking())
        Manager.games[data.room].finishgame(socket,data)
      }
      io.in(data.room).emit('allcardinfo',{Snum:0, Scount:0,Sroom:data.room,Sid:0})      
    })          
    //user disconnects
    socket.on('disconnect',()=>{ 
      const user= userLeave(socket.id)
      if(user){
        io.to(user.room).emit('message',formatMessage(botname,`${user.username} has left the chat`))         
          //6.14 send userlist and room
        io.to(user.room).emit('userListroomName',({
          users:getRoomUsers(user.room), room:user.room
        }))
        io.to(user.room).emit('removeplayer', user)
        if(getRoomUsers(user.room).length==0||Manager.games[user.room]===undefined){
          //clearTimeout(Manager.games[user.room].timeOut)
          //Manager.games[user.room].state='ready'
          delete Manager.games[user.room]
          roomcount[user.room]['state']='ready'
          roomcount[user.room]['count']=0
          console.log(Manager.games)
        }     
      }                    
    })             
})
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));