const path =require('path')
const express = require('express');
const http = require('http')
const socketio=require('socket.io')
const cards = require('./client/card')
const formatMessage =require('./client/Utils/messages');
const {userJoin,getCurrentUser, userLeave, getRoomUsers} =require('./client/Utils/users');
const users = require('./client/Utils/users');

//---------------------------------------------------------
//게임인스터스를 만든다. 게임인스턴스는 현재 룸의 유저를 받아서 저장
class game{
  constructor(){
     
    this.currentturn=0
    this._turn=0
    this.players=[]//onlysocket
    this.state= 'none'
    this.MAX_WAITING=40000
    this.ranking=[]
    this.playerspoint=[]
  }
  makegameinstance(clients){
    for(let e of clients){
      this.players.push(e)
    }
  }
  //실행해봐야됨 잘되나 7/8일 과제**
  givepoint(data){
    let a= Manager.games[data.room].playerspoint.filter(e=>{if(e.socketid==data.id)return e}).map(e=>e.name)
    
    let index=  Manager.games[data.room].playerspoint.findIndex(e=>e.socketid==data.id)
    Manager.games[data.room].ranking.push(a)
    console.log('acess a?'+ a)
    let b= Manager.games[data.room].ranking.findIndex(i=>i==data.name)
    let nowpoint=8-b
    console.log(nowpoint,b)//
    Manager.games[data.room].playerspoint[index].score += nowpoint
    io.in(data.room).emit('pointtoclient', {
      point:Manager.games[data.room].playerspoint[index].score,
      id:data.id, 
      name:data.name})
      console.log('this is givepoint data id '+ data.id +  data.name)
    //턴이 끝난 유저 피니쉬를 트루로 바꿔준다.
    Manager.games[data.room].playerspoint[index].finish=true 
    //턴에서 빠지게  Manager.games[data.room].players 에서 빼기
   /*  let c=Manager.games[data.room].players.findIndex(e=>e==data.id)
    Manager.games[data.room].players.splice(c,1) */ 
    //모든 유저가 피니쉬가 트루면 게임종료
    if(Manager.games[data.room].players.filter(e=>e.finish==false).length==1){
      io.in(data.room).emit('roundend','newgame')
      Manager.resetTimeOut(data) 
    }            
  }
  spliceturn(data){
    let c=Manager.games[data.room].players.findIndex(e=>e==data.id)
    Manager.games[data.room].players.splice(c,1)
  }
  //구현안함
  makeranking(data){
    Manager.games[data.room].playerspoint.sort((a,b)=>{
      return a.score<b.score?-1:a.score>b.score?1:0
    })
    console.log(Manager.games[data.room].playerspoint)
  }
  resetscore(data){
    Manager.games[data.room].playerspoint=[]
  }
}
//매니저인스턴스를 만들어서 매니저인스턴스의 games프로퍼티에다가 game인스턴스를 생성한다.
class manager{
  constructor(){
    this.games={}
    this.timeOut
  }
  ingameleft(){
    //게임중에 나갔을때 로직 games.에서 유저 지우기
  }
  next_turn(data){
    //매니저 배열의 게임인스턴스중에서 룸네임 키를 사용해서 g변수에 넣는다.
    //Manager.games[data]   
    Manager.games[data]._turn = Manager.games[data].currentturn++ % Manager.games[data].players.length;
    io.to(Manager.games[data].players[Manager.games[data]._turn]).emit('your_turn',`your-turn!---${Manager.games[data]._turn}`);
    this.triggerTimeout(data);
  }
  triggerTimeout(data){
    this.timeOut = setTimeout(()=>{
     this.next_turn(data);
   },60000);
  }
  //여기부분 수정해야함!
  resetTimeOut(data){
    if(typeof this.timeOut === 'object'){
      console.log("timeout reset");
      clearTimeout(this.timeOut);
    }
  }
  turnmodify(data){
    Manager.games[data.room].currentturn= Manager.games[data.room].ranking.findIndex(i=>i==data.name)
  }
}
//---------------------------------------------------------
Deck = new cards();
Manager =new manager()

const app = express();
const server = http.createServer(app);
const io=socketio(server);
//app.get('/', (req, res) => {
//    res.sendFile(path.join(__dirname + '/client'));
//  });
const mylogger = function(req,res,next){
  console.log('logger!')
  const data = {
    "number1": "2", 
    "number2": "4"
};
  res.json(data)
  next()
}

app.use(express.static(path.join(__dirname, 'client')));
app.use(mylogger)

const botname ='Chat Bot'
io.on('connection',socket=>{
    //User join Room Request
    socket.on('joinRoom',({username,room})=>{
      const user = userJoin(socket.id, username, room)
      //if(Manager.games[room].state=='none'&& getRoomUsers(room).length<=8){
        socket.join(user.room)
      //} 
      /* if(getCurrentUser(room).length>=8){
        Manager.games[room].state='full'
      } */
      //console.log('game state' + Manager.games[room].state) 
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
    })    
    //룸 이름 받으면 룸의 인원구하고 카드 나눠주기    
    socket.on('giveme',data=>{
      //var room = io.sockets.adapter.rooms[`${data}`];      
      //---룸에 있는 클라이언트 소켓아이디 리스트------------------------
      io.of('/').in(`${data}`).clients((error, clients) => {       
        if (error) throw error;
        //덱이 0이 아니라면 클리어한다.
        if(Deck.deck !==null){
          Deck.cleardeck();
        }
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
        console.log(Manager.games)
        Manager.next_turn(data);
      });                    
    })
    //pass버튼 받으면 플레이어 소켓아이디로 찾아서 다음턴으로 넘기기
    socket.on('pass',(data)=>{
     if(Manager.games[data.room].players[Manager.games[data.room]._turn]==data.id){
        Manager.resetTimeOut(data)//?
        Manager.next_turn(data.room)
      }
    })
    //throw버튼 받으면 올카드인포 보내고 카드보이게 브로드캐스트
    socket.on('throw',({num,count,room,card,id})=>{
      io.to(room).emit('allcardinfo',{Snum:num, Scount:count,Sroom:room,Sid:id})
      socket.to(room).emit('cardshowall', card)
      console.log(num,count,room)      
    })
    //실행해봐야됨 잘되나 7/8일 과제**
    socket.on('iwin',(data)=>{
      Manager.games[data.room].givepoint(data)
      Manager.resetTimeOut(data)//?
      Manager.turnmodify(data)
      Manager.games[data.room].spliceturn(data)
      console.log("current_turn"+Manager.games[data.room].currentturn)
      Manager.next_turn(data.room)
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
      }               
    })             
})
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));