const channel = new BroadcastChannel("chatSphere");

const loginBox = document.getElementById("login");
const app = document.getElementById("app");
const chatList = document.getElementById("chatList");
const chatTitle = document.getElementById("chatTitle");
const messages = document.getElementById("messages");

let currentUser = null;
let currentChat = "Group Chat";

const defaultUsers = ["Navya","Mohitha","Ananya","Group Chat"];

let users = JSON.parse(localStorage.getItem("users")) || [...defaultUsers];
let chats = JSON.parse(localStorage.getItem("chats")) || {};

defaultUsers.forEach(u => chats[u] ||= []);

function save(){
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("chats", JSON.stringify(chats));
}

document.getElementById("loginBtn").onclick = () => {
  const name = document.getElementById("username").value.trim();
  if(!name) return;

  currentUser = name;

  if(!users.includes(name)){
    users.push(name);
    chats[name] = [];
    save();
    channel.postMessage({type:"new-user",name});
  }

  loginBox.style.display="none";
  app.style.display="flex";

  renderChats();
  openChat("Group Chat");
};

function renderChats(){
  chatList.innerHTML="";
  users.forEach(u=>{
    const d = document.createElement("div");
    d.className="chat-item";
    d.innerText=u;
    d.onclick=()=>openChat(u);
    chatList.appendChild(d);
  });
}

function openChat(name){
  currentChat=name;
  chatTitle.innerText=name;
  renderMessages();
}

document.getElementById("sendBtn").onclick = () => {
  const input = document.getElementById("msg");
  if(!input.value) return;

  const msg = {
    user:currentUser,
    text:input.value,
    time:new Date().toLocaleTimeString().slice(0,5)
  };

  chats[currentChat].push(msg);
  save();
  channel.postMessage({type:"msg",chat:currentChat,msg});
  input.value="";
  renderMessages();
};

channel.onmessage = e => {
  if(e.data.type==="new-user"){
    if(!users.includes(e.data.name)){
      users.push(e.data.name);
      chats[e.data.name]=[];
      save();
      renderChats();
    }
  }
  if(e.data.type==="msg"){
    chats[e.data.chat].push(e.data.msg);
    save();
    renderMessages();
  }
};

function renderMessages(){
  messages.innerHTML="";
  chats[currentChat].forEach(m=>{
    const d=document.createElement("div");
    let cls="msg ";
    if(m.user===currentUser) cls+="me";
    else if(currentChat==="Group Chat")
      cls+=m.user.charCodeAt(0)%2?"g1":"g2";
    else cls+="other";

    d.className=cls;
    d.innerHTML=`
      ${currentChat==="Group Chat" && m.user!==currentUser ? "<b>"+m.user+"</b><br>":""}
      ${m.text}
      <div class="time">${m.time}</div>
    `;
    messages.appendChild(d);
  });
  messages.scrollTop=messages.scrollHeight;
}


