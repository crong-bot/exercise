const {username, room} =Qs.parse(location.search,{ignoreQueryPrefix:true})
function login(){
    if(room==undefined){
        console.log(room)
        return
    }else{       
        alert(room+ 'cannot enter now!')
    }
}

login()

node = document.getElementById('main-svg').getBBox()
console.log(node)