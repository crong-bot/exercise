module.exports =class deck{
	constructor(){
  	this.deck =[]
    this.dealcard= new Map()
  }
  
  generate(){
  	let card= (suit,value)=>{
     this.name =suit+value
     this.suit =suit
     this.value=value
   		return{name:this.name, suit:this.suit, value:this.value}
   		}
  	let values = ['1','2','3','4','5','6','7','8','9','10','11','12']
    let suits =['one', 'two', 'three','four','five', 'six','seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
    	
  	for(let i=0; i<values.length; i++){
    		for(let j=0; j<i+1 ; j++){
        		this.deck.push(card(suits[i],values[i]))
       	 }
   	 }
     this.deck.push(card("13","joker"))
     this.deck.push(card("13","joker"))
	} 
  
  printdeck(){
  	if(this.deck.length == 0){
  		console.log("has been generated!!")
  	}else{
    		for(let c=0; c<this.deck.length; c++){
        	console.log(this.deck[c])
        }	
    	}
  }
  
  shuffle(){
  	
   
    for( let c = this.deck.length -1; c >= 0; c--){
            let tempval = this.deck[c];
            let randomindex = Math.floor(Math.random() * this.deck.length);
            while(randomindex == c){ randomindex = Math.floor(Math.random() * this.deck.length)}

            this.deck[c] = this.deck[randomindex];
            this.deck[randomindex] = tempval;
        }
  }
  
  deal_card(players){
  	
    
    switch(players){
    	
      case 1: return 1; 
      case 2: return 2;
      case 3: return 3;
      case 4: 
      			for(let i=0;i< players;i++){
            	this.dealcard.set(i,this.deck.slice(0,16))
              this.deck.splice(0,16)
              
            }
           return this.dealcard;
      case 5: return;
      case 6: return;
      case 7: return;
      case 8: return;
            
    }
   		 
  }
  
  cleardeck(){
   this.deck =[]
  }
  
  printhand(){
  		for(let c=0; c<this.dealcard.size; c++){
        	console.log(this.dealcard[c])
 				 }
  
	}	
}




