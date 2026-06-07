

window.onerror = function(msg,src,line,col,err){
  var e=document.getElementById('em');
  if(e){e.style.display='block';e.style.color='#ff6b6b';e.textContent='JS Error ('+line+'): '+msg;}
  console.error('onerror:',msg,line,err);
  return false;
};
window.addEventListener('unhandledrejection',function(ev){
  var e=document.getElementById('em');
  var msg=ev.reason?ev.reason.toString():'Promise rejected';
  if(e){e.style.display='block';e.style.color='#ff6b6b';e.textContent='Promise Error: '+msg;}
  console.error('unhandledrejection:',ev.reason);
});
// === CONFIG ===
const SB_URL='https://qpcjnfxkrdyehegycssy.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwY2puZnhrcmR5ZWhlZ3ljc3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NjAzMTcsImV4cCI6MjA5NjMzNjMxN30.xZHwpTm6_y_5NbDsXhF5YpZEm8rlY5z_a1Kzwd5CdkM';
const BUCKET='family-media';
let sb=null;
function initSB(){try{if(window.supabase&&sb===null)sb=window.supabase.createClient(SB_URL,SB_KEY);}catch(e){sb=null;}}

// === STATE ===
let tab='live',user=null,role=null,online=navigator.onLine;
let stamps={},queue=[],liveCache=[];
let newStamp=null,openCity=null;
try{user=JSON.parse(localStorage.getItem('jp_u')||'null');}catch{}
try{stamps=JSON.parse(localStorage.getItem('jp_stamps')||'{}');}catch{}
try{queue=JSON.parse(localStorage.getItem('jp_q')||'[]');}catch{}
if(user)role=user.role;

// === HELPERS ===
const $=id=>document.getElementById(id);
let syT=null;
function sy(cls,msg){
  var e=$('sy');if(!e)return;
  e.textContent=msg;e.className=cls;e.style.display='block';
  clearTimeout(syT);
  if(cls!=='go')syT=setTimeout(()=>e.style.display='none',2500);
}
window.addEventListener('online',()=>{online=true;syncQ();sy('ok','🌐 Connectat');initSB();});
window.addEventListener('offline',()=>{online=false;sy('of','📵 Offline');});

function openLB(src,isV,user,place){
  var img=$('lbi'),vid=$('lbv');
  img.style.display='none';vid.style.display='none';vid.src='';
  if(isV){vid.src=src;vid.style.display='block';}
  else{img.src=src;img.style.display='block';}
  $('lbc').textContent=[user,place].filter(Boolean).join(' · ');
  $('lb').classList.add('on');
}
function closeLB(){$('lb').classList.remove('on');var v=$('lbv');if(v){v.pause();v.src='';}}
function closeModal(){$('md').innerHTML='';}

function localGet(pid){try{return JSON.parse(localStorage.getItem('jp_p_'+pid)||'[]');}catch{return[];}}
function localAdd(pid,entry){try{var a=localGet(pid);a.unshift(entry);localStorage.setItem('jp_p_'+pid,JSON.stringify(a.slice(0,50)));}catch(e){}}

// === TRAVELLERS ===
const TRAVELLERS=[
  {name:'Jordi',  emoji:'👨',role:'traveller'},
  {name:'Toni',   emoji:'👨',role:'traveller'},
  {name:'Anna P.',emoji:'👩',role:'traveller'},
  {name:'Fèlix',  emoji:'👦',role:'traveller'},
  {name:'Anna M.',emoji:'👩',role:'traveller'},
  {name:'Carles', emoji:'👨',role:'traveller'},
  {name:'Lluc',   emoji:'🧑',role:'traveller'},
  {name:'Bruna',  emoji:'👧',role:'traveller'},
];

// === USER ===
function setUser(obj){
  user=obj;role=obj.role;
  localStorage.setItem('jp_u',JSON.stringify(obj));
  closeModal();
  tab=role==='viewer'?'live':role==='admin'?'live':'itinerary';
  buildNav();render();
  sy('ok','Benvingut/da, '+obj.name+'! '+obj.emoji);
  if(sb&&online)startRT();
}
function showWelcome(){
  $('md').innerHTML=`
  <div style="position:fixed;inset:0;z-index:300;overflow:hidden">
    <img src="https://images.pexels.com/photos/5169056/pexels-photo-5169056.jpeg?auto=compress&cs=tinysrgb&w=800" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">
    <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.95) 0%,rgba(0,0,0,.5) 50%,rgba(0,0,0,.2) 100%)"></div>
    <div style="position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;height:100%;padding:0 28px calc(40px + var(--sb));animation:fi .4s ease">
      <div style="font-size:10px;letter-spacing:4px;color:var(--go);margin-bottom:8px;text-transform:uppercase">Família · Juliol 2026</div>
      <div style="font-family:'Noto Serif JP',serif;font-size:18px;font-weight:300;letter-spacing:6px;color:#e8b4b8;margin-bottom:2px">日本へ</div>
      <div style="font-family:'Noto Serif JP',serif;font-size:52px;font-weight:700;color:#fff;line-height:.9;letter-spacing:-2px;margin-bottom:12px">JAPÓ</div>
      <div style="font-size:13px;color:rgba(255,255,255,.45);margin-bottom:28px;line-height:1.6">Benvingut/da a la guia familiar.<br>Qui ets tu?</div>
      <div onclick="setUser({name:'Avis',emoji:'👴👵',role:'viewer'})" style="background:linear-gradient(135deg,rgba(201,168,76,.15),rgba(201,168,76,.05));border:1px solid rgba(201,168,76,.4);border-radius:16px;padding:18px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:14px">
        <div style="font-size:36px">👴👵</div>
        <div><div style="font-family:'Noto Serif JP',serif;font-size:17px;font-weight:700;color:#fff">Avis</div><div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">Seguir el viatge des de casa</div></div>
      </div>
      <div onclick="showTravPicker()" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:18px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:14px">
        <div style="font-size:36px">✈️</div>
        <div><div style="font-family:'Noto Serif JP',serif;font-size:17px;font-weight:700;color:#fff">Soc al viatge</div><div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">Itinerari, segells i fotos</div></div>
      </div>
      <div onclick="showAdminLogin()" style="background:rgba(192,57,43,.08);border:1px solid rgba(192,57,43,.25);border-radius:16px;padding:14px 18px;cursor:pointer;display:flex;align-items:center;gap:12px">
        <div style="font-size:28px">👩‍💼</div>
        <div><div style="font-size:14px;font-weight:700;color:#fff">Sharon · Admin</div><div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:1px">Gestió i seguiment</div></div>
      </div>
    </div>
  </div>`;
}

function showTravPicker(){
  $('md').innerHTML=`
  <div class="mb" onclick="if(event.target===this)closeModal()">
    <div class="ms">
      <div class="mh"><div class="mhb"></div></div>
      <div style="padding:16px 20px 0"><div style="font-size:36px;margin-bottom:8px">✈️</div><div class="pt">Qui ets tu?</div></div>
      <div class="msc">
        <div style="display:flex;flex-direction:column;gap:8px">
          ${TRAVELLERS.map(t=>`<div onclick='setUser({"name":"${t.name}","emoji":"${t.emoji}","role":"traveller"})' style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:14px;font-size:15px;font-weight:700;color:#fff"><span style="font-size:26px">${t.emoji}</span>${t.name}</div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

function showAdminLogin(){
  $('md').innerHTML=`
  <div class="mb" onclick="if(event.target===this){}">
    <div class="ms">
      <div class="mh"><div class="mhb"></div></div>
      <div style="padding:20px 20px 0;text-align:center">
        <div style="font-size:36px;margin-bottom:8px">👩‍💼</div>
        <div class="pt">Sharon · Admin</div>
        <div style="font-size:12px;color:var(--mu);margin-top:6px">PIN d'administradora</div>
      </div>
      <div class="msc" style="text-align:center">
        <input id="apin" type="password" inputmode="numeric" maxlength="4" placeholder="····"
          style="width:120px;text-align:center;font-size:28px;letter-spacing:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:14px 10px;color:#fff;margin-bottom:16px;outline:none;font-family:'Zen Kaku Gothic New',sans-serif"
          oninput="if(this.value.length===4)chkPin(this.value)">
        <div id="pe" style="font-size:12px;color:#e94560;margin-bottom:12px;display:none">PIN incorrecte.</div>
        <button onclick="chkPin($('apin').value)" style="background:linear-gradient(135deg,#c0392b,#9b2335);border:none;border-radius:12px;padding:12px 32px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:'Zen Kaku Gothic New',sans-serif">Entrar</button>
        <div style="margin-top:14px"><button onclick="showWelcome()" style="background:none;border:none;color:var(--mu);font-size:12px;cursor:pointer;font-family:'Zen Kaku Gothic New',sans-serif">← Tornar</button></div>
      </div>
    </div>
  </div>`;
  setTimeout(function(){var p=$('apin');if(p)p.focus();},100);
}

function chkPin(pin){
  if(pin==='2026'){setUser({name:'Sharon',emoji:'👩‍💼',role:'admin'});}
  else{var e=$('pe');if(e)e.style.display='block';var p=$('apin');if(p){p.value='';p.focus();}}
}

// === NAV ===
function buildNav(){
  var tabs=role==='viewer'
    ?[['live','❤️','En viu'],['photos','📸','Memòries'],['itinerary','🗾','Ruta']]
    :role==='admin'
    ?[['live','📡','En viu'],['itinerary','🗾','Itinerari'],['photos','📸','Memòries'],['stamps','🏮','Segells'],['admin','⚙️','Admin']]
    :[['itinerary','🗾','Itinerari'],['live','📡','En viu'],['food','🍜','Menjar'],['photos','📸','Memòries'],['stamps','🏮','Segells']];
  $('nv').innerHTML=tabs.map(function(t){
    return '<button class="nb'+(tab===t[0]?' on':'')+'" data-tab="'+t[0]+'" onclick="go(\''+t[0]+'\')"><span class="ni">'+t[1]+'</span><span class="nl">'+t[2]+'</span></button>';
  }).join('');
}

function go(t){
  tab=t;
  document.querySelectorAll('.nb').forEach(function(b){b.classList.toggle('on',b.dataset.tab===t);});
  render();
}

function render(){
  var el=$('pg');el.scrollTop=0;
  if(tab==='live')renderLive(el);
  else if(tab==='itinerary')renderItinerary(el);
  else if(tab==='food')renderFood(el);
  else if(tab==='photos')renderMemories(el);
  else if(tab==='stamps')renderStamps(el);
  else if(tab==='admin')renderAdmin(el);
}

// === UPLOAD ===
async function deletePhoto(btn, fname, pid){
  if(!confirm('Eliminar aquesta foto?'))return;
  // Remove from DOM
  var cell=btn.parentNode;if(cell)cell.remove();
  // Remove from localStorage
  try{
    var arr=localGet(pid);
    arr=arr.filter(function(p){return p.fname!==fname;});
    localStorage.setItem('jp_p_'+pid,JSON.stringify(arr));
  }catch(e){}
  // Remove from Supabase
  if(sb&&online&&fname){
    try{await sb.storage.from(BUCKET).remove([fname]);sy('ok','🗑️ Foto eliminada');}
    catch(e){sy('er','Error eliminant la foto');}
  }
}

async function compressImg(dataUrl){
  return new Promise(function(res){
    var img=new Image();
    img.onload=function(){
      var c=document.createElement('canvas');
      var r=Math.min(1,600/img.width);
      c.width=img.width*r;c.height=img.height*r;
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      res(c.toDataURL('image/jpeg',.65));
    };
    img.onerror=function(){res(dataUrl);};
    img.src=dataUrl;
  });
}

async function uploadFile(file,pid){
  var u=user||{name:'user'};
  var ext=(file.name.split('.').pop()||'jpg').toLowerCase();
  var isVid=file.type.startsWith('video/')||['mp4','mov','webm'].indexOf(ext)>-1;
  var fname=pid+'/'+u.name.replace(/[^a-zA-Z0-9]/g,'')+'_'+Date.now()+'.'+ext;
  var reader=new FileReader();
  reader.readAsDataURL(file);
  await new Promise(function(r){reader.onload=r;});
  var full=reader.result;
  var thumb=isVid?null:await compressImg(full);
  var entry={dataUrl:thumb||full,user:u.name,ts:Date.now(),isVid:isVid,fname:fname,pid:pid};
  try{localAdd(pid,entry);}catch(e){}
  if(!sb||!online){
    try{queue.push({fname:fname,pid:pid,dataUrl:full,ct:file.type,isVid:isVid});localStorage.setItem('jp_q',JSON.stringify(queue));}catch(e){}
    sy('of','💾 Guardat localment');return entry;
  }
  sy('go','↑ Penjant foto…');
  console.log('Uploading to:',fname);
  try{
    var blob=await fetch(full).then(function(r){return r.blob();});
    await sb.storage.from(BUCKET).upload(fname,blob,{contentType:file.type});
    var url=sb.storage.from(BUCKET).getPublicUrl(fname).data.publicUrl;
    sy('ok',isVid?'🎥 Vídeo penjat!':'📸 Foto penjada!');
    // Reload the photo grid if visible
    var openGrid=document.getElementById('pgrid-'+pid);
    if(openGrid){
      // If in memories tab, add cell directly
      if(tab==='photos'){
        var newCell=document.createElement('div');
        newCell.className='pt2';
        var imgSrc=result.url||result.dataUrl||'';
        var safeSrc=imgSrc.replace(/'/g,'%27');
        var safeU=(result.user||'').replace(/'/g,'');
        var safeFn=(result.fname||'').replace(/'/g,'');
        newCell.innerHTML='<div onclick="openLB(\''+safeSrc+'\','+result.isVid+',\''+safeU+'\',\'\')" style="position:absolute;inset:0"><img src="'+imgSrc+'" style="width:100%;height:100%;object-fit:cover"></div><div style="position:absolute;bottom:3px;left:3px;font-size:8px;background:rgba(0,0,0,.65);padding:1px 5px;border-radius:3px;color:rgba(255,255,255,.8)">'+safeU+'</div><button onclick="deletePhoto(this,\''+safeFn+'\',\''+pid+'\')" style="position:absolute;top:4px;right:4px;background:rgba(192,57,43,.85);border:none;border-radius:50%;width:22px;height:22px;color:#fff;font-size:13px;cursor:pointer;font-weight:700;z-index:10">✕</button>';
        var upBtn=openGrid.querySelector('.upb');
        if(upBtn)openGrid.insertBefore(newCell,upBtn);
        else openGrid.appendChild(newCell);
      } else {
        loadPP(pid);
      }
    }
    liveCache=[];
    return Object.assign({},entry,{url:url});
  }catch(e){
    try{queue.push({fname:fname,pid:pid,dataUrl:full,ct:file.type,isVid:isVid});localStorage.setItem('jp_q',JSON.stringify(queue));}catch(e2){}
    sy('er','⚠ Error penjant. Guardat localment.');
    console.error('Upload error details:',e.message,e.status,e);return entry;
  }
}

async function syncQ(){
  if(!sb||!online||!queue.length)return;
  sy('go','↑ Sincronitzant…');
  var keep=[];
  for(var i=0;i<queue.length;i++){
    try{
      var blob=await fetch(queue[i].dataUrl).then(function(r){return r.blob();});
      await sb.storage.from(BUCKET).upload(queue[i].fname,blob,{contentType:queue[i].ct||'image/jpeg',upsert:true});
    }catch(e){keep.push(queue[i]);}
  }
  queue=keep;
  try{localStorage.setItem('jp_q',JSON.stringify(queue));}catch(e){}
  sy('ok',queue.length===0?'✓ Tot sincronitzat':'⚠ '+queue.length+' pendent(s)');
}

function handleFiles(files,pid){
  if(!user){showWelcome();return;}
  Array.from(files).filter(function(f){return f.type.startsWith('image/')||f.type.startsWith('video/');}).forEach(function(f){addToGrid(f,pid);});
}

async function addToGrid(file,pid){
  var grid=$('pgrid-'+pid);
  var thumb=document.createElement('div');
  thumb.className='pt2 sk';
  if(grid)grid.prepend(thumb);
  var result=await uploadFile(file,pid);
  if(!result)return;
  var src=result.url||result.dataUrl;
  var safeSrc=src.replace(/'/g,'%27');
  var safeU=(result.user||'').replace(/'/g,'');
  thumb.classList.remove('sk');
  if(result.isVid){
    thumb.innerHTML='<video src="'+src+'" muted playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover"></video><div onclick="openLB(\''+safeSrc+'\',true,\''+safeU+'\',\'\')" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.3)"><div style="font-size:22px">▶️</div></div><div style="position:absolute;bottom:3px;left:3px;font-size:8px;background:rgba(0,0,0,.65);padding:1px 5px;border-radius:3px;color:rgba(255,255,255,.8)">'+result.user+'</div>';
  }else{
    thumb.innerHTML='<img src="'+src+'" onclick="openLB(\''+safeSrc+'\',false,\''+safeU+'\',\'\')" loading="lazy"><div style="position:absolute;bottom:3px;left:3px;font-size:8px;background:rgba(0,0,0,.65);padding:1px 5px;border-radius:3px;color:rgba(255,255,255,.8)">'+result.user+'</div>';
  }
}

function pick(pid){
  if(!user){showWelcome();return;}
  var inp=document.getElementById('fi-'+pid);
  if(!inp){inp=document.createElement('input');inp.type='file';inp.accept='image/*,video/*';inp.multiple=true;inp.id='fi-'+pid;inp.style.display='none';inp.onchange=function(e){handleFiles(e.target.files,pid);};document.body.appendChild(inp);}
  inp.click();
}

// === REALTIME ===
var rtSub=null;
function startRT(){
  if(!sb||rtSub)return;
  rtSub=sb.channel('rt').on('postgres_changes',{event:'INSERT',schema:'storage',table:'objects',filter:'bucket_id=eq.'+BUCKET},function(){
    sy('ok','📸 Nova foto!');
    if(tab==='live'||tab==='photos')render();
  }).subscribe();
}

// === WEATHER ===
var wCache={};
var CC={"Tòquio":{lat:35.6762,lon:139.6503},"Kyoto":{lat:35.0116,lon:135.7681},"Osaka":{lat:34.6937,lon:135.5023}};
async function fetchW(city){
  if(wCache[city])return wCache[city];
  if(!online)return null;
  try{
    var cc=CC[city]||CC["Tòquio"];
    var data=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+cc.lat+'&longitude='+cc.lon+'&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=Asia%2FTokyo&forecast_days=16').then(function(r){return r.json();});
    wCache[city]=data;return data;
  }catch{return null;}
}
function wIco(c){if(c===0)return'☀️';if(c<=2)return'⛅';if(c<=3)return'☁️';if(c<=48)return'🌫️';if(c<=67)return'🌧️';if(c<=77)return'❄️';if(c<=82)return'🌧️';return'⛈️';}
async function getDW(city,dateStr){
  var data=await fetchW(city);if(!data||!data.daily)return null;
  var p=dateStr.toLowerCase().split(' ');
  var day=parseInt(p[0]);
  var mmap={gen:1,feb:2,mar:3,abr:4,mai:5,jun:6,jul:7,ago:8,set:9,oct:10,nov:11,des:12};
  var m=mmap[p[1]]||7;
  var target='2026-'+String(m).padStart(2,'0')+'-'+String(day).padStart(2,'0');
  var idx=data.daily.time.indexOf(target);if(idx===-1)return null;
  return{max:Math.round(data.daily.temperature_2m_max[idx]),min:Math.round(data.daily.temperature_2m_min[idx]),rain:data.daily.precipitation_probability_max[idx],icon:wIco(data.daily.weathercode[idx])};
}
function wBadge(w){if(!w)return'';return w.icon+' <strong>'+w.max+'°/'+w.min+'°</strong>'+(w.rain>20?' 💧'+w.rain+'%':'');}


const OFFLINE_INFO = {
  sensoji: {
    location: "Al barri d'Asakusa, a la riba est del riu Sumida, al districte de Taito de Tòquio.",
    what: "El temple budista més antic de Tòquio, dedicat a Kannon, la deessa de la misericòrdia. L'entrada principal és la famosa porta Kaminarimon amb la llanterna vermella gegant de 700 kg. Dins trobareu el carrer comercial Nakamise i el saló principal ple d'encens i fidels.",
    history: "Fundat el 645 dC per dos pescadors que diuen que van trobar una estatueta de Kannon al riu Sumida. És el temple més visitat del Japó amb uns 30 milions de visitants l'any. El complex actual és una reconstrucció posterior a la Segona Guerra Mundial.",
    europe: "Quan es va fundar el 645 dC, a Europa acabava de morir el papa Honori I i els visigots dominaven la Península Ibèrica. Té quasi 700 anys més que la Catedral de Barcelona!",
    magic: "A primera hora del matí, amb la boira suau i quasi ningú, el pati del temple sembla que t'hagi transportat al Japó del s.XVII.",
    family: "Els nens adoraran els omikuji: per 100 iens podeu agitar una caixa i treure un paper amb la vostra sort. Per als iaios, hi ha bancs a l'ombra davant el saló principal. Foto obligatòria davant la llanterna de Kaminarimon!"
  },
  nakamise: {
    location: "Carrer de 250 metres entre la porta Kaminarimon i el temple Senso-ji, dins el complex d'Asakusa.",
    what: "El carrer comercial de souvenirs més famós del Japó, amb unes 90 botigues a banda i banda venent dolços tradicionals, ventalls, nines kokeshi, samarretes i records. Molt animat i colorit.",
    history: "El carrer existeix des del s.XVIII, quan les autoritats del temple van permetre als venedors instal·lar-se per finançar el manteniment de Senso-ji. Algunes botigues porten el mateix nom familiar des de fa 200 anys.",
    europe: "Quan es va establir com a carrer comercial oficial (s.XVIII), a Catalunya s'estava construint el Palau de la Generalitat tal com el coneixem avui.",
    magic: "Els ningyo-yaki: pastisets calents amb forma de llanterna o colom farcits de pasta de mongeta dolça. S'han de menjar recents, bullents.",
    family: "Els adolescents trobaran samarretes de Godzilla i accessoris de ninja. Per als nens petits, els ventalls i les espases de plàstic de samurai. Per als iaios, aquí podeu comprar els souvenirs sense caminar gaire."
  },
  meiji: {
    location: "Al barri de Harajuku, dins un bosc de 70 hectàrees al centre de Tòquio, al districte de Shibuya.",
    what: "Santuari xintoista dedicat als esperits deïficats de l'Emperador Meiji i la seva esposa l'Emperadriu Shōken. El camí d'entrada entre cedres gegants crea una transició màgica del bullici urbà al silenci forestal. El saló principal és senzill i majestuós.",
    history: "Construït el 1920 en honor a l'Emperador Meiji (1852–1912), que va modernitzar el Japó durant la Restauració Meiji obrint el país a Occident. Destruït per bombardejos el 1945 i reconstruït el 1958. El bosc de 100.000 arbres va ser plantat per voluntaris de tot el Japó.",
    europe: "L'Emperador Meiji va viure en la mateixa època que la Reina Victòria d'Anglaterra i el Kaiser Guillem II d'Alemanya — era l'era dels grans imperis del s.XIX.",
    magic: "Les taules ema: milers de plaques de fusta on els japonesos escriuen els seus desitjos i les pengen als arbres. Podeu escriure-hi el vostre!",
    family: "Si visiteu un diumenge, sovint hi ha cerimònies de casament xintoista tradicionals al pati interior — els nuvis vestits de kimono blanc. Als nens els encantarà el canvi sobtat de la ciutat al bosc."
  },
  harajuku: {
    location: "Al barri de Harajuku, districte de Shibuya, a Tòquio. Takeshita Street és un carreró peatonal de 350 metres paral·lel a l'estació.",
    what: "El carrer de la moda alternativa i la cultura pop juvenil japonesa per excel·lència. Plens de botigues de roba extravagant, perruqueries de colors impossibles, crepes gegants farcides de tot, i joves vestits de cosplay o Lolita fashion. Un espectacle visual constant.",
    history: "Des dels anys 70, Harajuku es va convertir en el punt de trobada dels joves que volien experimentar amb estils visuals inspirats en Occident. Als anys 80 i 90 es va fer famós internacionalment per les tribus urbanes com els Takenoko-zoku. La cantant Gwen Stefani el va popularitzar a Occident amb la cançó Harajuku Girls (2004).",
    europe: "La cultura pop de Harajuku té la mateixa energia que el Soho de Londres als anys 60 o el Marais de París als 80 — un barri que marca tendència mundial.",
    magic: "Les crepes de Harajuku: enormes cons farcits de gelat, maduixes, nata i xocolata. Dolcíssims i espectaculars per fer fotos.",
    family: "Els adolescents es voldran quedar hores. Per als pares, hi ha cafès còmodes a les cantonades. Per als iaios, el parc proper al santuari Meiji és un descans tranquil mentre els joves exploren."
  },
  shinjuku_view: {
    location: "Al pis 45 de la Torre Nord de l'Ajuntament Metropolità de Tòquio, al barri de Shinjuku.",
    what: "Mirador completament gratuït a 202 metres d'alçada amb vistes de 360° de Tòquio. En dies clars podeu veure el Mont Fuji al fons. Obert fins les 22:30h. Hi ha un bar on podeu prendre alguna cosa mentre contempleu la ciutat.",
    history: "L'edifici de l'Ajuntament va ser dissenyat per l'arquitecte estrella Kenzō Tange i inaugurat el 1991. El cost de construcció va ser tan elevat que va provocar un debat públic al Japó. Davant seu es fa el videomapping nocturn que vosaltres veureu.",
    europe: "La Torre Eiffel de París fa 330 metres, però el mirador de l'Ajuntament de Tòquio és gratuït i molts locals el prefereixen. A Barcelona equivaldria a veure tota la ciutat des de dalt del Tibidabo, però al centre.",
    magic: "De nit, Tòquio és un mar de llums que s'estén fins a l'horitzó en totes direccions — és literalment impossible veure on acaba la ciutat.",
    family: "Completament gratuït i accessible. L'ascensor va molt ràpid (45 pisos en 55 segons). Per als nens hi ha telescopis a les finestres. Intenteu anar-hi al vespre per veure el canvi del dia a la nit."
  },
  imperial: {
    location: "Al centre geogràfic de Tòquio, al districte de Chiyoda, envoltat de fossats i jardins.",
    what: "Residència actual de la família imperial japonesa. Visitareu l'exterior i els Jardins Est (Higashi Gyoen), oberts al públic. Els fossats, les muralles de pedra i les torres de guàrdia creen un ambient medieval enmig de la metròpoli moderna.",
    history: "Construït sobre les ruïnes del Castell d'Edo, la fortalesa del shogun Tokugawa que dominava el Japó des del s.XVII. Quan l'Emperador Meiji va arribar a Tòquio el 1869, el va triar com a nova residència imperial. El palau actual és de 1968.",
    europe: "El Castell d'Edo original del s.XVII era contemporani al Palau de Versalles de Lluís XIV de França — tots dos símbols del poder absolut en les seves respectives cultures.",
    magic: "El pont Nijubashi: el doble pont de pedra davant la porta principal és un dels llocs més fotografiats del Japó, especialment reflectit a l'aigua del fossat.",
    family: "Els jardins Est (gratuïts) tenen un jardí japonès tranquil perfecte per als iaios. Per als nens, les muralles de pedra gegants i les torres de guàrdia semblen un castell de veritat. Porteu picnic!"
  },
  akihabara: {
    location: "Al districte de Chiyoda, a Tòquio. L'estació d'Akihabara és el centre d'aquest barri.",
    what: "El barri de l'electrònica, el manga, l'anime i la cultura otaku per excel·lència al món. Rascacels plens de videojocs nous i retro, figures de col·lecció, cartes, còmics, cafès temàtics de videojocs, i botigues d'electrònica de 8 plantes. Els adolescents poden trigar hores.",
    history: "Després de la Segona Guerra Mundial es va convertir en el mercat negre de ràdios i components elèctrics. Als anys 80 va ser el centre mundial de la informàtica personal. Als 90 i 2000 la cultura otaku el va transformar en el que és avui: la meca del manga i l'anime global.",
    europe: "No té equivalent directe a Europa — potser el més proper seria una barreja entre el Fnac de Paris, la Game de Londres i una convenció de còmic, tot multiplicat per deu i posat en un sol carrer.",
    magic: "Les màquines d'arcade de 8 plantes: alguns edificis sencers són salles d'arcade amb jocs impossibles de trobar a Europa, des de simuladors de tambors fins a jocs de cartes hologràfics.",
    family: "Els adolescents s'hi voldran quedar tot el dia. Per als nens, els Pokémon Centers oficials venen peluixos i cartes. Per als iaios o qui es cansi, hi ha un Starbucks a la cantonada i cafès tranquils a les plantes superiors."
  },
  hamarikyu: {
    location: "Al districte de Chuo, vora la badia de Tòquio, a uns 15 minuts a peu de Ginza.",
    what: "Un dels jardins japonesos tradicionals més ben conservats de Tòquio. Inclou un estany d'aigua salada que canvia amb les marees, una teiera en una illeta, pins centenaris i flors de temporada. L'entrada del jardí dóna directament a l'embarcador de vaixells fluvials.",
    history: "Antigament era el terreny de caça privat de la família del shogun Tokugawa al s.XVII. El nom significa 'jardí del mar tranquil del falcó'. Quan la família imperial va prendre el poder el 1868, es va convertir en jardí imperial. Obert al públic el 1946.",
    europe: "El jardí va ser creat mentre a Europa regnava Lluís XIV a Versalles — ambdós són exemples del jardí com a símbol de poder i refinament de l'elit del s.XVII.",
    magic: "La teiera Nakajima-no-ochaya: una caseta tradicional sobre l'estany on podeu prendre una tassa de te matcha amb un pastís wagashi mentre els rascacels de Tòquio us observen al fons.",
    family: "Un dels jardins menys massificats de Tòquio. Els iaios ho agrairan molt. Per als nens, els patos i les garses a l'estany. Es pot combinar amb un passeig amb vaixell pel riu Sumida fins a Asakusa."
  },
  tokyo_tower: {
    location: "Al districte de Minato, Tòquio. El temple Zojo-ji és just al costat de la torre.",
    what: "La Torre de Tòquio és una torre de comunicació de 333 metres pintada de taronja i blanc, inspirada en la Torre Eiffel però 13 metres més alta. Al seu peu, el temple budista Zojo-ji del s.XIV ofereix un contrast brutal entre tradició i modernitat. La foto des del jardí del temple amb la torre al fons és una de les imatges més icòniques del Japó.",
    history: "La Torre de Tòquio es va construir el 1958 com a símbol de la reconstrucció del Japó post-guerra i del nou poder econòmic japonès. Zojo-ji va ser el temple familiar dels shogun Tokugawa des del s.XIV fins al s.XIX — sis shogun hi estan enterrats.",
    europe: "La torre es va construir el mateix any que de Gaulle fundava la Cinquena República Francesa (1958). Zojo-ji, en canvi, és contemporani a l'Alhambra de Granada — ambdós del s.XIV.",
    magic: "Al pati de Zojo-ji hi ha centenars de petites estàtues de Jizo cobertes de gorres i babets de colors posats per pares que han perdut fills — un racó inesperadament emotiu.",
    family: "La foto temple + torre des del jardí és la més photogenic de Tòquio. Els iaios apreciaran el temple tranquil. Els nens voldran pujar a la torre (hi ha dues plataformes d'observació). De nit la torre s'il·lumina en colors especials."
  },
  shibuya: {
    location: "Al centre del districte de Shibuya, directament davant l'estació de Shibuya (sortida Hachiko).",
    what: "El cruïment de vianants més fotografiat del món. Quan el semàfor es posa verd per als vianants en totes direccions alhora, fins a 3.000 persones creuen en diagonal, en línia recta i en totes direccions simultàniament — i no hi ha cap col·lisió. La millor vista és des del Starbucks o el McDonald's del primer pis.",
    history: "El sistema de semàfor 'scramble' es va instal·lar aquí als anys 70 per gestionar el flux humà gegantí d'una de les estacions de metro més concorregudes del món. Va aparèixer a la pel·lícula Lost in Translation (2003) i des d'aleshores va explotar el turisme.",
    europe: "No té equivalent a Europa. El Times Square de Nova York o la Plaça Cataluña de Barcelona en hora punta no arriben ni a la meitat de la densitat de vianants d'aquest cruïment.",
    magic: "Mirar-lo des de dalt mentre tothom creua és hipnòtic — sembla coreografiat però és completament espontani. De nit amb la pluja és especialment espectacular.",
    family: "Per als adolescents, fer selfies enmig del cruïment és obligatori. Per als iaios, millor observar-lo des del primer pis d'algun local. La mascota Hachiko (l'estàtua del gos fidel) és just a la sortida de l'estació — foto familiar clàssica."
  },
  ueno: {
    location: "Al districte de Taito, Tòquio, a 5 minuts a peu de l'hotel d'Asakusa.",
    what: "Gran parc urbà de 53 hectàrees amb el zoo de Tòquio, cinc museus nacionals, temples, pagodes, el llac Shinobazu ple de lotus i barques de pedals, i flors de cereser a la primavera. Un dels pulmors verds de la ciutat amb molta vida local.",
    history: "El parc va ser creat el 1873 sobre el complex del temple Kan'ei-ji, fundat el 1625 pels Tokugawa. Durant la guerra Boshin de 1868 —la guerra civil que va acabar amb el poder dels shogun— va ser l'escenari de l'última batalla a Tòquio. Alguns dels museus nacionals tenen col·leccions d'art japonès inigualables.",
    europe: "El temple Kan'ei-ji va ser fundat el 1625, el mateix any que Velázquez pintava el seu primer gran retrat per a la cort espanyola. Ambdós símbols del poder i la cultura de l'època.",
    magic: "La pagoda de cinc pisos de Kan'ei-ji que asoma entre els arbres al costat dels museus moderns — un recordatori constant que sota cada parc de Tòquio hi ha segles d'història.",
    family: "El zoo de Tòquio té pandes gegants (un reclam enorme per als nens japonesos i estrangers). Per als iaios, els cafès al costat del llac amb vistes als lotus. El museu nacional és fantàstic per als qui vulguin entendre l'art japonès."
  },
  nezu: {
    location: "Al districte de Bunkyo, Tòquio, a prop del parc Ueno. Accessible a peu des d'Ueno en uns 20 minuts.",
    what: "Santuari xintoista menys turístic que Fushimi Inari però amb el mateix encant: un passadís de torii vermells en miniatura que pugen per un turó entre arbres frondosos. Molt fotogènic, tranquil i autèntic — aquí vindreu sobretot amb locals, no amb turistes.",
    history: "Un dels santuaris xintoistes més antics de Tòquio, fundat fa més de 1.900 anys. L'estructura actual data del 1706, construïda per ordre del shogun Tokugawa Tsunayoshi. Està dedicat a Susanoo no Mikoto, el déu xintoista de les tempestes.",
    europe: "El santuari original es diu que és de l'any 100 dC — quan l'Imperi Romà estava en el seu apogeu i els emperadors Trà i Adrià construïen el Panteó de Roma.",
    magic: "El camí cap als torii puja per escales de pedra cobertes de molsa entre cedres i roures, amb llum filtrada que crea una atmosfera de conte. Molt diferent del caos de Senso-ji.",
    family: "Ideal per als qui vulguin una experiència autèntica sense masses. Els iaios ho apreciaran molt — és planer i tranquil. Per als nens, els torii vermells creen una sensació de joc d'aventura. Porta càmera de foto."
  },
  kabuki: {
    location: "Al barri de Ginza, districte de Chuo, Tòquio. A 2 minuts de l'estació de metro Higashi-Ginza.",
    what: "El teatre kabuki principal del Japó, amb capacitat per a 1.808 espectadors. El kabuki és teatre tradicional japonès del s.XVII amb actors tots homes, maquillatge extravagant (kumadori), vestuari espectacular, música en directe i escenes d'acció. Podeu comprar entrades per a un sol acte (45-60 min) al taquillerat del dia.",
    history: "El kabuki va néixer el 1603 a Kyoto com un espectacle popular i una mica escandalós. Va ser declarat Patrimoni Immaterial de la Humanitat per la UNESCO el 2008. El teatre Kabuki-za actual va ser construït el 1925 en estil japonès tradicional, reconstruït el 2013.",
    europe: "El kabuki va néixer el mateix any que Shakespeare escrivia Otello (1603-1604). Ambdós són l'expressió màxima del teatre de la seva cultura en la mateixa època.",
    magic: "Els actors kabuki vénen de famílies que porten el mateix nom artístic durant generacions — és una tradició dinàstica on el talent es transmet de pares a fills des del s.XVII.",
    family: "Podeu llogar audiogies en anglès que expliquen l'acció en temps real. Per als adolescents, el maquillatge i les lluites escèniques són espectaculars. Per als nens petits, millor agafar un sol acte curt. Els iaios ho trobaran fascinant."
  },
  gion: {
    location: "Al districte de Higashiyama, Kyoto, a l'est del riu Kamo. El carrer principal és Hanamikoji.",
    what: "El barri més ben preservat de Kyoto, amb carrers empedrats, cases de fusta centenàries (machiya i okiya), llanternes de paper vermell i la possibilitat de veure geishas i maikos caminant cap a les seves cites. Al vespre pren una atmosfera màgica quasi intacta des del s.XVII.",
    history: "Gion va créixer als voltants del santuari Yasaka com a barri d'entreteniment i descans per als pelegrins. Al s.XVIII va tenir 700 okiyas (cases de geishas). Avui en queden unes 80 geishas i maikos actives al barri — una fracció del passat però prou per sentir la tradició viva.",
    europe: "Quan Gion era al seu apogeu al s.XVIII, a Catalunya s'estava construint el Palau de la Virreina a la Rambla de Barcelona — ambdós símbols del refinament i el luxe de l'època.",
    magic: "Si teniu sort i respecte, podeu creuar-vos amb una maiko (geisha en formació) vestida de kimono a Hanamikoji cap a les 17-18h. No la fotografieu sense permís — és una persona treballant.",
    family: "El carrer Ninenzaka i Sannenzaka (empedrats en forma d'S) a prop de Kiyomizudera és perfecte per caminar. Hi ha gelateries de matcha molt bones. Per als iaios, els bancs davant del santuari Yasaka. Vigileu amb els kimonos de lloguer que porten molts turistes!"
  },
  arabica: {
    location: "A Higashiyama, Kyoto, al carrer que puja cap al temple Kiyomizudera. Hi ha diverses sucursals a la ciutat.",
    what: "Cafè artesà japonès fundat a Kyoto el 2014 que ara té locals a Londres, Dubai, Hong Kong i Nova York. Especialitzats en cafè single-origin preparat amb mètodes de filtrat manuals. La sucursal de Higashiyama és dins un edifici tradicional amb vistes al barri antic.",
    history: "El % Arabica va ser fundat per Kenneth Shoji amb la filosofia 'See the World Through Coffee'. En deu anys ha passat de ser un únic cafè a Kyoto a una marca de culte global. El logo del percentatge % és reconegut per cafèlegs de tot el món.",
    europe: "El % Arabica és al cafè artesà el que Massimo Bottura és a la gastronomia italiana: una proposta japonesa d'excel·lència que ha conquerit el món.",
    magic: "El latte art que fan els baristes és obra d'art en miniatura. Alguns guanyen campionats mundials de latte art. El café al gel ('iced latte') amb llet de Kyoto és especialment cremós.",
    family: "Perfecte parada de descans enmig del barri de Higashiyama. Serveixen també llets amb sabors (matcha, caramel) per als que no prenen cafè. Preu una mica alt però l'experiència ho val. Menys de 10 minuts de cua si aneu a primera hora."
  },
  kinkakuji: {
    location: "Al districte de Kita, Kyoto, al nord-oest de la ciutat. A uns 20 minuts amb taxi des del centre.",
    what: "El Temple del Pavelló Daurat: un pavelló de tres pisos cobert de full d'or pur que es reflecteix perfectament a l'estany Kyōko-chi. És sens dubte un dels edificis més fotografiats del món. El jardí que l'envolta és un jardí japonès de la tea ceremony amb rocas, pins centenaris i arbustos retallats.",
    history: "Construït el 1397 com a vil·la de retir del shogun Ashikaga Yoshimitsu. Quan va morir, la família el va convertir en temple zen. L'edifici original va ser cremat el 1950 per un monjo budista de 21 anys en un acte pertorbat (Mishima va escriure una novel·la famosa sobre aquest fet). La reconstrucció actual és de 1955.",
    europe: "Quan es va construir el 1397, a Catalunya el rei Martí l'Humà governava la Corona d'Aragó i es construïa l'absis de la Catedral de Barcelona. Ambdós del mateix moment esplèndid del s.XIV.",
    magic: "A primera hora del matí, quan la superfície de l'estany està completament quieta, el reflex daurat de l'edifici és tan perfecte que sembla una il·lusió. La foto clàssica és des del camí a l'entrada.",
    family: "Tots i cada un dels membres de la família el trobaran increïble — és un d'aquells llocs que supera les expectatives en persona. Aneu-hi a les 9h d'obertura per evitar les masses. Per als iaios, el camí és planer i curt. Els nens quedaran impressionats pel color daurat."
  },
  myoshinji: {
    location: "Al districte de Ukyo, Kyoto, a prop de Kinkaku-ji. Gran complex de temples zen.",
    what: "Un dels complexos zen més grans del Japó, amb 46 subtempletes dins d'un recinte emmurallat. A diferència de Kinkaku-ji, és un lloc de silenci i meditació quasi sense turistes. Molts subtempletes tenen jardins de pedra i sorra (karesansui) perfectament ratllats. El temple principal té un mural al sostre d'un drac que sembla mirar-te des de qualsevol angle.",
    history: "Fundat el 1337 pel shogun Ashikaga Tadayoshi com a temple budista zen de la secta Rinzai. El fundador espiritual, el monjo Kanzan Egen, en va definir l'estil auster i directe. Molts dels jardins actuals van ser dissenyats entre el s.XV i el s.XVII.",
    europe: "Myoshin-ji es va fundar el 1337, el mateix any que la Pesta Negra feia estralls a Europa matant un terç de la població. Mentre Europa patia, al Japó es creava un dels centres culturals més importants.",
    magic: "El drac del sostre del Hatto (saló principal): una pintura en tinta del s.XVII que sembla que els seus ulls et segueixin des de qualsevol punt de la sala. Visita guiada de 10 minuts per 500 iens.",
    family: "Ideal per als qui volen veure Kyoto sense masses. Els iaios trobaran l'ambient molt tranquil. Per als adolescents, el jardí de pedra ratllada és una bona intro a la filosofia zen. Els nens petits potser s'avorriran — millor limitar a 30-40 minuts."
  },
  honganji: {
    location: "Al districte de Shimogyo, Kyoto, a 10 minuts a peu de l'estació de Kyoto. Al costat del Higashi Hongan-ji.",
    what: "Un dels temples budistes més grans del Japó i seu central de la secta Jōdo Shinshū (Budisme de la Terra Pura), amb milions de fidels a tot el món. L'entrada és gratuïta i s'hi pot entrar al Saló Amida i al Saló de Fundadors, enormes i plens de fidels en oració real.",
    history: "Fundat el 1272 per Shinran Shonin, el reformador budista. El complex actual es va traslladar a la seva ubicació actual a finals del s.XVI per ordre de Toyotomi Hideyoshi. Va ser cremat cinc vegades i reconstruït cada vegada per donatarius arreu del Japó. Patrimoni UNESCO.",
    europe: "Shinran Shonin va fundar la secta el 1272, quan Tomàs d'Aquino escrivia la Summa Theologica a París — dues de les grans reflexions espirituals del s.XIII, a dos extrems del món.",
    magic: "Les cordes que sostenen la porta principal (Karamon) estan teixides amb cabells de fidels que els van donar per ajudar a reconstruir el temple. Podeu veure-les de prop — milers de kilos de cabells humans.",
    family: "Molt accessible i gratuït. Per als iaios, és un temple viu on veuran japonesos reals en oració, no només turistes. Per als nens, la grandiositat dels edificis és impressionant. Un dels temples menys turístics de Kyoto."
  },
  nintendo: {
    location: "A Uji, a uns 20 minuts amb tren des d'Estació Kyoto. A l'antiga fàbrica de Nintendo a Ogura.",
    what: "El primer museu oficial de la història de Nintendo, obert l'octubre de 2024. Conté consoles i jocs des del s.XIX (hanafuda, cartes tradicionals) fins als darrers productes. Hi ha exposicions interactives on pots jugar amb versions gegants dels controls originals. Reserva d'entrada obligatòria en línia.",
    history: "Nintendo va ser fundada el 1889 a Kyoto per Fusajiro Yamauchi per fabricar cartes hanafuda (cartes tradicionals japoneses). La transició a joguines i videojocs va arribar als anys 60-70. El museu es va obrir a l'antiga fàbrica de cartes, que és on tot va començar fa 135 anys.",
    europe: "Nintendo va néixer el 1889, el mateix any que es va inaugurar la Torre Eiffel a Paris i que Gustave Eiffel era l'enginyer estrella d'Europa. Mentre a Europa se celebrava la modernitat d'acer, a Kyoto un home fabricava cartes a mà.",
    magic: "Podeu jugar a Mario Bros, Donkey Kong i Zelda en versions interactives gegants amb controls de dos metres d'amplada. La sensació d'infantesa és immediata fins i tot per als adults.",
    family: "Aquest és per a tots: els iaios es sorprendran amb la història de les cartes hanafuda. Els pares tindran nostàlgia de la NES i el Game Boy. Els adolescents i nens quedaran al·lucinats amb les instal·lacions interactives. Reserveu l'entrada MOLT aviat — s'esgota setmanes abans."
  },
  byodoin: {
    location: "A Uji, a uns 20 minuts amb tren des de Kyoto en la línia de Nara. A la vora del riu Uji.",
    what: "Temple budista del s.XI amb el Pavelló del Fènix (Hoo-do), un dels edificis de l'era Heian millor conservats del Japó. El seu reflex a l'estany és tan perfecte que apareix imprès al billet de 10 iens japonès. Uji és també famós per el millor te matcha del Japó.",
    history: "Construït el 998 com a vil·la nobiliar i convertit en temple el 1052 per Fujiwara no Yorimichi, l'home més poderós del Japó de l'època. El Pavelló del Fènix és l'únic edifici original que sobreviu de l'any 1053 — pràcticament intacte quasi 1.000 anys després. Patrimoni UNESCO.",
    europe: "El Byōdō-in es va construir el 1053, quan a Europa es produïa el Gran Cisma entre l'Església Catòlica i l'Ortodoxa (1054) i Guillem el Conqueridor preparava la invasió d'Anglaterra (1066). Un edifici que ha sobreviscut a tot.",
    magic: "El billet de 10 iens: busqueu una moneda a la butxaca i compareu el Pavelló del Fènix gravat amb l'edifici real davant vostre. És el mateix, quasi mil anys separen les dos imatges.",
    family: "El riu Uji és molt agradable per caminar. Els iaios apreciaran el ritme tranquil de la visita. Per als nens, la moneda de 10 iens és un souvenir que ja porten a sobre. Tasteu un gelat de matcha o un taiyaki de matcha a les botigues del carrer principal."
  },
  gion_matsuri: {
    location: "La desfilada Yamaboko Junko recorre els carrers principals del centre de Kyoto: Shijo, Kawaramachi i Oike.",
    what: "La desfilada principal del festival Gion Matsuri és el 17 de juliol al matí. Enormes carrosses de fins a 25 metres d'alçada (Yamaboko) decorades amb tapisseries medievals europees i joies, tirades a mà per grups de desenes d'homes. Músics de flauta i tambor acompanyen cada carro amb la música 'conchiki-chon'.",
    history: "El Gion Matsuri va néixer el 869 dC com a ritual per apaivagar els déus durant una epidèmia de pesta. Es va celebrar ininterrompudament durant 1.150 anys, excepte durant la guerra civil del s.XV. És el festival xintoista més important del Japó i Patrimoni UNESCO.",
    europe: "El Gion Matsuri va néixer el 869 dC, quan a Europa l'Imperi Carolingi (de Carlemany) es dividia entre els nets de Carlemany al Tractat de Verdun. 1.150 anys de tradició ininterrompuda.",
    magic: "Algunes de les tapisseries que decoren les carrosses són teles flamenques i belgues del s.XVI i XVII importades pel comerç amb la Companyia Holandesa de les Índies — joies textils europees que ara desfilen per Kyoto.",
    family: "Posicioneu-vos al carrer Shijo a les 9h per veure el pas de les primeres carrosses. Porteu para-sol i aigua — farà molta calor. Els iaios han d'arribar aviat per tenir un lloc assegut. Per als nens, els carros gegants que fan tremolar el terra quan passen són inoblidables."
  },
  nijojo: {
    location: "Al centre de Kyoto, al districte de Nakagyo, a 5 minuts a peu de l'estació de metro Nijojo-mae.",
    what: "Palau i fortalesa dels shogun Tokugawa a Kyoto. L'interior del Ninomaru-go-ten (saló principal) té 33 cambres pintades amb tigres, lleopards i aigles daurades. Els sòls 'nightingale' (uguisubari) fan un so de grinyol quan s'hi camina — dissenyats deliberadament per detectar intrusos. Patrimoni UNESCO.",
    history: "Construït el 1603 per Tokugawa Ieyasu, el primer shogun de la dinastia que va governar el Japó durant 265 anys. El 1867, l'últim shogun Tokugawa Yoshinobu va anunciar aquí la devolució del poder a l'Emperador — el moment que va posar fi al feudalisme japonès.",
    europe: "Nijo-jo es va construir el 1603, el mateix any que Shakespeare estrenava Hamlet a Londres. Ambdós símbols de l'apogeu cultural i polític del seu moment.",
    magic: "Camineu molt a poc a poc per l'interior i escolteu: cada pas fa un so melodiós i persistent. Els shogun ho van dissenyar per als seus guàrdies, però ara és una experiència sensorial única. Intenta caminar sense fer soroll — és impossible.",
    family: "Els nens quedaran fascinats pels 'sòls que canten' — és un concepte que entenen i recorden per sempre. Per als iaios, els bancs als jardins exteriors són molt agradables. Els murals daurats de l'interior impacten a tothom."
  },
  kiyomizudera: {
    location: "A les faldes del mont Otowa, al districte d'Higashiyama, est de Kyoto. Pujareu pel carrer empedrat de Ninenzaka.",
    what: "Temple budista encastat a la muntanya amb una terrassa de fusta volada de 13 metres d'alçada sense un sol clau metàl·lic. Des de dalt es veu tota Kyoto. El temple té una font sagrada (Otowa-no-taki) dividida en tres corrents: llarga vida, èxit acadèmic i amor afortunat. No podeu triar dos — significa cobdícia.",
    history: "Fundat el 778 per un monjo que va veure una cascada i va sentir la veu de Kannon. El complex actual és de 1633, reconstruït per ordre del shogun Tokugawa Iemitsu. L'expressió japonesa 'saltar des de Kiyomizudera' significa prendre una decisió valenta —com 'tirar-se a la piscina' en català. Patrimoni UNESCO.",
    europe: "El temple original es va fundar el 778 dC, quan Carlemany era coronat Rei dels Francs i s'estava creant l'Europa medieval. Un any abans de la primera coronació imperial de Carlemany per Lleó III.",
    magic: "A primera hora del matí, amb boira baixa sobre Kyoto i el sol just sortint, la terrassa de fusta pareix suspesa en l'aire sobre els núvols. Abril i novembre són les millors èpoques, però juliol al matí primerenc també és màgic.",
    family: "La pujada pel carrer Ninenzaka (empedrat, amb botigues de record i gelats de matcha) és molt recomanable i accessible per a iaios. Per als adolescents, la foto des de la terrassa amb tota Kyoto al fons és espectacular. La font dels tres corrents és divertida per a tothom."
  },
  ginkakuji: {
    location: "Al nord-est de Kyoto, al districte de Sakyo. L'inici del Camí del Filòsof és just davant l'entrada.",
    what: "El Temple del Pavelló d'Argent, menys conegut que el Daurat però possible que més bonic. Mai es va cobrir de plata (es va quedar sense fons). En canvi, té el jardí zen més refinat de Kyoto: el Ginshanada, un mont cònic de sorra fina que reflecteix la llum de la lluna, i l'estany Kinkyochi amb vista al pavelló. Pura poesia visual.",
    history: "Construït el 1482 com a vil·la de retir del shogun Ashikaga Yoshimasa, un dels patrons de l'art zen més importants de la història japonesa. A diferència del seu avi que va construir el Temple Daurat, Yoshimasa va preferir l'austeritat i la subtilesa. El seu mecenatge va definir l'estètica japonesa del wabi-sabi.",
    europe: "El 1482, a Catalunya Ferran el Catòlic consolidava el seu poder i preparava la unificació de la Península Ibèrica que culminaria amb la presa de Granada el 1492. Ambdós símbols del poder i l'art del s.XV.",
    magic: "El Ginshanada —el mont cònic de sorra ratllada— no es toca mai. Va créixer amb les reparacions anuals al llarg de segles fins a assolir la seva forma perfecta. Es diu que de nit reflecteix la llum de la lluna com si fos plata.",
    family: "Un dels temples més serens de Kyoto. Ideal per als iaios que busquen bellesa sense masses. Per als adolescents, el concepte de wabi-sabi (bellesa en la imperfecció) és una introducció a la filosofia japonesa molt accessible. Combineu-lo amb el Camí del Filòsof just a davant."
  },
  philosophers_path: {
    location: "Camí de 2 km vora el canal Shishigatani, des de Ginkaku-ji al sud fins a Nanzen-ji al nord, al districte de Sakyo de Kyoto.",
    what: "Un camí de terra i pedra al costat d'un canal ple de carpes (koi), amb restaurants petits, galeries d'art, botigues de ceràmica i cafès encantadors. Molt popular per als cereser a la primavera, però en qualsevol estació té una bellesa pausada i tranquil·la. A l'estiu hi ha fresca sota els arbres.",
    history: "El nom ve del filòsof Nishida Kitaro (1870–1945), fundador de l'Escola de Kyoto de la filosofia, que passejava cada dia per aquest camí reflexionant. Nishida va ser el primer filòsof japonès a crear un sistema filosòfic autònom que combinava tradició zen amb filosofia occidental.",
    europe: "Nishida Kitaro va ser contemporani de Heidegger i Wittgenstein — tots tres repensant els fonaments de la filosofia al s.XX però des de tradicions completament diferents.",
    magic: "Uns 100 metres de camí on el canal fa una corba i la llum del matí crea un reflex daurat a l'aigua entre els arbres. No hi ha cap cartell — simplement passegeu i el trobareu.",
    family: "El camí és completament pla i ideal per als iaios. Hi ha cafès amb terrassa cada 200 metres. Per als nens, donar menjar a les carpes del canal (hi venen menjar als quioscs) és molt divertit. Ideal per combinar amb la visita a Ginkaku-ji i Heian Jingu."
  },
  heian: {
    location: "Al districte de Sakyo, Kyoto, al final sud del Camí del Filòsof. El torii principal és a l'exterior, al carrer Jingu-michi.",
    what: "Santuari xintoista amb un dels torri més grans del Japó (24 metres d'alçada, 18 metres d'amplada). El pati interior és un dels més amplis i majestuosos de Kyoto, amb un jardí de 33.000 m² que combina estanys, ponts, iris i maples. Les portes principals Otenmon son vermells llampants.",
    history: "Construït el 1895 per commemorar el 1100è aniversari de la fundació de Kyoto (794 dC). Dedicat als emperadors Kammu (primer) i Komei (penúltim de l'era feudal). Tot el complex és una recreació a escala 2/3 del palau imperial original de Kyoto de l'any 794.",
    europe: "El 1895, quan es va construir el santuari, a Europa s'inaugurava el Palau de Justícia de Brussel·les i Freud publicava els seus primers estudis sobre la histèria. La modernitat occidental i la tradició japonesa, en paral·lel.",
    magic: "El torii vermell de 24 metres a l'exterior del recinte: el trobareu al carrer sense cap avís i la seva escala és aclaparadora. Molts turistes no saben que és la porta del santuari i simplement el fotografien com un arc gegant en mig de la ciutat.",
    family: "El jardí interior és de pagament però val la pena. Per als iaios, el jardí és planer i molt bonic. Per als adolescents, la foto davant del torii gegant és essencial. Per als nens, el pont vermell sobre l'estany de nenúfars és com un conte."
  },
  nara_park: {
    location: "A la ciutat de Nara, a uns 35 minuts amb tren des de Kyoto (Línea Kintetsu o JR Nara Line).",
    what: "Parc urbà de 660 hectàrees on viuen lliures més de 1.200 cèrvols shika (Cervus nippon). Els cèrvols s'acosten als visitants, s'inclinen 'demanant' galletes (shika senbei, 200 iens) i en general fan el que volen. Estan protegits per llei com a animals sagrats xintoistes. Al parc hi ha temples, museus i estanys.",
    history: "Segons la llegenda, el déu Takemikazuchi va arribar a Nara muntat en un cèrvol blanc, cosa que va convertir els cèrvols en animals sagrats. Van ser propietat de l'Estat fins al 1637 i matar-ne un era condemnable amb la mort. Des del 1957 estan protegits per llei com a tresor natural nacional.",
    europe: "La protecció legal dels cèrvols va arribar el 1637, quan Descartes publicava el seu Discurs del Mètode a Europa. Mentre la filosofia occidental separa humans i animals, la tradició xintoista els considera iguals en sacralitat.",
    magic: "Els cèrvols han après a inclinar el cap (com fent una reverència) per demanar galletes — han imitat el gest humà de saludar. Alguns investigadors creuen que és un exemple d'adaptació cultural animal.",
    family: "EL moment favorit dels nens de tot el viatge. Els cèrvols s'acosten als nens tant o més que als adults. Per als iaios, hi ha bancs arreu i ombra. Atenció: els cèrvols de vegades empenten o mosseguen les bosses si creuen que hi ha menjar. Guardeu les bosses altes!"
  },
  todaiji: {
    location: "Dins el parc de Nara, al centre del recinte de temples. Uns 15 minuts a peu des de l'estació.",
    what: "El temple budista de fusta més gran del món, que allotja el Daibutsu: una estàtua de Buda de 15 metres d'alçada i 500 tones de bronze. Dins el temple hi ha una columna amb un forat a la base — la mida exacta d'una narina del Buda. La llegenda diu que qui hi passa obté il·luminació. La majoria de japonesos intenten passar-hi.",
    history: "Construït el 752 per ordre de l'Emperador Shomu per protegir el Japó amb el poder del Buda. La construcció va consumir pràcticament tot el bronze del Japó de l'època i va trigar 15 anys. Va ser cremat i reconstruït dues vegades. L'edifici actual (1709) és un terç més petit que l'original.",
    europe: "El Daibutsu va ser completat el 752 dC, quan a Europa el papa Esteve II demanava ajuda a Pepin el Breu dels Francs per lluitar contra els llombards — els inicis del poder temporal del papat.",
    magic: "El forat a la columna: té exactament 50 cm d'alçada i 37 cm d'amplada. Els japonesos adults fan cua per passar-hi retorçant el cos. Si hi passeu, us toca l'il·luminació. Val la pena intentar-ho.",
    family: "Absolutament per a tots. El Buda de 15 metres dins l'edifici és literalment aclaparador. Per als nens, el forat de la columna és l'activitat que més recorden. Per als iaios, l'entrada és cara però única. Compreu les galletes per als cèrvols fora i veniu aquí directament."
  },
  arashiyama: {
    location: "Al districte d'Arashiyama, a l'oest de Kyoto. A uns 30 minuts amb tren des del centre de Kyoto.",
    what: "Corredor de bambú de 400 metres de llarg on les canyes arriben als 30 metres d'alçada. Quan el vent bufa, tot el bosc fa un soroll de fregadís suau que és únic al món — les autoritats l'han declarat un dels Sons que cal Preservar al Japó. La llum filtrada a través del bambú crea una atmosfera irreal.",
    history: "El bambú d'Arashiyama va ser plantat originalment per una família noble en el s.VIII com a jardí privat. A poc a poc va créixer fins a cobrir tota la zona. Arashiyama és una zona de retir aristocràtic des de l'era Heian (794-1185) — l'equivalent dels nobles kyotoites al que seria la Costa Daurada per als barcelonins.",
    europe: "Arashiyama va ser lloc de retir aristocràtic des del s.VIII, quan a Europa els visigots acaben de ser derrotats pels musulmans i l'emirat de Còrdova establia el seu poder a la Península Ibèrica.",
    magic: "Entreu al bosc a les 6:30-7h del matí quan quasi no hi ha ningú i el sol de juliol travessa en diagonal. Els sons, la llum i l'escala del bambú creen un moment que no s'oblida.",
    family: "Per als iaios, el camí és pla i curt. Per als adolescents, les fotos aquí són espectaculars. Per als nens, la sensació de ser petit enmig del bosc gegant és màgica. Combineu-ho amb un passeig en rickshaw tradicional pel barri per als iaios que no volen caminar."
  },
  tenryuji: {
    location: "A Arashiyama, Kyoto, al peu del bosc de bambú. A l'entrada d'Arashiyama.",
    what: "Temple zen del s.XIV amb un jardí considerat un dels primers deu jardins del Japó. El jardí Sogenchi combina un estany, pedres, pins centenaris i la muntanya Arashiyama com a 'paisatge prestat' (shakkei) — la muntanya és part del jardí tot i no pertànyer-hi. Patrimoni UNESCO.",
    history: "Fundat el 1339 per Ashikaga Takauji per apaivagar l'esperit de l'Emperador Go-Daigo, que ell mateix havia derrotat. El monjo Musō Soseki, el jardiner zen més important de la història, va dissenyar el jardí. Per finançar la construcció, es van enviar vaixells a la Xina —els primers del Japó feudal— i es va crear una ruta comercial.",
    europe: "1339 és l'any que Eduard III d'Anglaterra fundava l'Orde de la Garrotera i s'iniciava la Guerra dels Cent Anys entre Anglaterra i França. Mentre Europa s'esquinçava en guerres, al Japó es creava un dels jardins més serens del món.",
    magic: "El truc del shakkei (paisatge prestat): asseguts a la vora de l'estany, mirant cap al nord, la muntanya Arashiyama sembla part del jardí dissenat. Musō Soseki va calcular cada angle visual per crear aquesta il·lusió 700 anys enrere.",
    family: "Un dels jardins més bonics de Kyoto. Per als iaios, els bancs a la vora de l'estany són perfectes. Per als adolescents, la filosofia del 'paisatge prestat' és un concepte de disseny fascinant. Combineu la visita amb el bosc de bambú tot just a la sortida."
  },
  nenbutsuji: {
    location: "A la part nord d'Arashiyama, uns 20 minuts a peu del bosc de bambú, al carrer Sagano.",
    what: "Petit temple del s.IX amb un cementiri de 1.200 figures de pedra jizo i rakan cobertes de molsa, bolets i herbes. Cada figura és única —amb expressions de sorpresa, son, alegria o tristesa— dedicades a les ànimes que no van tenir un enterrament digne. Un dels llocs més inusuals i emocionants de Kyoto.",
    history: "Fundat el 895 per l'Emperadriu Tachibana-no-Kachiko per donar descans als cadàvers abandonats durant les guerres i epidèmies. Duran el s.XVII va ser tancat i les figures van ser abandonades al mig de la natura. Reobert el 1955, la natura ja havia creat el seu propi paisatge cobrí-les de molsa.",
    europe: "El temple va ser fundat el 895 dC, quan Alfred el Gran d'Anglaterra defensava el seu regne dels vikings. Ambdós moments de crisi i mort, ambdós amb una resposta profundament espiritual.",
    magic: "Cada figura de pedra té 700-1000 anys i una expressió diferent. Busqueu la que 'semblava' estar dormint, la que té la boca oberta de sorpresa, o la que té les mans juntes en oració. Passen minuts buscant-les i comparant-les.",
    family: "Un temple que impacta als adults profundament però que els nens troben misteriós i divertit (no fosc). Per als iaios, el camí interior és curt però desigual — aneu amb calma. Per als adolescents, la història darrere és molt interessant. Poc turisme = experiència autèntica."
  },
  fushimi: {
    location: "Al districte de Fushimi, al sud de Kyoto. A 5 minuts a peu de l'estació de Fushimi Inari (JR Nara Line).",
    what: "Santuari xintoista dedicat a Inari, el déu del vi, el sake i el comerç, coberta de milers de torii vermells donats per empreses i particulars al llarg de segles. El camí principal fins al cim (4 km, 1-2 hores) passa per torii encadenats de forma ininterrompuda. Obert 24 hores.",
    history: "Fundat l'any 711 dC, és un dels santuaris més antics i importants del Japó. Les empreses donen torii per agrair l'èxit comercial — el cost va des dels 400.000 iens fins als milions. Cada torii té el nom del donant gravat al darrere. Hi ha uns 10.000 torii en total.",
    europe: "El santuari original es va fundar el 711 dC, el mateix any que els exèrcits musulmans creuaven l'estret de Gibraltar i entraven a la Península Ibèrica. Dos inicis d'èpoques molt diferents als dos extrems del món.",
    magic: "A les 6-7h del matí, la llum taronja del sol de juliol travessa els torii vermells creant una atmosfera quasi sobrenatural. No hi ha ningú, els gats del santuari s'escalfen al sol, i els ocells canten. És la millor hora.",
    family: "Sortiu a les 8:30 per evitar la calor i les masses. Per als iaios, la zona baixa (primer terç) és plana i espectacular — no cal pujar fins al cim. Per als adolescents, el repte és arribar al cim. Per als nens, els torii creen un joc d'explorar 'quants n'hem passat?'. Porteu molt d'aigua."
  },
  sanjusangendo: {
    location: "Al districte de Higashiyama, Kyoto, a prop de Kiyomizudera. A uns 15 minuts en taxi des del centre.",
    what: "Saló budista de 120 metres de llarg (el més llarg del Japó) que allotja 1.001 estàtues daurades de Kannon, la deessa de la misericòrdia: 1.000 estàtues de peu en files i 1 estàtua central asseguda de 3 metres. Cada estàtua és lleuguerament diferent. La creença diu que entre les 1.000 trobareu el rostre d'un avantpassat.",
    history: "Construït el 1164 per ordre de l'Emperador Go-Shirakawa. Cremat el 1249 i reconstruït el 1266. Les 1.001 estàtues del s.XIII van sobreviure al foc —una de les col·leccions d'escultura medieval millor preservades del món. Cada gener s'hi celebra el Tōshiya: concurs de tir amb arc al llarg dels 120 metres del saló.",
    europe: "El saló original es va construir el 1164, quan Frederic Barbarossa era emperador del Sacre Imperi Romanogermànic i Thomas Becket, arquebisbe de Canterbury, era assassinat. El s.XII, un món en convulsió.",
    magic: "La sensació física d'entrar al saló: 1.001 estàtues daurades s'estenen en fileres fins a perdre's a la distància. El soroll de fora desapareix completament. Molts visitants diuen que és el lloc més impactant de Kyoto, més que els temples famosos.",
    family: "Millor per a adults i adolescents que per a nens molt petits (pot fer-se una mica llarg). Per als iaios, l'entrada és tranquil·la i sense masses. Per als adolescents, el repte de 'trobar el rostre d'un avantpassat' entre les 1.000 estàtues és divertit. Combineu-ho amb Fushimi Inari el mateix matí."
  },
  dotonbori: {
    location: "Al districte de Namba, Osaka. Al costat del canal Dotonbori, al carrer Dotombori-suji.",
    what: "El cor palpitant d'Osaka: un canal i un carrer de 600 metres ple de rètols de neó gegants (el cranc del Kani Doraku, el running man de Glico, el pop de Takoyaki), menjar de carrer per tot arreu, restaurants en fila amb criadors a la porta, i una energia de fira permanent. El lloc on Osaka mostra tota la seva exuberància.",
    history: "El canal de Dotonbori va ser excavat el 1612 per un empresari de teatre, Doton Yasui, per connectar els barris de l'oest i l'est d'Osaka. El 1633 es va convertir en el centre del teatre kabuki i bunraku. Als s.XX els rètols lluminosos van substituir els teatres, però l'energia festiva és la mateixa.",
    europe: "El canal es va excavar el 1612, el mateix any que Galileu descobria les llunes de Júpiter. Ambdós símbols del dinamisme intel·lectual i comercial de la primera meitat del s.XVII.",
    magic: "La font Glico Running Man: el rètol del corredor de la marca Glico és el símbol d'Osaka des de 1935. La foto davant seu és el souvenir visual obligatori. De nit, el reflex dels colors al canal és hipnòtic.",
    family: "El millor lloc del viatge per al menjar de carrer: takoyaki (200 iens), taiyaki, yakitori, croquetes de miso. Per als nens, els rètols gegants de crancs i pops són espectaculars. Per als iaios, hi ha terrasses al costat del canal on seure còmodament. Anar de nit és imprescindible."
  },
  yasaka_namba: {
    location: "Al carreró Hozen-ji Yokocho, al barri de Namba, Osaka. A 2 minuts de Dotonbori.",
    what: "Petit temple budista del s.XVII completament amagat en un carreró estret de Namba. La figura central, Fudo Myo-o, està coberta de molsa verda intensa per les peticions d'ajuda dels visitants que hi llancen aigua. El carreró al seu voltant, Hozen-ji Yokocho, és un carrer de restaurants tradicionals japonesos petit i encantador.",
    history: "Fundat el 1637, el temple ha sobreviscut als bombardejos de 1945 i al creixement urbà d'Osaka per la seva escala microscòpica. La molsa de la figura creix des de fa segles per les ofrenes d'aigua dels fidels — la molsa viva és considerada senyal que el déu escolta.",
    europe: "1637, el same any que Descartes publicava el Discurs del Mètode. La racionalitat europea naixia mentre al Japó continuaven beneint figures amb molsa en carrerons ocults.",
    magic: "Llanceu una cullerada d'aigua a la figura de pedra coberta de molsa i demaneu un desig. La molsa és tan verda i espessa que sembla artificial — però és completament real i viva. El contrast entre el temple minúscul i el caos de Namba a 50 metres és el Japó en una sola imatge.",
    family: "Un secret que la majoria de turistes no troben. Per als iaios, és un descans tranquil a 2 minuts del Dotonbori frenètic. Per als adolescents, el carreró de restaurants al costat és perfecte per sopar. Per als nens, tirar aigua a la figura és un joc senzill amb un toc de misteri."
  },
  osaka_castle: {
    location: "Al districte de Chuo, Osaka, dins d'un parc de 106 hectàrees al centre de la ciutat.",
    what: "El castell de Toyotomi Hideyoshi, el guerrer que va unificar el Japó el s.XVI. La torre principal (tenshu) de 8 pisos és un museu sobre la història del castell i de la unificació del Japó. Des del cim hi ha vistes panoràmiques d'Osaka. Els jardins que l'envolten són espectaculars, especialment a la primavera.",
    history: "Construït el 1583 per Toyotomi Hideyoshi com a síbol del seu poder absolut sobre el Japó. Era el castell més gran del Japó de l'època. Destruït en la batalla de 1615 quan els Tokugawa van derrotar el fill de Hideyoshi. Reconstruït pels Tokugawa el 1629, cremat el 1868, reconstruït en formigó el 1931, restaurat el 1997.",
    europe: "El castell original es va construir el 1583, el mateix any que Guillem d'Orange era assassinat als Països Baixos i mentre Felip II d'Espanya preparava l'Armada Invencible. Una època de grans conflictes polítics i militars a tot el món.",
    magic: "El mur de pedra de l'entrada principal (Ote-mon): les pedres gegants, algunes de 130 tones, van ser transportades de tot el Japó per mar i a mà. La logística del s.XVI per moure-les és un misteri que els enginyers moderns admiren.",
    family: "El museu intern és molt bé explicat en anglès. Per als nens, el Denjiro Kids Science al parc al costat (si obert). Per als iaios, els jardins de les flors (Nishinomaru) són perfectes per caminar tranquil·lament. Vista dels fogocs artificials d'estiu si coincidiu."
  },
  shinsekai: {
    location: "Al districte de Naniwa, Osaka, al voltant de la Torre Tsutenkaku. A uns 10 minuts en metro des de Namba.",
    what: "Barri dels anys 50 que va quedar atrapat en el temps. La Torre Tsutenkaku (103m) presideix el barri com un far retro. Els carrers estan plens de restaurants de kushikatsu (broquetes de carn i verdures arrebossades), salles de pachinko, anuncis nostàlgics i l'ambient de barri treballador d'Osaka. La mascota Billiken (déu de la sort) és per tot arreu.",
    history: "Construït el 1912 inspirant-se en dos barris: els Camps Elisis de París (la torre) i Coney Island de Nova York (les atraccions). Va ser un parc d'atraccions fins als anys 40, quan els bombardejos el van destruir. El barri de postguerra va sorgir espontàniament i mai es va 'renovar' com la resta d'Osaka — casualment preservant un ambient únic.",
    europe: "El 1912, quan es va construir Shinsekai, l'Titànic s'enfonsava a l'Atlàntic i a Europa s'encenien els motors que portarien a la Primera Guerra Mundial. Un moment de fi de l'era victoriana i inici de la modernitat.",
    magic: "La regla del kushikatsu: no tornar a mullar la broqueta al bol de salsa una vegada ja l'heu mossegada. Hi ha cartells per tot arreu recordant-ho. Si ho feu, el cuiner us mirarà amb desaprovació total. La regla és sagrada a Osaka.",
    family: "Un dels barris més autèntics i assequibles del viatge. Per als iaios, l'ambient és tranquil i el menjar barat. Per als adolescents, les salles de jocs retro i les màquines de gashapon (càpsules-joguina). Per als nens, la mascota Billiken i les broquetes de pols de pop (ikayaki). Molt divertit i econòmic."
  },
  amerikamura: {
    location: "Al districte de Chuo, Osaka, al voltant de Triangle Park (Mitsu Koen). A 10 minuts a peu de Namba.",
    what: "El barri alternatiu d'Osaka, sorgit als anys 70 com a mercat de roba vintage americana importada de segona mà. Avui és un laberint de carrerons amb botigues de moda streetwear, galeries d'art graffiti, DJ sets al carrer, street food de fusió i una energia creativa constant. Triangle Park és el punt de trobada de la cultura underground d'Osaka.",
    history: "El 1970 un jove empresari d'Osaka va tenir la idea d'importar roba i discos de segona mà dels EUA per vendre-la als joves japonesos. El negoci va prosperar i va atreure centenars d'imitadors fins a crear el barri. Poc a poc va evolucionar de mercat de roba a centre de la contracultura japonesa.",
    europe: "Amerika-mura va néixer el 1970, l'any de la mort de Janis Joplin i Jimi Hendrix i just després de Woodstock. La contracultura americana creava ondades a tot el món, fins i tot a Osaka.",
    magic: "El 'Big Step': un centre comercial de cinc pisos on cada planta és un microunivers de cultura diferent — skateboard, música indie, tatuatges, galeria, cafè de vinils. Tot en un sol edifici que sembla fet de botigues de mercat.",
    family: "Per als adolescents és el millor lloc del viatge per explorar lliurement. Per als pares, hi ha cafès molt còmodes a Triangle Park on esperar. Per als iaios, millor combinar amb una visita a Namba i deixar als joves una hora lliure aquí. L'últim dia és perfecte per comprar roba i records únics."
  }
};const FOOD_INFO = {
  yakitori: {
    name:"Yakitori", emoji:"🍢", color:"#e67e22",
    what:"Broquetes de pollastre a la brasa sobre carbó de binchotan. 'Yaki' significa a la brasa, 'tori' és ocell. Cada part del pollastre es serveix per separat: pit (mune), cuixa (momo), pell (kawa), aleta (tebasaki), cor (hatsu) i fins i tot cartílag (nankotsu). Podeu demanar-les amb sal (shio) o amb salsa tare dolça.",
    how:"Es mengen directament de la broqueta, de peu o asseguts a la barra. No es tallen. Acompanyeu-les d'una cervesa japonesa (Sapporo, Kirin, Asahi) o d'un chu-hi (còctel de shochu).",
    context:"El yakitori va néixer als anys 50 a Tòquio com a menjar de treballadors als carrerons sota les vies del tren (yakitori alley, a Shimbashi). Avui és el menjar de barra per excel·lència dels japonesos adults.",
    family:"Als nens els agrada molt la versió amb salsa tare (dolça). Demaneu 'negima' (pollastre amb ceba) per als que no volen provatures. Per als adults, proveu el 'tsukune' (mandonguilla de pollastre) — és el favorit dels japonesos.",
    price:"Entre 150-300 iens per broqueta. Un sopar complet: 1.500-2.500 iens per persona."
  },
  chirashi: {
    name:"Chirashi don", emoji:"🐟", color:"#1976d2",
    what:"'Chirashi' significa 'escampat': un bol d'arròs d'avinagrat cobert amb una selecció de peix cru i marisc fresc tallat a trossos grans. Sol incloure tonyina (maguro), salmó (sake), daurada (tai), pop (tako), eriçó de mar (uni) i ous de salmó (ikura). Una presentació generosa i colorida.",
    how:"Mengeu amb bastonets (hashi). Poseu una mica de wasabi directament sobre el peix, no al bol de soja. El gengible encurtit (gari) entre peces neteja el paladar. No barregeu el peix i l'arròs — mengeu-los en proporció.",
    context:"El chirashi és la versió 'informal' del sushi: el cuiner no ha de fer peces individuals, pot mostrar la qualitat del peix amb més generositat i a menor preu. Als restaurants de mercat de peix és el plat estrella.",
    family:"Ideal per presentar el sashimi a qui no n'ha menjat mai: peix molt fresc, presentació atractiva i es pot triar cada peça. Per als nens, podeu demanar una versió sense peix cru (kaisen don amb marisc cuit) si cal.",
    price:"Entre 1.200-2.500 iens. Sol incloure sopa miso i encurtits."
  },
  sushi: {
    name:"Sushi", emoji:"🍣", color:"#c0392b",
    what:"Arròs d'avinagrat (shari) modelat a mà amb una peça de peix o marisc cru a sobre (nigiri). El sushi original de Tòquio (Edo-mae sushi) era menjar de carrer del s.XIX. La barra giratòria (kaiten-zushi) va ser inventada el 1958 a Osaka i democratitzà el sushi: els plats circulen en cinta i us n'agafeu els que voleu, pagant per plat.",
    how:"El nigiri es menja d'un sol mos (o dos), amb els dits o amb bastonets. Mojeu NOMÉS la punta del peix a la soja, no l'arròs (absorbeix massa i desequilibra el gust). El wasabi ja sol ser dins la peça — no n'afegiu més si no sabeu quant suporteu.",
    context:"El sushi de Tòquio (nigiri) és diferent del de Kyoto (oshi-zushi, premsat) i del d'Osaka (battera). A la barra giratòria, plats de colors diferents indiquen preus diferents: uns 100-180 iens el més barat, fins a 500+ el plat especial.",
    family:"La barra giratòria és perfecta per als nens: veuen el menjar, trien ells mateixos, és un joc. Per als que no mengen cru, hi ha opció de tamago (truita dolça), ebi (gamba cuita) i kappa maki (rotlle de cogombre). Per als iaios, el sushi de qualitat és digestiu i lleuger.",
    price:"Barra giratòria: 100-500 iens per plat. Compteu uns 1.500-2.500 iens per persona per sopar bé."
  },
  unagi: {
    name:"Unagi (Anguila a la brasa)", emoji:"🐍", color:"#8e24aa",
    what:"Anguila d'aigua dolça (unagi) a la brasa, laquejada amb salsa tare (soja, mirin i sucre) i servida sobre arròs en una caixa laquejada (una-ju) o en bol (una-don). La pell queda cruixent, la carn és grassa, suau i intensament saborosa. Un dels plats més apreciats i cars de la cuina japonesa.",
    how:"Mengeu l'anguila amb l'arròs en cada cullerada. La salsa tare que cau a l'arròs és la millor part. Alguns restaurants serveixen una mica de sansho (pebre japonès verd) per escampar a sobre — prova'l, és molt aromàtic.",
    context:"Menjar unagi a l'estiu és tradició japonesa des del s.XVIII — es creia que donava força per suportar la calor. El Dia de l'Anguila (Doyo no Ushi no Hi) a finals de juliol, els japonesos fan cua per hores als restaurants d'unagi. La preparació Kanto (Tòquio) cuina l'anguila al vapor primer i llavors a la brasa — molt més suau que la versió Kansai (Kyoto-Osaka) que va directament a la brasa.",
    family:"Ideal per a adults i iaios — és un plat de celebració, car però memorable. Els nens sovint l'estimen molt per la salsa dolça. Compte: és car (2.500-5.000 iens) però val molt la pena un cop a la vida.",
    price:"2.500-5.000 iens per persona. Un dels àpats més cars del viatge, però és un clàssic."
  },
  curry: {
    name:"Curri japonès", emoji:"🍛", color:"#f57c00",
    what:"El curri japonès (kare raisu) no té res a veure amb el curri indi o tailandès. És una salsa espessa, suau i lleugerament dolça feta amb una barreja de curri en bloc (s'allarga com mantequilla), servida sobre arròs blanc amb una chuleta (katsu), pollastre o verdures. La textura és com un guisat espès d'un marró daurat.",
    how:"Barregeu la salsa de curri amb l'arròs poc a poc. Si hi ha katsu (cotxinets arrebossats) a sobre, talleu-lo amb la cullera. Demaneu 'karasa' (picant) si voleu versió picant — el normal és quasi sense picant, perfecte per als nens.",
    context:"El curri va arribar al Japó de la mà dels britànics al s.XIX, que l'havien importat de l'Índia. Els japonesos el van adaptar completament fins a fer-ne un plat 100% nacional. Avui és un dels tres plats favorits dels japonesos, al costat del ramen i el sushi. Cada família té la seva recepta secreta.",
    family:"EL menjar per excel·lència dels nens japonesos. Quasi tots els nens creixent menjant kare raisu a casa. Dolç, suau, reconfortant. Per als adults, versió amb katsu (cotxinets) o hamburguesa japonesa (hambagu). Els iaios el troben familiar perquè s'assembla a un guisat occidental.",
    price:"700-1.200 iens. Un dels menjaars més assequibles i satisfactoris del viatge."
  },
  soba: {
    name:"Soba", emoji:"🍜", color:"#5d4037",
    what:"Fideus prims de fajol (blat sarraí) servits freds amb una salsa de mirin i soja per mullar (zaru soba) o en un caldo calent i profund (kake soba). La soba freda és especialment refrescant a l'estiu japonès. La qualitat es nota en el gust de fajol i la textura elàstica dels fideus.",
    how:"La soba freda (zaru soba) ve en un plat de bambú. Agafeu uns quants fideus amb bastonets, mulleu-los a la salsa de soja i mengeu. Podeu afegir ceba tendra picada, wasabi i salsa de soja diluïda. Al final, el cambrer porta el 'sobayu' (l'aigua de cocció) per barrejar amb la salsa sobrant i beure-la — no la refuseu, és deliciosa.",
    context:"La soba té 400 anys d'història a Tòquio (Edo). Els japonesos mengen soba la nit de Cap d'Any (toshi-koshi soba) per tallar les desgràcies de l'any passat. A Tòquio, un bon restaurant de soba artesanal és tan respectat com un restaurant d'alta cuina.",
    family:"La soba freda és perfecta per als dies de calor intensa del juliol japonès. Per als nens que no volen mullar: demaneu kake soba (caldo calent). Per als iaios amb problemes digestius: la soba de fajol és fàcil de digerir. Opció sense gluten si és soba 100% fajol.",
    price:"800-1.500 iens. Econòmic i ràpid — perfecte per un dinar de dia ple."
  },
  okonomiyaki: {
    name:"Okonomiyaki", emoji:"🥞", color:"#1976d2",
    what:"'Okonomi' significa 'el que vulguis', 'yaki' és a la planxa. Una espècie de coca o pizza japonesa feta amb massa de farina, col ratllada, ous i el farcit que trieu (porc, gambes, pop, formatge...). Es cuina a la planxa a la vostra taula, es gira amb espàtules i es cobreix de salsa okonomiyaki (com una Worcestershire dolça), maionesa japonesa i katsuobushi (flocs de tonyina fumada que es mouen amb la calor).",
    how:"A Osaka, el cuiner el prepara tot i us el porta fet. A Hiroshima, la versió porta fideus yakisoba dintre. Si el feu vosaltres, barregeu la massa amb el farcit, poseu-la a la planxa en forma rodona, deixeu coure 4-5 minuts, gireu-lo amb cura (dos espàtules!) i deixeu coure l'altre costat. Cobriu amb les salses al final.",
    context:"L'okonomiyaki és l'ànima de la cuina d'Osaka i Hiroshima. Va néixer als anys 30 com a menjar barat i nutritiu. Durant la Segona Guerra Mundial, quan hi havia escassetat, les mares el feien amb el que hi havia: col, farina i molt poc més. Avui és el símbol de la cuina 'soul food' del Japó.",
    family:"Un dels millors experiments culinaris de la família: cuineu el vostre propi a la taula! Els nens adoren participar en el gir i decoració. Per als iaios, la versió sense gambes o mariscs es pot demanar fàcilment. La salsa maionesa Kewpie japonesa és diferent de l'europea — molt més suau i cremosa.",
    price:"900-1.500 iens per persona. Molt satisfactori i econòmic."
  },
  tonkatsu: {
    name:"Tonkatsu", emoji:"🍱", color:"#e67e22",
    what:"Cotxineta de porc (llom o costella) empanada amb panko (pa ratllat japonès molt gruixut i cruixent) i fregida a 170°C fins quedar daurada i creixent per fora, juicy per dins. Es serveix tallada en llesques sobre arròs, amb col ratllada fina i una bol de salsa tonkatsu (espessa, dolça i lleugerament picant).",
    how:"Serviu-vos de la salsa tonkatsu a un bol petit i mulleu cada llesca. La col ratllada és un acompanyament fonamental — refrescant i absorbeix la grassa. Podeu picar grans de sèsam al morter de pedra (suri-bachi) que us porten — el sèsam trinxat barrejat amb la salsa és excepcional.",
    context:"El tonkatsu va arribar al Japó al s.XIX amb la influència western de l'era Meiji (com els 'yoshoku', menjars occidentalitzats). Va ser tan adoptat que avui és 100% japonès. El restaurant Ponta de Tòquio el serveix des de 1905. La paraula 'katsu' també significa 'guanyar' — per això els estudiants mengen tonkatsu abans dels exàmens per porta sort.",
    family:"Un dels plats més universals del viatge: agraden als nens (com unes nuggets gegants creixents), als iaios (carn tendra), i als adults (qualitat del porc japonès és excepcional). Demaneu 'hire katsu' (llom) per una versió més lleugera, o 'rosu katsu' (costella) per la versió més grassa i saborosa.",
    price:"1.200-2.000 iens. Preus molt raonables per la qualitat."
  },
  kaisen_don: {
    name:"Kaisen don", emoji:"🍣", color:"#1976d2",
    what:"Un bol (don) d'arròs d'avinagrat cobert amb una selecció generosa de marisc i peix fresc cru: normalment tonyina, salmó, daurada, eriçó de mar, gambes crues, vieira i ous de salmó. Menys formal que el chirashi, més abundant i de gust intens. El marisc es talla en trossos grans i s'apila sobre l'arròs fins a depassar-lo.",
    how:"Mengeu barrejant lleugerament l'arròs amb el marisc. Poseu wasabi directament sobre el peix si en voleu. El gengible encurtit (gari) rosa al costat és per refrescar el paladar entre peces de peix diferent. Mengeu ràpid — el peix fresc és millor fred.",
    context:"El kaisen don és especialment popular a les zones de mercat de peix i ports. A Kyoto, lluny del mar, la qualitat del peix fresc és una sorpresa agradable — arriba en camions refrigerats cada matinada del mercat de Tsukiji (Tòquio) o Nishiki (Kyoto).",
    family:"Similar al chirashi però en bol i amb porcions més generoses. Per als primers cops amb sashimi, és una bona introducció. Els nens que no volen cru: demaneu una versió amb ebi (gamba bullida) i tamago (truita). Per als adults, busqueu la versió amb uni (eriçó de mar) — si és temporada és exquisit.",
    price:"1.500-2.500 iens a Kyoto. Econòmic per la qualitat."
  },
  obanzai: {
    name:"Obanzai · Cuina tradicional de Kyoto", emoji:"🌿", color:"#2e7d32",
    what:"'Obanzai' és la cuina domèstica tradicional de Kyoto: una selecció de petits plats de temporada presentats en bols i plats de ceràmica. Sol incloure tofu en diverses textures, verdures encurtides (tsukemono), au bullida (nishime), ous de dashi, alga wakame, i bolets estofats. La cuina de Kyoto (kaiseki i obanzai) és coneguda mundalment per la seva refinada subtilitat i el respecte pel producte.",
    how:"A diferència d'un sol plat, l'obanzai es menja en petites quantitats de cada bol, alternant sabors. No hi ha ordre fix. El dashi (brou de bonítol i algues konbu) és la base de quasi tot — notareu un gust umami profund i net en cada plat.",
    context:"L'obanzai va néixer com la cuina de les cases dels artesans i comerciants de Kyoto durant el període Edo. No és cuina de temple (shojin ryori) ni cuina d'elit (kaiseki), sinó el menjar de cada dia de la gent de Kyoto. La tradició de menysprear el malbaratament (mottainai) i usar cada part del producte és central en aquesta cuina.",
    family:"Ideal per descobrir la cuina japonesa més autèntica i sana. Per als nens, el tofu suau (silken tofu) amb salsa de soja i gingebre sol agradar. Per als iaios, és una cuina lleugeríssima i molt digestiva. El tofu de Kyoto (Kyoto tofu) és radicalment diferent del que coneixeu a Europa — cremós, fresc i saborós.",
    price:"1.500-2.500 iens per una selecció completa d'obanzai."
  },
  izakaya: {
    name:"Izakaya · Taverna japonesa", emoji:"🍶", color:"#8e24aa",
    what:"L'izakaya és la taverna japonesa per excel·lència: un lloc per beure (sake, shochu, cervesa, chu-hi) i menjar plats petits en companyia. El menú és enorme i variat: edamame, karaage (pollastre fregit), yakitori, agedashi tofu, hiyayakko (tofu fred), sashimi, okonomiyaki, onigiri... La idea és demanar molts plats i compartir-los tots.",
    how:"En arribar us portaran un oshibori (tovalló calent humit) per netejar-vos les mans. Sol haver-hi un primer plat automàtic (otoshi) que es cobra a part (200-400 iens) — és normal, no és un error. Demaneu sake 'o-kan' (calent) a l'hivern i 'hiya' (fred) a l'estiu. Crideu 'sumimasen!' per cridar el cambrer.",
    context:"Les izakayas existeixen al Japó des del s.XVIII. El concepte és similar a les tapes espanyoles o als pintxos bascos: molts plats petits per compartir mentre beieu. Les 'standing bars' (tachinomi) on es menja de peu son les mes econòmiques. Les izakayas de cadena (Watami, Torikizoku) son bones i molt assequibles.",
    family:"Perfecte per a sopars de grup — es pot demanar de tot i cadascú tria. Per als nens, el karaage (pollastre fregit) i el edamame son els favorits universals. Per als iaios, l'ambient és animat però no fosc. Per als adults, és la millor manera de tastar molts plats japonesos en una sola nit.",
    price:"1.500-3.000 iens per persona amb begudes. Molt flexible."
  },
  yakiniku: {
    name:"Yakiniku · Barbacoa japonesa", emoji:"🥩", color:"#c0392b",
    what:"'Yaki' (a la brasa) + 'niku' (carn). Una barbacoa a la vostra pròpia taula amb una xarxa de ferro o planxa de ferro calenta. Porteu una selecció de talls fins de carn de vedella (wagyu o importada): karubi (costella), rosu (llom), tanchon (llengua), harami (diafragma)... A diferència del coreà, no hi ha marinar prèvi — la qualitat de la carn parla sola.",
    how:"Poseu la carn a la xarxa quan sigui ben calenta. Cada peça prima triga 30-60 segons per cara — no la sobrepasseu. Mengeu amb una mica de salsa de soja i sèsam (tare), o simplement amb sal i llimona. El wagyu (vedella japonesa) es menja quasi cru per dins — 'medium rare' és el màxim.",
    context:"El yakiniku va arribar al Japó amb la comunitat coreana al s.XX i es va japonesitzar completament. El wagyu japonès (de les races Kuroge Washu, com la famosa vedella de Kobe o de Matsusaka) és considerat la millor vedella del món per la seva marmolejat de grassa intramuscular (shimofuri) que li dona una textura i sabor únics.",
    family:"Un sopar de celebració memorable. L'experiència de cuinar a la taula és molt familiar i divertida. Per als nens, les peces fines es fan molt ràpid i agraden molt. Per als iaios, el yakiniku pot ser car però és un dels sopars més especials del viatge. Atenció: la roba queda impregnada de fum — normal!",
    price:"3.000-6.000 iens per persona. Un dels sopars més cars, però és un moment especial."
  },
  ramen: {
    name:"Ramen", emoji:"🍜", color:"#e67e22",
    what:"Sopa de brou profund amb fideus de blat (ramen), carn de porc (chashu), ou marinat (ajitsuke tamago), bambú fermentat (menma), ceba tendra i fulles d'alga nori. Hi ha quatre grans estils: shoyu (soja, Tòquio), miso (pasta de soia, Sapporo), shio (sal, suau i clar), tonkotsu (os de porc, Fukuoka — cremós i potent).",
    how:"Mengeu ràpid — el ramen es refreda i els fideus s'estoven. Sorbes fort (és educació, no mala educació) per refredar els fideus i potenciar el gust. Podeu demanar 'kaedama' (un extra de fideus al mateix brou) quan acabeu els fideus si teniu gana. No queda raret demanar-ho.",
    context:"El ramen va arribar de la Xina però els japonesos el van transformar radicalment des del s.XX. Cada regió del Japó té el seu estil. Hi ha guies Michelin dedicades exclusivament al ramen. Les cues davant dels millors restaurants de ramen a Tòquio poden arribar a 2 hores.",
    family:"Un dels plats favorits de tothom. Per als nens, el shoyu (soja) és el més suau. Per als iaios, el shio (sal) és el més lleuger. Per als adults que volen intensitat, el tonkotsu de Hakata és únic. Els japonesos el mengen a qualsevol hora — és perfecte per sopar tard.",
    price:"800-1.500 iens. Excel·lent qualitat-preu, un dels millors del viatge."
  },
  bento: {
    name:"Ekiben · Bento de tren", emoji:"🍱", color:"#2e7d32",
    what:"'Eki' és estació de tren, 'ben' és bento. Els ekiben són les caixes de menjar de les estacions japoneses, una institució de 130 anys d'antiguitat. Cada estació important té el seu ekiben exclusiu amb productes locals: a Tòquio vendran tonyina i salmó, a Kyoto tofu i carn de Wagyu, a Hiroshima ostres... Es venen a les botigues de l'estació o als carros que passen pels vagons.",
    how:"Compreu-lo a les botigues de l'estació (NewDays, Gransta, Kiosco) abans de pujar. Alguns venen fins 5 minuts abans de sortir el tren. Obriu-lo un cop asseguts. Normalment inclou arròs, proteïna, verdures encurtides i un dolç petit. Mengeu amb els bastonets de fusta que vénen dins.",
    context:"El primer ekiben de la història es va vendre el 1885 a l'estació de Utsunomiya: dos onigiri (boles d'arròs) i encurtits en paper de bambú per 5 rins. Avui hi ha més de 3.000 tipus d'ekiben a tot el Japó. Hi ha botigues especialitzades a les grans estacions que venen ekibens de tot el país. Hi ha fins i tot col·leccionistes de caixes buides.",
    family:"Un dels moments més japonesos del viatge: menjar el bento mirant el paisatge passar a 300 km/h. Per als nens, escollir el seu propi bento a la botiga de l'estació és tot un ritual. Per als iaios, molts benten inclouen menjar suau i ben equilibrat. La caixa de plàstic o fusta és un record perfecte.",
    price:"800-2.000 iens. Un dels àpats més memorables i assequibles."
  },
  takoyaki: {
    name:"Takoyaki", emoji:"🐙", color:"#8e24aa",
    what:"Boletes de massa farcides de trossets de polp (tako), encurtit de gengible, ceba tendra i flocs de bonítol, cuites en un motlle especial de ferro amb cavitats semiesfèriques. La part exterior queda lleugument cruixent, l'interior és cremós i calent. S'emboliquen amb salsa okonomiyaki, maionesa Kewpie i katsuobushi per sobre.",
    how:"Es mengen calentíssimes directament del pal de fusta. ATENCIÓ: l'interior pot cremar molt — mossegueu-les per la meitat i bufeu. El katsuobushi (flocs de bonítol) es mou tot sol amb la calor — és normal, no és que estiguin vius! Mengeu-les de dos o tres en quan encara fumen.",
    context:"El takoyaki va ser inventat el 1935 a Osaka per Tomekichi Endo, que es va inspirar en un plat similar de cloïsses de la regió de Akashi. Osaka és la capital indiscutible del takoyaki — cada família d'Osaka té un ferro de takoyaki a casa i el fa els caps de setmana. Menjats al peu del paral, al carrer de nit, amb la cridòria del Dotonbori al voltant: perfecte.",
    family:"El menjar de carrer preferit dels nens japonesos — i dels adults. La demostració de cuinar-los als carrers de Dotonbori és un espectacle en si mateix: el cuiner fa girar 12 boletes alhora amb un pal de metall. Per als iaios, cuidado amb la temperatura — espereu 2 minuts! Per als adolescents, el repte és menjar-les sense que us caigui la maionesa.",
    price:"6 unitats per 500-700 iens. L'aperitiu perfecte de carrer."
  },
  kushikatsu: {
    name:"Kushikatsu", emoji:"🍢", color:"#ff5722",
    what:"Broquetes de carn, verdures o marisc empanats amb panko i fregits en oli lleuger. A diferència del tonkatsu (carn sola), el kushikatsu és diversitat en broqueta: podeu menjar ceba, pebrot, camamilla de Kyoto, gamba, carn de vedella, queso, plàtan fregit... Tot en una sola cua. La salsa per mullar és compartida — d'aquí la famosa regla.",
    how:"LA REGLA SAGRADA DE SHINSEKAI: no torneu a mullar la broqueta a la salsa compartida un cop l'heu mossegada. Hi ha cartells per tot arreu recordant-ho. Si voleu més salsa, useu el tros de col que us porten (és el 'culler' oficial) per agafar salsa del bol. Si ho incompliu, el cuiner us mirarà amb desaprovació total — i ho diuen seriosament.",
    context:"El kushikatsu va néixer als anys 20 a Shinsekai, Osaka, com a menjar barat i ràpid per als treballadors de les fàbriques. La regla de no mullar dos cops va néixer per higiene: un sol bol de salsa compartit per tota la barra. Avui Shinsekai és el barri del kushikatsu i hi ha desenes de restaurants especialitzats.",
    family:"Un dels sopars més divertits del viatge: la varietat és enorme i la regla de la salsa crea una anècdota que tots recordareu. Per als nens, les broquetes de formatge, patata i pebrot son les favorites. Per als iaios, podeu demanar broquetes suaus (tofu, verdura). Per als adolescents, el repte és trobar les combinacions més insòlites.",
    price:"100-300 iens per broqueta. Un sopar complet: 1.500-2.500 iens."
  },
  matcha: {
    name:"Te matcha i dolços wagashi", emoji:"🍵", color:"#2e7d32",
    what:"El matcha (抹茶) és te verd en pols d'alta qualitat, dissolt en aigua calenta amb un batidor de bambú (chasen) fins crear una mousse espumosa amarga i intensa. Servit amb un wagashi (dolç japonès tradicional de pasta de mongeta o mochi) per equilibrar l'amargor. Uji, prop de Kyoto, produeix el millor matcha del Japó des del s.XII.",
    how:"A la cerimònia del te, el matcha es bat amb el chasen en moviments de 'W' (no cercles) fins que apareix una capa d'escuma fina. Abans de beure, gireu la tassa dos cops cap a la dreta per no tocar la 'cara' de la tassa (la part més bella). Mengeu el wagashi ABANS del te, no al revés.",
    context:"La cerimònia del te (chadō o sadō) va ser codificada al s.XVI pel mestre Sen no Rikyū, que va convertir el simple acte de preparar i beure te en una filosofia de vida basada en quatre principis: harmonia (wa), respecte (kei), puresa (sei) i tranquil·litat (jaku). Cada gest té un significat.",
    family:"Una experiència cultural única que impacta a tothom. Per als iaios, el ritual lent i pausat és molt relaxant. Per als adolescents, la filosofia darrere és fascinant. Per als nens, el wagashi (dolç) és la seva part favorita. Molts llocs de Uji ofereixen experiències de 30 minuts per a famílies sense coneixements previs.",
    price:"800-2.000 iens per una cerimònia senzilla amb wagashi."
  },
};const EXPERIENCE_INFO = {
  shinkansen_exp: {
    name:"Viatge en Shinkansen", emoji:"🚄", color:"#1976d2",
    what:"El Shinkansen (新幹線, 'nova via principal') és el tren d'alta velocitat japonès, operat per JR Group. El trajecet Tòquio-Kyoto dura uns 2h 15 min a una velocitat màxima de 285 km/h. Els trens surten cada 10-15 minuts i arriben amb una puntualitat mitjana de 36 SEGONS de retard anual.",
    how:"Pujar al tren és fàcil: el vostre vagó i seient estan marcats al terra de l'andana. Les portes s'obren exactament on és marcat. No hi ha excés d'equipatge però intenteu que les maletes entrin al portaequipatge de sobre. El silenci és total: sense trucades, parlar fluix. Mengeu l'ekiben sense soroll.",
    context:"El primer Shinkansen va circular el 1964 entre Tòquio i Osaka, just a temps per als Jocs Olímpics de Tòquio — un símbol del renaixement del Japó. Va ser el primer tren d'alta velocitat del món. Avui la xarxa cobreix quasi tot el Japó i ha transportat més de 10.000 milions de passatgers sense cap víctima mortal per accident.",
    family:"La vista del Mont Fuji pel costat dret (anant de Tòquio a Kyoto) entre les estacions de Shin-Fuji i Shin-Yokohama, si el cel és clar. Poseu-vos al costat dret! Per als nens, l'acceleració en sortir l'estació és impressionant. Per als iaios, els seients inclinables son còmodes per a 2 hores. Silenci total — important per als nens.",
    price:"Inclòs al JR Pass o ~14.000 iens per persona. L'experiència val molt la pena."
  },
  karaoke_exp: {
    name:"Karaoke japonès", emoji:"🎤", color:"#e91e63",
    what:"El karaoke japonès res té a veure amb el que coneixeu. A Japó es fa en sales privades (karaoke box) per a grups: us tanqueu en una sala equipada amb milers de cançons en totes les idiomes, micròfons professionals, sistema de so potent, projector amb lletra i pantalla de menú per demanar begudes sense sortir. Podeu cantar tant o tan malament com vulgueu: ningú us jutja.",
    how:"Demanar una sala (normalment per hores). El preu inclou begudes il·limitades (nomihodai) en molts locals. Useu el tablet per cercar cançons (hi ha milers en català, espanyol, anglès, japonès...). Podeu demanar menjar també. El timbre crida el cambrer. Quan s'acaba el temps, us avisen 5 minuts abans.",
    context:"El karaoke va ser inventat el 1971 a Kobe pel músic Daisuke Inoue, que va crear una màquina per a un club de jazz. No va patentar la invenció i perdé milions, però va guanyar el Premi Ig Nobel de la Pau el 2004. Avui hi ha més de 100.000 sales de karaoke al Japó. Big Echo, Karaoke-kan i Joysound son les cadenes principals.",
    family:"Una de les millors experiències del viatge per a totes les edats. Els adolescents ho consideraran el millor moment. Per als iaios, les cançons antigues en japonès son una sorpresa. Per als nens, cantar Doraemon o Pokémon en japonès és màgic. El grup sencer en una sala privada: cap vergonya, totes les generacions cantant juntes.",
    price:"300-600 iens per hora per persona + begudes. 2 hores per a 7 persones: uns 5.000-8.000 iens."
  },
  kabuki_exp: {
    name:"Teatre Kabuki", emoji:"🎭", color:"#1976d2",
    what:"El kabuki (歌舞伎) és una de les arts escèniques tradicionals del Japó, declarada Patrimoni Immaterial de la Humanitat per la UNESCO. Els actors (tots homes, fins i tot els papers femenins — onnagata) porten maquillatge extravagant (kumadori) en colors vermell, negre i blau, vestuaris pesants de seda, perruques imponents i es mouen i parlen en un estil altament codificat. La música en directe (nagauta) acompanya tota l'obra.",
    how:"Podeu comprar entrades per a un sol acte (hitomaku-mi) al taquillerat del dia per 1.000-2.500 iens — entre 45 i 60 minuts, perfecte per a una primera experiència. Llogueu un audioguia en anglès/japonès (500 iens) que explica l'acció en temps real. El hanamichi (passadís elevat entre el públic) és on passen les escenes més dramàtiques — intenteu seure a la platea per veure-ho.",
    context:"El kabuki va néixer el 1603 a Kyoto quan una actriu, Izumo no Okuni, va crear un estil de teatre provocador i popular. El govern Tokugawa va prohibir les dones en escena el 1629 per 'immoralitat' i des d'aleshores els homes fan tots els papers. Els actors kabuki vénen de famílies dinàstiques que porten el mateix nom artístic durant generacions.",
    family:"Per als iaios i adults: una experiència cultural única que no oblidaran. Per als adolescents: el maquillatge i les lluites escèniques (tachimawari) son espectaculars. Per als nens petits: millor limitar a un acte curt (45 min) i escollir una escena d'acció, no un drama lent. L'audioguia és essencial — sense ell és difícil seguir l'acció.",
    price:"Hitomaku-mi (un acte): 1.000-2.500 iens. Entrada completa: 4.000-20.000 iens."
  },
  gion_matsuri_exp: {
    name:"Gion Matsuri · Festival", emoji:"🎏", color:"#c0392b",
    what:"El Gion Matsuri és el festival de l'estiu més important del Japó, celebrat durant tot el mes de juliol al santuari Yasaka de Kyoto. El punt àlgid és la desfilada Yamaboko Junko del 17 de juliol: 23 enormes carrosses (yamaboko) de fins a 25 metres d'alçada i 12 tones, decorades amb tapisseries medievals d'arreu del món, tirades a mà per grups de desenes d'homes amb cordes de cotó.",
    how:"Posicioneu-vos al carrer Shijo a les 9h per veure el pas de les primeres carrosses. La desfilada dura unes 2-3 hores. Porteu para-sol, ventall i molta aigua — serà la part més calenta del viatge. Les nits anteriors (yoiyama, 15-16 juliol) els carrers de Gion s'omplen de llanternes i parades de menjar de carrer — molt recomanable.",
    context:"El Gion Matsuri va néixer l'any 869 dC com a ritual (goryōe) per apaivagar els esperits causants d'una epidèmia de pesta que assolava el Japó. Les 66 llances que es van plantar al llit del riu Shinsen-en representen les 66 províncies del Japó de l'època. S'ha celebrat ininterrompudament durant 1.155 anys, excepte durant la guerra civil Ōnin (1467-1477).",
    family:"Un dels moments més impressionants de tota la vida per a tothom. Les carrosses que fan tremolar el terra en passar, els músics a sobre tocant la melodia conchiki-chon, la multitud de japonesos vestits de yukata... Per als nens: les carrosses gegants que s'han de girar (el 'tsuji-mawashi', gir a 90 graus a mà) son un espectacle fascinant. Arribeu ben aviat per a un lloc a primera fila.",
    price:"Gratuït per veure la desfilada des del carrer. Tribunes de pagament: 3.000-5.000 iens."
  },
  deer_feeding: {
    name:"Donar menjar als cèrvols de Nara", emoji:"🦌", color:"#2e7d32",
    what:"Els cèrvols sika (Cervus nippon) del parc de Nara han après al llarg de segles a interactuar amb els humans per aconseguir les galetes shika senbei que venen els quioscs del parc. Molts s'inclinen (com fent una reverència) quan veuen les galetes — un comportament après per imitació dels humans que els estudis confirmen que es transmet culturalment de mares a cries.",
    how:"Compreu les galetes shika senbei (200 iens per un paquet) als quioscs de bambú pel parc. Mostreu la galeta al cèrvol i espereu que s'inclini — no és garantit però passa sovint. No guardeu el paper a la butxaca visible: els cèrvols l'intentaran agafar. Si us envolta un grup, esmicoleu les galetes i tireu-les lluny per dispersar-los.",
    context:"Els cèrvols de Nara son considerats sagrats (shika) des de fa 1.300 anys, messatgers del déu Takemikazuchi del santuari Kasuga Taisha. Fins al 1637 matar un cèrvol era castigat amb la mort. El 1957 van ser declarats Tresor Natural Nacional del Japó. Avui son tan valents que de vegades mosseguen bosses o roba — es tracten amb respecte però son animals salvatges.",
    family:"El moment preferit dels nens de tot el viatge — garantit. El moment de la reverència és màgic i sorprenent per a tothom. Per als iaios, els cèrvols s'acosten a persones assegudes als bancs tranquil·lament. ATENCIÓ: els cèrvols poden empènyer o arranyar si s'impacient — els nens molt petits millor amb un adult al costat. Les banyades (als mascles de tardor) son impressionants.",
    price:"Galetes shika senbei: 200 iens. Imprescindible."
  },
  onsen_sento: {
    name:"Banys públics japonesos (Sentō)", emoji:"♨️", color:"#e07b39",
    what:"El sentō (銭湯) és el bany públic tradicional japonès: una piscina d'aigua calenta (entre 40-43°C) compartida, separada per sexes, on els japonesos van per relaxar-se, socialitzar i netejar-se. L'onsen (温泉) és el mateix però amb aigua mineral natural de fonts termals volcàniques. La diferència és l'origen de l'aigua, no el ritual.",
    how:"Entreu per la porta del vostre sexe. Deixeu la roba al caseller. Dutxeu-vos a FONS asseguts als taburets baixos ABANS d'entrar a la piscina (és obligatori i higiènic). Entreu lentament a l'aigua calenta. No submergiu la tovallola a l'aigua. El silenci és valorat. Hidrateu-vos molt després — l'aigua calenta deshidrata.",
    context:"La cultura del bany japonesa té 1.300 anys d'antiguitat i és central a la vida social. El bany és un acte purificador en la tradició xintoista (misogi). Els sentō van aparèixer al s.VII per a la gent que no tenia bany a casa. Avui, tot i que tothom en té, molts japonesos prefereixen anar al sentō pel ritual i la calor específica de l'aigua.",
    family:"Una experiència cultural 100% japonesa molt recomanable. Separat per sexes (homes i dones per separat, fins i tot pares i fills petits). Per als iaios, l'aigua calenta és molt terapèutica. Per als adolescents, superar la vergonya inicial és una experiència de creixement. Important: molts onsen no admeten persones amb tatuatges (política tradicional japonesa).",
    price:"Sentō: 500-700 iens. Onsen de qualitat: 1.000-3.000 iens."
  },
};const FOOD_IMAGES = {
  yakitori:      "https://www.closetcooking.com/wp-content/uploads/2013/08/Yakitori3.jpg",
  chirashi:      "https://seafoodportal.se/wp-content/uploads/2021/03/chirashi-sushi-bowl.jpg",
  sushi:         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sushi_platter.jpg/1280px-Sushi_platter.jpg",
  unagi:         "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Unadon.jpg/1280px-Unadon.jpg",
  curry:         "https://www.recipetineats.com/wp-content/uploads/2023/10/Katsu-Curry_5.jpg",
  soba:          "https://chefjacooks.com/wp-content/uploads/2022/07/Zaru-Soba-Japanese-Cold-Soba-Noodles_2.jpg",
  okonomiyaki:   "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Okonomiyaki_being_made.jpg/1280px-Okonomiyaki_being_made.jpg",
  tonkatsu:      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Tonkatsu_closeup.jpg/1280px-Tonkatsu_closeup.jpg",
  ramen:         "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Ramen_at_Menya_Itto%2C_Tokyo%2C_2021.jpg/1280px-Ramen_at_Menya_Itto%2C_Tokyo%2C_2021.jpg",
  takoyaki:      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Takoyaki_by_jetalone_in_Osaka%2C_Japan.jpg/1280px-Takoyaki_by_jetalone_in_Osaka%2C_Japan.jpg",
  kushikatsu:    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Kushikatsu.jpg/1280px-Kushikatsu.jpg",
  matcha:        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_green_tea.JPG/1280px-A_small_cup_of_green_tea.JPG",
  izakaya:       "https://tokyocheapo.com/wp-content/uploads/2018/04/Izakaya-tokyo.jpg",
  yakiniku:      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Korean_barbecue.jpg/1280px-Korean_barbecue.jpg",
  obanzai:       "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Obanzai.jpg/1280px-Obanzai.jpg",
  kaisen_don:    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Kaisen-don.jpg/1280px-Kaisen-don.jpg",
  bento:         "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ekiben_bento_sold_at_train_stations.jpg/1280px-Ekiben_bento_sold_at_train_stations.jpg",
  // experiences
  shinkansen_exp:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/700series0.jpg/1280px-700series0.jpg",
  karaoke_exp:   "https://travelpockets.com/wp-content/uploads/2019/09/karaoke-japan.jpg",
  kabuki_exp:    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Kabukiza_Theatre_1.jpg/1280px-Kabukiza_Theatre_1.jpg",
  gion_matsuri_exp: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Gion_Festival%2C_Kyoto%2C_Japan.jpg/1280px-Gion_Festival%2C_Kyoto%2C_Japan.jpg",
  deer_feeding:  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Deer_in_Nara%2C_Japan_IMG_0712_2.jpg/1280px-Deer_in_Nara%2C_Japan_IMG_0712_2.jpg",
  onsen_sento:   "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Onsenjapan.jpg/1280px-Onsenjapan.jpg",
};const STAMPS = [
  // --- TÒQUIO ---
  { id:"sensoji",        city:"Tòquio",  name:"Senso-ji",           kanji:"浅草寺",  emoji:"⛩️",  shape:"torii",   color:"#c0392b", coords:[35.7148,139.7967], day:1 },
  { id:"nakamise",       city:"Tòquio",  name:"Nakamise",           kanji:"仲見世",  emoji:"🛍️",  shape:"diamond", color:"#e67e22", coords:[35.7145,139.7960], day:1 },
  { id:"meiji",          city:"Tòquio",  name:"Meiji Jingu",        kanji:"明治神宮", emoji:"🌿",  shape:"circle",  color:"#2e7d32", coords:[35.6763,139.6993], day:2 },
  { id:"harajuku",       city:"Tòquio",  name:"Harajuku",           kanji:"原宿",    emoji:"🎀",  shape:"star",    color:"#e91e63", coords:[35.6702,139.7026], day:2 },
  { id:"shinjuku_view",  city:"Tòquio",  name:"Mirador Shinjuku",   kanji:"新宿",    emoji:"🏙️",  shape:"hexagon", color:"#1976d2", coords:[35.6896,139.6917], day:2 },
  { id:"imperial",       city:"Tòquio",  name:"Palau Imperial",     kanji:"皇居",    emoji:"🏯",  shape:"castle",  color:"#5d4037", coords:[35.6852,139.7528], day:3 },
  { id:"akihabara",      city:"Tòquio",  name:"Akihabara",          kanji:"秋葉原",  emoji:"🕹️",  shape:"bolt",    color:"#ff5722", coords:[35.7023,139.7745], day:3 },
  { id:"hamarikyu",      city:"Tòquio",  name:"Hamarikyu",          kanji:"浜離宮",  emoji:"🌸",  shape:"flower",  color:"#c2185b", coords:[35.6601,139.7629], day:4 },
  { id:"tokyo_tower",    city:"Tòquio",  name:"Torre Tòquio",       kanji:"東京タワー",emoji:"🗼",shape:"tower",   color:"#e53935", coords:[35.6586,139.7454], day:4 },
  { id:"shibuya",        city:"Tòquio",  name:"Shibuya Crossing",   kanji:"渋谷",    emoji:"🚶",  shape:"circle",  color:"#ff5722", coords:[35.6595,139.7004], day:4 },
  { id:"ueno",           city:"Tòquio",  name:"Ueno Park",          kanji:"上野",    emoji:"🦢",  shape:"leaf",    color:"#388e3c", coords:[35.7146,139.7744], day:5 },
  { id:"nezu",           city:"Tòquio",  name:"Nezu Shrine",        kanji:"根津神社", emoji:"⛩️",  shape:"torii",   color:"#7b1fa2", coords:[35.7209,139.7621], day:5 },
  { id:"kabuki",         city:"Tòquio",  name:"Kabuki-za",          kanji:"歌舞伎座", emoji:"🎭",  shape:"fan",     color:"#1565c0", coords:[35.6695,139.7647], day:5 },

  // --- KYOTO ---
  { id:"gion",           city:"Kyoto",   name:"Gion",               kanji:"祇園",    emoji:"🏮",  shape:"lantern", color:"#c0392b", coords:[35.0036,135.7781], day:6 },
  { id:"kinkakuji",      city:"Kyoto",   name:"Kinkaku-ji",         kanji:"金閣寺",  emoji:"🥇",  shape:"star",    color:"#c9a84c", coords:[35.0394,135.7292], day:7 },
  { id:"myoshinji",      city:"Kyoto",   name:"Myoshin-ji",         kanji:"妙心寺",  emoji:"🧘",  shape:"circle",  color:"#5d4037", coords:[35.0258,135.7220], day:7 },
  { id:"honganji",       city:"Kyoto",   name:"Hongan-ji",          kanji:"本願寺",  emoji:"🕌",  shape:"hexagon", color:"#7b1fa2", coords:[34.9913,135.7508], day:8 },
  { id:"nintendo",       city:"Kyoto",   name:"Museu Nintendo",     kanji:"任天堂",  emoji:"🎮",  shape:"bolt",    color:"#e91e63", coords:[34.9440,135.7990], day:8 },
  { id:"byodoin",        city:"Kyoto",   name:"Byōdō-in",           kanji:"平等院",  emoji:"🍵",  shape:"diamond", color:"#c9a84c", coords:[34.8893,135.8077], day:8 },
  { id:"gion_matsuri",   city:"Kyoto",   name:"Gion Matsuri",       kanji:"祇園祭",  emoji:"🎏",  shape:"fan",     color:"#c0392b", coords:[35.0029,135.7683], day:9 },
  { id:"nijojo",         city:"Kyoto",   name:"Nijo-jo",            kanji:"二条城",  emoji:"🏯",  shape:"castle",  color:"#795548", coords:[35.0142,135.7482], day:9 },
  { id:"kiyomizudera",   city:"Kyoto",   name:"Kiyomizudera",       kanji:"清水寺",  emoji:"🏔️",  shape:"torii",   color:"#6a1b9a", coords:[34.9948,135.7850], day:9 },
  { id:"ginkakuji",      city:"Kyoto",   name:"Ginkaku-ji",         kanji:"銀閣寺",  emoji:"🥈",  shape:"circle",  color:"#546e7a", coords:[35.0270,135.7982], day:10 },
  { id:"philosophers_path",city:"Kyoto", name:"Camí del Filòsof",   kanji:"哲学の道", emoji:"🌿",  shape:"leaf",    color:"#2e7d32", coords:[35.0195,135.7934], day:10 },
  { id:"heian",          city:"Kyoto",   name:"Heian Jingu",        kanji:"平安神宮", emoji:"⛩️",  shape:"torii",   color:"#c62828", coords:[35.0160,135.7820], day:10 },
  { id:"nara_park",      city:"Kyoto",   name:"Nara Park",          kanji:"奈良公園", emoji:"🦌",  shape:"deer",    color:"#558b2f", coords:[34.6851,135.8376], day:11 },
  { id:"todaiji",        city:"Kyoto",   name:"Todai-ji",           kanji:"東大寺",  emoji:"🛕",  shape:"hexagon", color:"#4527a0", coords:[34.6887,135.8398], day:11 },
  { id:"arashiyama",     city:"Kyoto",   name:"Arashiyama",         kanji:"嵐山",    emoji:"🎋",  shape:"bamboo",  color:"#33691e", coords:[35.0170,135.6727], day:12 },
  { id:"tenryuji",       city:"Kyoto",   name:"Tenryu-ji",          kanji:"天龍寺",  emoji:"🌊",  shape:"wave",    color:"#0277bd", coords:[35.0165,135.6748], day:12 },
  { id:"fushimi",        city:"Kyoto",   name:"Fushimi Inari",      kanji:"伏見稲荷", emoji:"⛩️",  shape:"torii",   color:"#b71c1c", coords:[34.9671,135.7727], day:13 },
  { id:"sanjusangendo",  city:"Kyoto",   name:"Sanjusangendo",      kanji:"三十三間堂",emoji:"🙏", shape:"fan",     color:"#4a148c", coords:[34.9882,135.7739], day:13 },

  // --- OSAKA ---
  { id:"dotonbori",      city:"Osaka",   name:"Dotonbori",          kanji:"道頓堀",  emoji:"🦀",  shape:"star",    color:"#e91e63", coords:[34.6687,135.5013], day:14 },
  { id:"yasaka_namba",   city:"Osaka",   name:"Hozen-ji",           kanji:"法善寺",  emoji:"🏮",  shape:"lantern", color:"#6a1b9a", coords:[34.6689,135.5028], day:14 },
  { id:"osaka_castle",   city:"Osaka",   name:"Castell d'Osaka",    kanji:"大阪城",  emoji:"🏯",  shape:"castle",  color:"#c0392b", coords:[34.6873,135.5259], day:15 },
  { id:"shinsekai",      city:"Osaka",   name:"Shinsekai",          kanji:"新世界",  emoji:"🗼",  shape:"tower",   color:"#ff5722", coords:[34.6524,135.5063], day:15 },
  { id:"amerikamura",    city:"Osaka",   name:"Amerika-mura",       kanji:"アメ村",  emoji:"🎨",  shape:"diamond", color:"#7b1fa2", coords:[34.6722,135.4983], day:16 },
];// Restaurant helper — each meal can have: name, emoji, eco, foodId, reserved, price, url, rating, note
const TRIP_DATA = [
  {
    city: "Tòquio", cityJp: "東京", cityDays: "9–13 juliol", color: "#0d1117", accent: "#e94560",
    days: [
      { day:1, date:"9 jul", title:"Arribada · Asakusa",
        notes:"SIM a l'aeroport · SUICA a Ueno · Check-in Asakusa",
        places:[
          {id:"sensoji",name:"Senso-ji",emoji:"⛩️",tag:"Temple",tagColor:"#8e24aa",coords:[35.7148,139.7967]},
          {id:"nakamise",name:"Nakamise Street",emoji:"🛍️",tag:"Carrer",tagColor:"#e67e22",coords:[35.7145,139.7960]},
        ],
        meal:{
          dinar:null,
          sopar:{name:"Konbini o Beerzilla",emoji:"🍢",eco:"eco",note:"Sopar informal prop de l'hotel. Opcional: cerveseta al Beerzilla després."}
        }},

      { day:2, date:"10 jul", title:"Meiji · Harajuku · Shinjuku · Kabukicho",
        notes:"Shinjuku Gyoen opcional a la tarda · Video mapping a les 19h davant l'Edifici Metropolità · Golden Gai per un beure",
        places:[
          {id:"meiji",name:"Santuari Meiji",emoji:"🌿",tag:"Santuari",tagColor:"#2e7d32",coords:[35.6763,139.6993]},
          {id:"harajuku",name:"Harajuku",emoji:"🎀",tag:"Cultura pop",tagColor:"#e91e63",coords:[35.6702,139.7026]},
          {id:"shinjuku_view",name:"Mirador Metropolità",emoji:"🏙️",tag:"Mirador",tagColor:"#1976d2",coords:[35.6896,139.6917]},
        ],
        meal:{
          dinar:{name:"Sushi omakase",emoji:"🍣",eco:"car",foodId:"sushi",reserved:true,price:"~3.800¥/cap",url:"https://maps.app.goo.gl/FeD4kT7cFAzbGqCH8",rating:"4.5",note:"RESERVAT · Omakase · Harajuku"},
          sopar:{name:"Robata & Oden · Kabukicho",emoji:"🔥",eco:"car",reserved:true,price:"~3.000¥/cap",url:"https://tabelog.com/en/tokyo/A1304/A130401/13268548/table/",rating:"4.2",note:"RESERVAT · Robata i oden · Shinjuku Kabukicho"}
        }},

      { day:3, date:"11 jul", title:"Senso-ji · Palau Imperial · Akihabara",
        notes:"Passeig riu Sumida a les 10:30 · Descans a l'hotel a les 14h",
        places:[
          {id:"sensoji",name:"Senso-ji",emoji:"⛩️",tag:"Temple",tagColor:"#8e24aa",coords:[35.7148,139.7967]},
          {id:"imperial",name:"Palau Imperial",emoji:"🏯",tag:"Patrimoni",tagColor:"#5d4037",coords:[35.6852,139.7528]},
          {id:"akihabara",name:"Akihabara",emoji:"🕹️",tag:"Cultura otaku",tagColor:"#ff5722",coords:[35.7023,139.7745]},
        ],
        meal:{
          dinar:{name:"Unagi · Ginza",emoji:"🐍",eco:"car",foodId:"unagi",reserved:true,price:"~3.500¥/cap",url:"https://maps.app.goo.gl/H5RpSUjsBG1CGuWg6",rating:"4.4",note:"RESERVAT · Anguila laquejada · Ginza"},
          sopar:{name:"Curri japonès",emoji:"🍛",eco:"eco",foodId:"curry",url:"https://maps.app.goo.gl/LQkYtSM5KQsZbdEK7",note:"Sense reserva · Econòmic"}
        }},

      { day:4, date:"12 jul", title:"Hamarikyu · Torre Tòquio · Shibuya",
        notes:"Azabudai Hills Sky Lobby per cafè i vistes · Shibuya Crossing a les 17h",
        places:[
          {id:"hamarikyu",name:"Jardins Hamarikyu",emoji:"🌸",tag:"Jardí",tagColor:"#2e7d32",coords:[35.6601,139.7629]},
          {id:"tokyo_tower",name:"Torre Tòquio + Zojo-ji",emoji:"🗼",tag:"Monument",tagColor:"#c0392b",coords:[35.6586,139.7454]},
          {id:"shibuya",name:"Shibuya Crossing",emoji:"🚶",tag:"Icònic",tagColor:"#ff5722",coords:[35.6595,139.7004]},
        ],
        meal:{
          dinar:{name:"Soba · Azabudai",emoji:"🍜",eco:"eco",foodId:"soba",reserved:true,url:"https://maps.app.goo.gl/9dNFGPuhx7fmbLv7A",rating:"4.3",note:"RESERVAT · Soba artesana · Azabudai"},
          sopar:{name:"Izakaya",emoji:"🍶",eco:"ok",foodId:"izakaya",reserved:true,url:"https://maps.app.goo.gl/TKVpNXSvcuAffVfQ7",rating:"4.1",note:"RESERVAT · Izakaya · Shibuya"}
        }},

      { day:5, date:"13 jul", title:"Ueno · Nezu · Kabuki · Ameyoko",
        notes:"Ameyoko a les 18:30 per compres i snacks",
        places:[
          {id:"ueno",name:"Ueno Park",emoji:"🦢",tag:"Parc",tagColor:"#2e7d32",coords:[35.7146,139.7744]},
          {id:"nezu",name:"Nezu Shrine",emoji:"⛩️",tag:"Santuari",tagColor:"#8e24aa",coords:[35.7209,139.7621]},
          {id:"kabuki",name:"Kabuki-za · Ginza",emoji:"🎭",tag:"Teatre",tagColor:"#1976d2",coords:[35.6695,139.7647]},
        ],
        meal:{
          dinar:{name:"Okonomiyaki",emoji:"🥞",eco:"ok",foodId:"okonomiyaki",reserved:true,price:"~2.000¥/cap",url:"https://maps.app.goo.gl/EWArTnugvMPP9Pgh6",rating:"4.2",note:"RESERVAT · Okonomiyaki · prop hotel"},
          sopar:{name:"Yakitori · Ueno",emoji:"🍢",eco:"ok",foodId:"yakitori",reserved:true,price:"~3.000¥/cap",url:"https://maps.app.goo.gl/LCrtZbAxcVGAC9EU9",rating:"4.3",note:"RESERVAT · Yakitori · Ueno"}
        },
        experiences:[{id:"kabuki_exp",name:"Espectacle Kabuki",emoji:"🎭"}]},
    ]
  },
  {
    city: "Kyoto", cityJp: "京都", cityDays: "14–21 juliol", color: "#100a00", accent: "#c9a84c",
    days: [
      { day:6, date:"14 jul", title:"Shinkansen · Gion · Higashiyama",
        notes:"Shinkansen matí · Bento al tren · Arabica% Coffee a Higashiyama · Taiyaki per Gion",
        places:[
          {id:"gion",name:"Gion · Higashiyama",emoji:"🏮",tag:"Barri geishas",tagColor:"#c0392b",coords:[35.0036,135.7781]},
          {id:"arabica",name:"% Arabica Coffee",emoji:"☕",tag:"Cafè",tagColor:"#5d4037",coords:[35.0027,135.7793]},
        ],
        meal:{
          dinar:{name:"Ekiben al Shinkansen",emoji:"🍱",eco:"eco",foodId:"bento",note:"Bento de l'estació · Experiència típica japonesa"},
          sopar:{name:"Kaisen don",emoji:"🍣",eco:"eco",foodId:"kaisen_don",reserved:true,url:"https://maps.app.goo.gl/WpvH4sQkBewZj8RG9",rating:"4.2",note:"RESERVAT 19:30 · Kaisen don · Gion"}
        },
        experiences:[{id:"shinkansen_exp",name:"Viatge Shinkansen",emoji:"🚄"}]},

      { day:7, date:"15 jul", title:"Kinkaku-ji · Myoshin-ji",
        notes:"Tarda lliure · Mercat Chion-ji fins les 15-16h (15 juliol)",
        places:[
          {id:"kinkakuji",name:"Kinkaku-ji",emoji:"🥇",tag:"Temple",tagColor:"#c9a84c",coords:[35.0394,135.7292]},
          {id:"myoshinji",name:"Myoshin-ji",emoji:"🧘",tag:"Temple zen",tagColor:"#5d4037",coords:[35.0258,135.7220]},
        ],
        meal:{
          dinar:{name:"Cuina occidental japonesa",emoji:"🍽️",eco:"eco",url:"https://maps.app.goo.gl/9m4hotFSTZS3RxiL9",note:"Sense reserva · Prop Kinkaku-ji"},
          sopar:{name:"Sushi barra giratòria",emoji:"🍣",eco:"ok",foodId:"sushi",url:"https://maps.app.goo.gl/4hkPVKR7EFJ1Qgc37",note:"Sense reserva · Kaiten-zushi"}
        }},

      { day:8, date:"16 jul", title:"Hongan-ji · Nintendo Museum · Uji",
        notes:"Nintendo: RESERVAT · Cerimònia del te Taihoan (3 pers.): RESERVAT · Byoudou-in i Uji per als altres",
        places:[
          {id:"honganji",name:"Nishi Hongan-ji",emoji:"🕌",tag:"Temple",tagColor:"#8e24aa",coords:[34.9913,135.7508]},
          {id:"nintendo",name:"Museu Nintendo",emoji:"🎮",tag:"Museu",tagColor:"#e91e63",coords:[34.9440,135.7990]},
          {id:"byodoin",name:"Byōdō-in · Uji",emoji:"🍵",tag:"Patrimoni UNESCO",tagColor:"#c9a84c",coords:[34.8893,135.8077]},
        ],
        meal:{
          dinar:{name:"Obanzai · Estació Kyoto",emoji:"🌿",eco:"ok",foodId:"obanzai",reserved:true,url:"https://maps.app.goo.gl/utQ3B568iqKYAPt18",rating:"4.4",note:"RESERVAT · Obanzai i tofu · Estació Kyoto"},
          sopar:{name:"Izakaya Ashioto",emoji:"🍶",eco:"ok",foodId:"izakaya",reserved:true,url:"https://maps.app.goo.gl/a3GPYePu8efHhJ8g8",rating:"4.3",note:"RESERVAT 20:30 · Izakaya · Shijo"}
        },
        experiences:[{id:"onsen_sento",name:"Cerimònia del te · Taihoan",emoji:"🍵",overrideId:"matcha"}]},

      { day:9, date:"17 jul", title:"🎏 Gion Matsuri · Nijo-jo · Kiyomizudera",
        notes:"Desfilada Yamaboko Junko al matí · Ninnenzaka i Sannenzaka a la tarda",
        places:[
          {id:"gion_matsuri",name:"Gion Matsuri",emoji:"🎏",tag:"Festival",tagColor:"#c0392b",coords:[35.0029,135.7683]},
          {id:"nijojo",name:"Palau Nijo-jo",emoji:"🏯",tag:"UNESCO",tagColor:"#5d4037",coords:[35.0142,135.7482]},
          {id:"kiyomizudera",name:"Kiyomizudera",emoji:"🏔️",tag:"Temple",tagColor:"#8e24aa",coords:[34.9948,135.7850]},
        ],
        meal:{
          dinar:{name:"Izakaya barra",emoji:"🍶",eco:"eco",foodId:"izakaya",url:"https://maps.app.goo.gl/8ZF9pNZxJDnud8LF7",note:"Sense reserva · Econòmic"},
          sopar:{name:"Yakiniku",emoji:"🥩",eco:"car",foodId:"yakiniku",url:"https://maps.app.goo.gl/7dCR8Pbushd93pLd7",note:"Sense reserva · Car · Higashiyama"}
        },
        experiences:[{id:"gion_matsuri_exp",name:"Festival Gion Matsuri",emoji:"🎏"}]},

      { day:10, date:"18 jul", title:"Ginkaku-ji · Philosopher's Path · Heian",
        notes:"Pícnic a Kamogawa possible per sopar · Tarda lliure compres",
        places:[
          {id:"ginkakuji",name:"Ginkaku-ji",emoji:"🥈",tag:"Temple",tagColor:"#607d8b",coords:[35.0270,135.7982]},
          {id:"philosophers_path",name:"Philosopher's Path",emoji:"🌿",tag:"Camí",tagColor:"#2e7d32",coords:[35.0195,135.7934]},
          {id:"heian",name:"Heian Jingu",emoji:"⛩️",tag:"Santuari",tagColor:"#c0392b",coords:[35.0160,135.7820]},
        ],
        meal:{
          dinar:{name:"Variat japonès o sushi",emoji:"🍣",eco:"eco",foodId:"sushi",url:"https://maps.app.goo.gl/LB9z9AA9p6zftWby5",note:"Sense reserva · Prop Ginkaku-ji"},
          sopar:{name:"Pícnic Kamogawa?",emoji:"🌙",eco:"eco",note:"Pla lliure · Pícnic al riu o restaurant local"}
        }},

      { day:11, date:"19 jul", title:"🦌 Excursió a Nara",
        notes:"Retorn a Kyoto a la tarda · Ramen Sugari per sopar si hi ha lloc",
        places:[
          {id:"nara_park",name:"Nara Park",emoji:"🦌",tag:"Parc",tagColor:"#2e7d32",coords:[34.6851,135.8376]},
          {id:"todaiji",name:"Todai-ji",emoji:"🛕",tag:"Temple",tagColor:"#8e24aa",coords:[34.6887,135.8398]},
        ],
        meal:{
          dinar:{name:"Okonomiyaki · Nara",emoji:"🥞",eco:"eco",foodId:"okonomiyaki",reserved:true,url:"https://maps.app.goo.gl/fSfq6fNKB2FAp7xEA",rating:"4.1",note:"RESERVAT · Okonomiyaki · Nara"},
          sopar:{name:"Ramen Sugari",emoji:"🍜",eco:"eco",foodId:"ramen",note:"Sense reserva · Econòmic · Kyoto"}
        },
        experiences:[{id:"deer_feeding",name:"Donar menjar als cèrvols",emoji:"🦌"}]},

      { day:12, date:"20 jul", title:"Arashiyama · Karaoke 🎤",
        notes:"Tenryu-ji i Nenbutsu-ji al matí · Karaoke al vespre",
        places:[
          {id:"arashiyama",name:"Bosc de bambú",emoji:"🎋",tag:"Natura",tagColor:"#2e7d32",coords:[35.0170,135.6727]},
          {id:"tenryuji",name:"Tenryu-ji",emoji:"🌊",tag:"Temple",tagColor:"#1976d2",coords:[35.0165,135.6748]},
          {id:"nenbutsuji",name:"Nenbutsu-ji",emoji:"🪨",tag:"Temple",tagColor:"#607d8b",coords:[35.0243,135.6636]},
        ],
        meal:{
          dinar:{name:"Arashiyama",emoji:"🌿",eco:"ok",url:"https://maps.app.goo.gl/jopd59ZinXFbzTAQA",note:"Sense reserva · Prop Tenryu-ji"},
          sopar:{name:"Izakaya Tamazushi",emoji:"🍶",eco:"ok",foodId:"izakaya",url:"https://maps.app.goo.gl/i5z8DEEzrqvtg8sx9",rating:"4.2",note:"Sense reserva · Izakaya · Kyoto"}
        },
        experiences:[{id:"karaoke_exp",name:"Karaoke nocturn",emoji:"🎤"}]},

      { day:13, date:"21 jul", title:"Fushimi Inari · Komyo-in · Sanjusangendo",
        notes:"Sortida 8:30 a Fushimi · Tou-ji mercat opcional a la tarda · Resta lliure",
        places:[
          {id:"fushimi",name:"Fushimi Inari Taisha",emoji:"⛩️",tag:"Santuari",tagColor:"#c0392b",coords:[34.9671,135.7727]},
          {id:"sanjusangendo",name:"Sanjusangendo",emoji:"🙏",tag:"Temple",tagColor:"#8e24aa",coords:[34.9882,135.7739]},
        ],
        meal:{
          dinar:{name:"Sushi",emoji:"🍣",eco:"car",foodId:"sushi",url:"https://maps.app.goo.gl/R5oxA88QqCgWLXg6A",rating:"4.5",note:"Sense reserva · Sushi · Car"},
          sopar:{name:"Lliure",emoji:"🌙",eco:null,note:"Resta lliure"}
        }},
    ]
  },
  {
    city: "Osaka", cityJp: "大阪", cityDays: "22–24 juliol", color: "#0d000d", accent: "#ff6b35",
    days: [
      { day:14, date:"22 jul", title:"Kyoto → Osaka · Dotonbori",
        notes:"Matí lliure a Kyoto · Check-out · Tren a Osaka · Yasaka Jinja (Namba)",
        places:[
          {id:"dotonbori",name:"Dotonbori",emoji:"🦀",tag:"Barri",tagColor:"#e91e63",coords:[34.6687,135.5013]},
          {id:"yasaka_namba",name:"Hozen-ji · Namba",emoji:"🏮",tag:"Temple",tagColor:"#8e24aa",coords:[34.6689,135.5028]},
        ],
        meal:{
          dinar:{name:"Dinar a Kyoto",emoji:"🍽️",eco:"ok",note:"Lliure · Últimes hores a Kyoto"},
          sopar:{name:"Dotonbori + cocktail",emoji:"🦀",eco:"ok",foodId:"takoyaki",note:"Sopar i còctel a Dotonbori · Lliure"}
        }},

      { day:15, date:"23 jul", title:"Castell d'Osaka · Shinsekai",
        notes:"Tarda lliure a Shinsekai · Passeig nocturn per la ciutat",
        places:[
          {id:"osaka_castle",name:"Castell d'Osaka",emoji:"🏯",tag:"Patrimoni",tagColor:"#c0392b",coords:[34.6873,135.5259]},
          {id:"shinsekai",name:"Shinsekai",emoji:"🗼",tag:"Barri retro",tagColor:"#ff5722",coords:[34.6524,135.5063]},
        ],
        meal:{
          dinar:{name:"Prop castell",emoji:"🏯",eco:"ok",note:"Lliure · Prop del castell"},
          sopar:{name:"Shinsekai · Lliure",emoji:"🍢",eco:"ok",foodId:"kushikatsu",note:"Kushikatsu o lliure a Shinsekai"}
        }},

      { day:16, date:"24 jul", title:"Amerika-mura · Vol ✈️ 23:45",
        notes:"Airbnb sense esmorzar · Vol Kansai (KIX) 23:45 · Formulari Visit Japan Web obligatori!",
        places:[
          {id:"amerikamura",name:"Amerika-mura",emoji:"🎨",tag:"Barri alt.",tagColor:"#9c27b0",coords:[34.6722,135.4983]},
        ],
        meal:{
          dinar:{name:"Últimes compres · Lliure",emoji:"🛍️",eco:null,note:"Pla lliure · Últim dia"},
          sopar:null
        }},
    ]
  }
];const CITY_COLORS={"Tòquio":"#e94560","Kyoto":"#c9a84c","Osaka":"#ff6b35"};
const ECO={eco:{l:"Econòmic",c:"#5a7d59"},ok:{l:"Preu ok",c:"#c9a84c"},car:{l:"Car",c:"#c0392b"}};


function tripDay(){
  var now=new Date(),s=new Date('2026-07-09'),e=new Date('2026-07-24');
  if(now<s)return{st:'before',left:Math.ceil((s-now)/86400000)};
  if(now>e)return{st:'after'};
  var n=Math.floor((now-s)/86400000)+1;
  var dd=null,cc=null;
  TRIP_DATA.forEach(function(c){c.days.forEach(function(d){if(d.day===n){dd=d;cc=c;}});});
  return{st:'during',n:n,day:dd,city:cc};
}

function stars(r){
  if(!r)return'';
  var n=parseFloat(r),f=Math.floor(n),h=n%1>=.5?'½':'';
  return '<span style="color:var(--go);font-size:10px">'+'★'.repeat(f)+h+'</span><span style="color:rgba(255,255,255,.4);font-size:10px"> '+r+'</span>';
}

// === LIVE TAB ===
async function renderLive(el){
  var tr=tripDay();
  var u=user||{name:'?',emoji:'👤'};
  var isV=role==='viewer';
  var body='';

  if(tr.st==='before'){
    body='<div style="background:linear-gradient(135deg,#1a0008,#2d0a1a);border-radius:16px;padding:24px;text-align:center;margin-bottom:16px;border:1px solid rgba(232,69,96,.2)"><div style="font-family:\'Noto Serif JP\',serif;font-size:48px;font-weight:700;color:#e94560;line-height:1">'+tr.left+'</div><div style="font-size:14px;color:rgba(255,255,255,.6);margin-top:6px">dies per al viatge 🌸</div><div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:4px">9 de juliol 2026</div></div>';
    body+='<div onclick="showPackingGuide()" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:18px;margin-bottom:12px;cursor:pointer;display:flex;align-items:center;gap:14px"><div style="font-size:34px">🧳</div><div style="flex:1"><div style="font-size:15px;font-weight:700;color:#fff">Preparació del viatge</div><div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:3px">Equipatge · Etiqueta · Frases útils</div></div><div style="font-size:18px;color:rgba(255,255,255,.2)">›</div></div>';
    if(isV)body+='<div style="background:var(--s1);border-radius:12px;padding:20px;border:1px solid var(--bd);text-align:center"><div style="font-size:32px;margin-bottom:10px">👴👵</div><div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:6px">Preparant el viatge</div><div style="font-size:12px;color:var(--mu);line-height:1.6">Quan el viatge comenci, veureu en temps real on són i les fotos que van penjant.</div></div>';
  }else if(tr.st==='after'){
    body='<div style="text-align:center;padding:40px 20px"><div style="font-size:40px;margin-bottom:12px">🌸</div><div style="font-family:\'Noto Serif JP\',serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:8px">Quin viatge!</div><div style="font-size:13px;color:var(--mu)">Aneu a Memòries per veure tots els records.</div></div>';
  }else if(tr.day){
    var ac=CITY_COLORS[tr.city.city];
    body+='<div onclick="openDay(\''+tr.city.city+'\','+tr.day.day+')" style="background:linear-gradient(135deg,'+tr.city.color+','+ac+'25);border-radius:16px;padding:22px;margin-bottom:16px;border:1px solid '+ac+'44;position:relative;overflow:hidden;cursor:pointer">';
    body+='<div style="position:absolute;right:-10px;top:-10px;font-family:\'Noto Serif JP\',serif;font-size:80px;color:rgba(255,255,255,.04);font-weight:700;pointer-events:none">'+tr.city.cityJp+'</div>';
    body+='<div style="font-size:10px;letter-spacing:3px;color:'+ac+';text-transform:uppercase;font-weight:700">Avui · Dia '+tr.n+' · '+tr.day.date+'</div>';
    body+='<div style="font-family:\'Noto Serif JP\',serif;font-size:'+(isV?'22':'18')+'px;font-weight:700;color:#fff;margin-top:6px;line-height:1.2">'+tr.day.title+'</div>';
    body+='<div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px"><div style="font-size:12px;color:rgba(255,255,255,.45)">'+tr.city.city+' · Japó</div><div id="twx" style="font-size:12px"></div></div>';
    if(isV){body+='<div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap">'+tr.day.places.map(function(p){return'<span style="font-size:11px;background:rgba(255,255,255,.08);padding:4px 10px;border-radius:20px;color:rgba(255,255,255,.6)">'+p.emoji+' '+p.name+'</span>';}).join('')+'</div>';}
    body+='<div style="margin-top:8px;font-size:11px;color:'+ac+'88">Toca per veure el dia →</div></div>';
    var all=TRIP_DATA.flatMap(function(c){return c.days.map(function(d){return{day:d.day,ac:CITY_COLORS[c.city]};});});
    body+='<div style="background:var(--s1);border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid var(--bd)"><div style="font-size:10px;letter-spacing:2px;color:var(--mu);text-transform:uppercase;margin-bottom:10px">Progrés · Dia '+tr.n+' de 16</div><div style="display:flex;align-items:center;gap:3px;flex-wrap:wrap">'+all.map(function(d){var done=d.day<tr.n,today=d.day===tr.n;return'<div style="width:'+(today?18:8)+'px;height:'+(today?18:8)+'px;border-radius:50%;background:'+(done?d.ac:today?d.ac:'rgba(255,255,255,.08)')+';flex-shrink:0;'+(today?'box-shadow:0 0 10px '+d.ac+'88':'')+'" ></div>';}).join('')+'</div></div>';
  }

  body+='<div style="margin-bottom:16px"><div style="font-size:10px;letter-spacing:3px;color:var(--mu);text-transform:uppercase;margin-bottom:12px">'+(isV?'📸 Últimes fotos i vídeos':'📸 Últim penjat')+'</div><div id="lgrid" class="pg"><div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--mu);font-size:11px">Carregant…</div></div></div>';

  if(isV){body+='<div style="background:linear-gradient(135deg,rgba(201,168,76,.08),rgba(192,57,43,.05));border:1px solid rgba(201,168,76,.2);border-radius:16px;padding:22px;text-align:center;margin-bottom:16px"><div style="font-size:32px;margin-bottom:10px">🧡</div><div style="font-family:\'Noto Serif JP\',serif;font-size:16px;font-weight:700;color:#fff;margin-bottom:8px">Els teniu al cor</div><div style="font-size:12px;color:rgba(255,255,255,.5);line-height:1.7">Cada foto que pengen és per a vosaltres.<br>Totes a <strong style="color:#fff">Memòries</strong>.</div></div>';}
  else if(tr.st==='during'&&tr.day){
    var pid=tr.day.places[0]?tr.day.places[0].id:'misc';
    body+='<div style="background:var(--s1);border-radius:12px;padding:16px;border:1px solid var(--bd)"><div style="font-size:11px;font-weight:700;color:#fff;margin-bottom:10px">📤 Penja una foto o vídeo ara</div><div class="dz" onclick="pick(\''+pid+'\')"><div style="font-size:28px;margin-bottom:6px">📸</div><div style="font-size:12px;color:rgba(255,255,255,.5)">Foto o vídeo d\'avui</div></div></div>';
  }

  el.innerHTML='<div style="background:linear-gradient(135deg,#0a0a14,#1a0808);padding:calc(var(--st)+52px) 20px 20px;position:sticky;top:0;z-index:30;border-bottom:1px solid var(--bd)"><div style="display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:10px;letter-spacing:3px;color:var(--mu);text-transform:uppercase">'+(isV?'Seguiment familiar':'En viu')+'</div><div style="font-family:\'Noto Serif JP\',serif;font-size:22px;font-weight:700;color:#fff;margin-top:2px">'+(isV?'❤️ Japó 2026':'📡 On som ara')+'</div></div><button onclick="showWelcome()" style="display:flex;align-items:center;gap:6px;background:var(--s1);border:1px solid var(--bd);border-radius:20px;padding:5px 12px;font-size:11px;cursor:pointer;color:#fff;font-family:\'Zen Kaku Gothic New\',sans-serif">'+u.emoji+' '+u.name+'</button></div></div><div style="padding:20px 20px 100px">'+body+'</div>';

  loadLiveM();
  if(online&&tr.st==='during'&&tr.day){
    getDW(tr.city.city,tr.day.date).then(function(w){var e=$('twx');if(e&&w)e.innerHTML=wBadge(w);});
  }
}

async function loadLiveM(){
  var grid=$('lgrid');if(!grid)return;
  var loc=[];
  STAMPS.forEach(function(s){localGet(s.id).forEach(function(p){loc.push(Object.assign({},p,{pid:s.id}));});});
  loc.sort(function(a,b){return(b.ts||0)-(a.ts||0);});
  if(loc.length)grid.innerHTML=mCells(loc.slice(0,9));
  if(!sb||!online){if(!loc.length)grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--mu);font-size:12px">'+(role==='viewer'?'Cap foto encara. Quan els viatgers en pengin, apareixeran aquí 🌸':'Cap foto encara!')+'</div>';return;}
  try{
    var d=await sb.storage.from(BUCKET).list('',{limit:60,sortBy:{column:'created_at',order:'desc'}});
    if(!d.data)return;
    var items=[];
    for(var i=0;i<Math.min(d.data.length,12);i++){
      var item=d.data[i];
      if(item.id){items.push({url:sb.storage.from(BUCKET).getPublicUrl(item.name).data.publicUrl,ts:new Date(item.created_at).getTime(),isVid:!!item.name.match(/\.(mp4|mov|webm)$/i)});}
      else{var f=await sb.storage.from(BUCKET).list(item.name,{limit:8,sortBy:{column:'created_at',order:'desc'}});(f.data||[]).forEach(function(ff){items.push({url:sb.storage.from(BUCKET).getPublicUrl(item.name+'/'+ff.name).data.publicUrl,pid:item.name,user:ff.name.split('_')[0],ts:new Date(ff.created_at).getTime(),isVid:!!ff.name.match(/\.(mp4|mov|webm)$/i)});});}
    }
    items.sort(function(a,b){return b.ts-a.ts;});liveCache=items;
    if(grid&&items.length)grid.innerHTML=mCells(items.slice(0,9));
    else if(!loc.length)grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--mu);font-size:12px">Cap foto encara 🌸</div>';
  }catch(e){}
}

function mCells(items){
  return items.map(function(p){
    var src=(p.url||p.dataUrl||'').replace(/'/g,'%27');
    var isV=p.isVid||p.isVideo||!!(p.url||'').match(/\.(mp4|mov|webm)$/i);
    var u=(p.user||p.uploader||'').replace(/'/g,'');
    var pn=(function(){var s=STAMPS.find(function(x){return x.id===p.pid;});return s?s.name:'';})().replace(/'/g,'');
    return '<div class="pt2" onclick="openLB(\''+src+'\','+isV+',\''+u+'\',\''+pn+'\')">'+(isV?'<video src="'+(p.url||p.dataUrl||'')+'" muted playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover"></video><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.3)"><div style="font-size:22px">▶️</div></div>':'<img src="'+(p.url||p.dataUrl||'')+'" loading="lazy" onerror="this.parentNode.style.display=\'none\'">')+(u?'<div style="position:absolute;bottom:3px;left:3px;font-size:8px;background:rgba(0,0,0,.65);padding:1px 5px;border-radius:3px;color:rgba(255,255,255,.8)">'+u+'</div>':'')+(pn?'<div style="position:absolute;top:3px;right:3px;font-size:7px;background:rgba(0,0,0,.65);padding:1px 4px;border-radius:3px;color:rgba(255,255,255,.6)">'+pn+'</div>':'')+'</div>';
  }).join('');
}


// === ITINERARY ===
function renderItinerary(el){
  var u=user,tr=tripDay();
  var tw='';
  if(tr.st==='before'){tw='<div style="margin:28px 20px 16px;background:linear-gradient(135deg,#1a0008,#2d0a1a);border-radius:12px;padding:18px 20px;border:1px solid rgba(232,69,96,.2)"><div style="font-family:\'Noto Serif JP\',serif;font-size:42px;font-weight:700;color:#e94560;line-height:1">'+tr.left+'</div><div style="font-size:13px;color:rgba(255,255,255,.5);margin-top:4px">dies per al viatge 🌸</div></div>';}
  else if(tr.st==='during'&&tr.day){var ac=CITY_COLORS[tr.city.city];tw='<div onclick="openDay(\''+tr.city.city+'\','+tr.day.day+')" style="margin:28px 20px 16px;background:linear-gradient(135deg,'+tr.city.color+','+ac+'18);border-radius:12px;padding:18px 20px;cursor:pointer;border:1px solid '+ac+'33;position:relative;overflow:hidden"><div style="position:absolute;right:-8px;top:-8px;font-family:\'Noto Serif JP\',serif;font-size:72px;color:rgba(255,255,255,.04);font-weight:700">'+tr.city.cityJp+'</div><div style="font-size:10px;letter-spacing:3px;color:'+ac+';text-transform:uppercase;font-weight:700">Avui · Dia '+tr.n+' · '+tr.day.date+'</div><div style="font-family:\'Noto Serif JP\',serif;font-size:18px;font-weight:700;color:#fff;margin-top:3px">'+tr.day.title+'</div><div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:4px">'+tr.city.city+' · Toca per veure el dia →</div></div>';}

  var cities=TRIP_DATA.map(function(c){
    var isO=openCity===c.city,ac=CITY_COLORS[c.city];
    var days=c.days.map(function(d){
      var res=[d.meal&&d.meal.dinar,d.meal&&d.meal.sopar].some(function(m){return m&&m.reserved;});
      var chips=d.places.map(function(p){return'<span style="font-size:9px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.38);padding:2px 6px;border-radius:4px">'+p.emoji+' '+p.name+'</span>';}).join(' ');
      return '<div onclick="openDay(\''+c.city+'\','+d.day+')" style="display:flex;gap:14px;align-items:flex-start;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer"><div style="flex-shrink:0;width:42px;height:42px;border-radius:50%;background:'+ac+'18;border:1.5px solid '+ac+'44;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-size:12px;font-weight:700;color:'+ac+'">'+d.day+'</div><div style="font-size:8px;color:rgba(255,255,255,.28)">'+d.date+'</div></div><div style="flex:1"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="font-size:13px;font-weight:700;color:#fff;line-height:1.3">'+d.title+'</div>'+(res?'<span style="font-size:8px;background:rgba(201,168,76,.2);color:var(--go);border:1px solid rgba(201,168,76,.3);padding:1px 5px;border-radius:8px;font-weight:700">📋 RESERVAT</span>':'')+'</div><div style="display:flex;gap:4px;margin-top:5px;flex-wrap:wrap">'+chips+'</div></div><div style="font-size:16px;color:rgba(255,255,255,.18);flex-shrink:0;padding-top:4px">›</div></div>';
    }).join('');
    return '<div style="margin-bottom:8px"><div onclick="toggleCity(\''+c.city+'\')" style="margin:0 20px;border-radius:12px;background:linear-gradient(135deg,'+c.color+','+ac+'1a);padding:18px 20px;cursor:pointer;border:1px solid '+ac+'33;position:relative;overflow:hidden"><div style="position:absolute;right:12px;top:8px;font-family:\'Noto Serif JP\',serif;font-size:50px;color:rgba(255,255,255,.05);font-weight:700">'+c.cityJp+'</div><div style="font-size:9px;letter-spacing:3px;color:'+ac+';text-transform:uppercase;font-weight:700;margin-bottom:3px">Parada '+(TRIP_DATA.indexOf(c)+1)+'</div><div style="font-family:\'Noto Serif JP\',serif;font-size:26px;font-weight:700;color:#fff">'+c.city+'</div><div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:2px">'+c.cityDays+' · '+c.days.length+' dies</div><div id="tog-'+c.city+'" style="position:absolute;right:20px;bottom:20px;font-size:14px;color:rgba(255,255,255,.2);transform:rotate('+(isO?180:0)+'deg);transition:transform .2s">▼</div></div><div id="cdays-'+c.city+'" style="display:'+(isO?'block':'none')+';padding:10px 20px 4px">'+days+'</div></div>';
  }).join('');

  var tips=[['📶','SIM a l\'aeroport','Nada arribar.'],['🃏','Targeta SUICA','Metro i autobusos.'],['💴','Efectiu sempre','Temples: cash.'],['🔇','Silenci al metro','Cap trucada.'],['💦','Hidratació','Konbini: eau. 35°C+.'],['🚯','No propines','Mai al Japó.'],['👥','2 grups','Un responsable per grup.'],['📋','Visit Japan Web','Formulari obligatori → vjw.digital.go.jp']].map(function(t){return'<div style="background:var(--s1);border-radius:10px;padding:13px 12px;border:1px solid var(--bd)"><div style="font-size:22px;margin-bottom:5px">'+t[0]+'</div><div style="font-size:11px;font-weight:700;margin-bottom:3px">'+t[1]+'</div><div style="font-size:10px;color:var(--mu);line-height:1.5">'+t[2]+'</div></div>';}).join('');

  el.innerHTML='<div style="height:100svh;min-height:560px;position:relative;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden"><img src="https://images.pexels.com/photos/5169056/pexels-photo-5169056.jpeg?auto=compress&cs=tinysrgb&w=800" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'"><div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.4) 50%,transparent 100%)"></div><div style="position:relative;z-index:2;padding:0 28px calc(40px + var(--sb))"><div style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--go);margin-bottom:10px">Itinerari familiar · Juliol 2026</div><div style="font-family:\'Noto Serif JP\',serif;font-size:22px;font-weight:300;letter-spacing:8px;color:#e8b4b8;margin-bottom:2px">日本へ</div><div style="font-family:\'Noto Serif JP\',serif;font-size:62px;font-weight:700;color:#fff;line-height:.9;letter-spacing:-2px;margin-bottom:8px">JAPÓ</div><div style="font-size:13px;color:rgba(255,255,255,.4);letter-spacing:1px;margin-bottom:20px">Tòquio · Kyoto · Osaka · 16 dies</div><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><div style="display:inline-flex;align-items:center;gap:8px;background:var(--re);color:#fff;font-size:11px;font-weight:700;letter-spacing:2px;padding:9px 18px;border-radius:2px">🌸 9–24 juliol 2026</div><button onclick="showWelcome()" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:5px 12px;font-size:11px;cursor:pointer;color:#fff;font-family:\'Zen Kaku Gothic New\',sans-serif">'+(u?u.emoji+' '+u.name:'👤 Qui ets tu?')+'</button></div></div></div>'+tw+cities+'<div style="padding:28px 20px 16px"><div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;margin-bottom:14px">Consells essencials</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+tips+'</div></div><div style="height:20px"></div>';
}

function toggleCity(name){
  openCity=openCity===name?null:name;
  var el=$('cdays-'+name),tog=$('tog-'+name);
  if(el)el.style.display=openCity===name?'block':'none';
  if(tog)tog.style.transform='rotate('+(openCity===name?180:0)+'deg)';
}

// === DAY PANEL ===
function openDay(cName,dayNum){
  var city=TRIP_DATA.find(function(c){return c.city===cName;});
  var day=city&&city.days.find(function(d){return d.day===dayNum;});
  if(!city||!day)return;
  var ac=CITY_COLORS[city.city];

  var ph=day.places.map(function(p){return'<div onclick="openPlace(\''+p.id+'\')" class="card tap" style="padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:14px;border:1px solid rgba(255,255,255,.06)"><div style="font-size:30px;flex-shrink:0">'+p.emoji+'</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#fff">'+p.name+'</div><div style="margin-top:5px"><span class="tag" style="background:'+p.tagColor+'33;color:'+p.tagColor+'">'+p.tag+'</span></div></div><div style="font-size:18px;color:rgba(255,255,255,.15)">›</div></div>';}).join('');

  var eh=(day.experiences||[]).map(function(exp){var img=FOOD_IMAGES[exp.overrideId||exp.id]||'';var fid=exp.overrideId||exp.id;return'<div onclick="openFood(\''+fid+'\')" class="card tap" style="margin-bottom:10px;overflow:hidden">'+(img?'<div style="height:90px;position:relative;overflow:hidden"><img src="'+img+'" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.style.display=\'none\'"><div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(13,13,18,.88),transparent)"></div><div style="position:absolute;bottom:8px;left:14px;font-size:14px;font-weight:700;color:#fff">'+exp.emoji+' '+exp.name+'</div></div>':'<div style="padding:12px 14px;font-size:14px;font-weight:700;color:#fff">'+exp.emoji+' '+exp.name+'</div>')+'<div style="padding:6px 14px 10px"><div style="font-size:9px;color:'+ac+';font-weight:700">📖 Guia completa</div></div></div>';}).join('');

  var mh=(function(){
    var ms=[day.meal&&day.meal.dinar&&['Dinar',day.meal.dinar],day.meal&&day.meal.sopar&&['Sopar',day.meal.sopar]].filter(Boolean);
    if(!ms.length)return'';
    var cards=ms.map(function(ml){
      var lbl=ml[0],m=ml[1];
      var img=m.foodId&&FOOD_IMAGES[m.foodId];
      var res=!!m.reserved;
      return'<div '+(m.foodId?'onclick="openFood(\''+m.foodId+'\')" class="card tap"':'class="card"')+' style="flex:1;overflow:hidden;border:1px solid '+(res?'rgba(201,168,76,.25)':'rgba(255,255,255,.06)')+'">'+
        (img?'<div style="height:65px;overflow:hidden;position:relative"><img src="'+img+'" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.style.display=\'none\'"><div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(13,13,18,.8),transparent)"></div>'+(res?'<div style="position:absolute;top:5px;right:5px;background:var(--go);color:#000;font-size:8px;font-weight:700;padding:2px 6px;border-radius:10px">RESERVAT</div>':'')+'</div>':'')+
        '<div style="padding:8px 10px 11px"><div style="font-size:9px;color:rgba(255,255,255,.3);letter-spacing:1px;text-transform:uppercase">'+lbl+'</div><div style="font-size:13px;margin:3px 0">'+m.emoji+'</div><div style="font-size:11px;font-weight:700;color:#fff;line-height:1.3">'+m.name+'</div>'+
        (m.price?'<div style="font-size:10px;color:var(--go);margin-top:2px">'+m.price+'</div>':'')+
        (m.eco&&ECO[m.eco]?'<div style="font-size:9px;color:'+ECO[m.eco].c+'">'+ECO[m.eco].l+'</div>':'')+
        (m.rating?'<div style="margin-top:3px">'+stars(m.rating)+'</div>':'')+
        (m.note?'<div style="font-size:9px;color:rgba(255,255,255,.38);margin-top:4px;line-height:1.4">'+m.note+'</div>':'')+
        (m.url?'<a href="'+m.url+'" target="_blank" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:3px;font-size:9px;font-weight:700;color:#a0c4ff;background:rgba(160,196,255,.1);border:1px solid rgba(160,196,255,.2);border-radius:6px;padding:3px 8px;text-decoration:none;margin-top:5px">🗺️ Maps</a>':'')+
        '</div></div>';
    }).join('');
    return'<div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;margin-top:24px;margin-bottom:12px">🍽️ Àpats del dia</div><div style="display:flex;gap:10px">'+cards+'</div>';
  })();

  var notes=day.notes?'<div style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:10px;padding:10px 14px;margin-bottom:20px;display:flex;gap:10px"><div style="font-size:14px;flex-shrink:0">📋</div><div style="font-size:11px;color:rgba(255,255,255,.6);line-height:1.6">'+day.notes+'</div></div>':'';

  $('md').innerHTML='<div class="mb" onclick="if(event.target===this)closeModal()"><div class="ms"><div class="mh"><div class="mhb"></div></div><div style="padding:12px 20px 0;flex-shrink:0"><button onclick="closeModal()" style="background:var(--s1);border:none;border-radius:8px;padding:6px 14px;color:var(--mu);font-size:12px;cursor:pointer;margin-bottom:12px;font-family:\'Zen Kaku Gothic New\',sans-serif">← Tornar</button><div style="font-size:10px;letter-spacing:3px;color:'+ac+';text-transform:uppercase;font-weight:700">Dia '+day.day+' · '+day.date+'</div><div style="font-family:\'Noto Serif JP\',serif;font-size:20px;font-weight:700;color:#fff;margin-top:3px">'+day.title+'</div><div style="display:flex;align-items:center;justify-content:space-between;margin-top:2px"><div style="font-size:11px;color:rgba(255,255,255,.35)">'+city.city+'</div><div id="dwx" style="font-size:11px;color:rgba(255,255,255,.5)"></div></div></div><div class="msc"><div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;margin-bottom:12px">Llocs del dia</div>'+notes+ph+(eh?'<div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;margin-top:24px;margin-bottom:12px">Experiències</div>'+eh:'')+mh+'</div></div></div>';

  if(online){getDW(city.city,day.date).then(function(w){var e=$('dwx');if(e&&w)e.innerHTML=wBadge(w);});}
}

// === PLACE MODAL ===
function openPlace(pid){
  var info=OFFLINE_INFO[pid];
  var pd=null;
  TRIP_DATA.forEach(function(c){c.days.forEach(function(d){d.places.forEach(function(p){if(p.id===pid)pd=p;});});});
  if(!pd&&!info)return;
  var ac=pd&&pd.tagColor||'#c0392b';
  var secs=info?[{i:'📍',l:'On és',t:info.location},{i:'🏛️',l:'Què és',t:info.what},{i:'📖',l:'Història',t:info.history},{i:'🌍',l:'En perspectiva europea',t:info.europe},{i:'⭐',l:'El moment màgic',t:info.magic},{i:'👨‍👩‍👧',l:'Per a la familia',t:info.family}].filter(function(s){return s.t;}):[];
  var coords=pd&&pd.coords||[35,135];
  var lat=coords[0],lng=coords[1];
  var local=localGet(pid);

  var infoHtml=secs.map(function(s){return'<div class="ib" style="--ac:'+ac+'66"><div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.9);margin-bottom:5px">'+s.i+' '+s.l+'</div><div style="font-size:12px;color:rgba(255,255,255,.62);line-height:1.65">'+s.t+'</div></div>';}).join('');

  var localHtml=local.map(function(p){var src=(p.dataUrl||p.url||'').replace(/'/g,'%27');var fn=(p.fname||'').replace(/'/g,'');var u=(p.user||'').replace(/'/g,'');return'<div class="pt2"><div onclick="openLB(\''+src+'\','+(p.isVid?'true':'false')+',\''+u+'\',\'\')" style="position:absolute;inset:0"><img src="'+(p.dataUrl||p.url||'')+'" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.parentNode.style.display=\'none\'"></div><div style="position:absolute;bottom:3px;left:3px;font-size:8px;background:rgba(0,0,0,.65);padding:1px 5px;border-radius:3px;color:rgba(255,255,255,.8)">'+u+'</div><button onclick="deletePhoto(this,\''+fn+'\',\''+pid+'\')" style="position:absolute;top:4px;right:4px;background:rgba(192,57,43,.85);border:none;border-radius:50%;width:22px;height:22px;color:#fff;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:700;z-index:10">✕</button></div>';}).join('');

  $('md').innerHTML='<div class="mb" onclick="if(event.target===this)closeModal()"><div class="ms"><div class="mh"><div class="mhb"></div></div><div style="padding:12px 20px 0;flex-shrink:0"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div style="font-size:34px;margin-bottom:5px">'+(pd&&pd.emoji||'📍')+'</div><div style="font-family:\'Noto Serif JP\',serif;font-size:20px;font-weight:700;color:#fff">'+(pd&&pd.name||pid)+'</div>'+(pd&&pd.tag?'<span class="tag" style="background:'+ac+'33;color:'+ac+';display:inline-block;margin-top:6px">'+pd.tag+'</span>':'')+'</div><button onclick="closeModal()" style="background:var(--s1);border:none;border-radius:50%;width:34px;height:34px;color:var(--mu);font-size:16px;cursor:pointer;margin-left:12px;flex-shrink:0">✕</button></div><div class="mtb"><button class="mt on" onclick="mtab(this,\'pi-'+pid+'\')">📖 Info</button>'+(pd&&pd.coords?'<button class="mt" onclick="mtab(this,\'pm-'+pid+'\')">🗺️ Mapa</button>':'')+'<button class="mt" onclick="mtab(this,\'pp-'+pid+'\');loadPP(\''+pid+'\')">📸 Fotos</button></div></div><div class="msc"><div id="pi-'+pid+'">'+infoHtml+'</div>'+(pd&&pd.coords?'<div id="pm-'+pid+'" style="display:none"><div style="background:var(--s1);border-radius:10px;padding:14px;border:1px solid var(--bd);margin-bottom:10px"><div style="font-size:10px;color:var(--mu);margin-bottom:4px">Coordenades</div><div style="font-size:13px;font-weight:700;color:#fff;font-family:monospace">'+lat.toFixed(5)+', '+lng.toFixed(5)+'</div><div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><a href="https://maps.apple.com/?q='+lat+','+lng+'" target="_blank" style="font-size:10px;color:#a0c4ff;text-decoration:none">📍 Apple Maps</a><a href="https://www.google.com/maps?q='+lat+','+lng+'" target="_blank" style="font-size:10px;color:#a0c4ff;text-decoration:none">Google Maps</a></div></div></div>':'')+'<div id="pp-'+pid+'" style="display:none"><div class="dz" onclick="pick(\''+pid+'\')" ondrop="event.preventDefault();handleFiles(event.dataTransfer.files,\''+pid+'\')" ondragover="event.preventDefault()"><div style="font-size:28px;margin-bottom:6px">📷</div><div style="font-size:12px;color:rgba(255,255,255,.5)">Toca per afegir fotos o vídeos</div></div><div id="pgrid-'+pid+'" class="pg">'+localHtml+'<div class="upb" onclick="pick(\''+pid+'\')">+</div></div><div id="ld-'+pid+'" style="display:none;text-align:center;padding:12px;font-size:11px;color:var(--mu)">Carregant fotos del grup…</div></div></div></div></div>';
}

function mtab(btn,id){
  var ms=btn.closest('.ms');
  ms.querySelectorAll('.mt').forEach(function(t){t.classList.remove('on');});
  btn.classList.add('on');
  ms.querySelectorAll('[id^="pi-"],[id^="pm-"],[id^="pp-"]').forEach(function(t){t.style.display='none';});
  var el=$(id);if(el)el.style.display='block';
}

async function loadPP(pid){
  if(!sb||!online)return;
  var ld=$('ld-'+pid);if(ld)ld.style.display='block';
  try{
    var d=await sb.storage.from(BUCKET).list(pid,{limit:50,sortBy:{column:'created_at',order:'desc'}});
    if(!d.data||!d.data.length){if(ld)ld.style.display='none';return;}
    var grid=$('pgrid-'+pid);if(!grid){if(ld)ld.style.display='none';return;}
    var items=d.data.map(function(f){return{url:sb.storage.from(BUCKET).getPublicUrl(pid+'/'+f.name).data.publicUrl,fname:pid+'/'+f.name,user:f.name.split('_')[0],isVid:!!f.name.match(/\.(mp4|mov|webm)$/i)};});
    grid.innerHTML=items.map(function(p){var src=(p.url||'').replace(/'/g,'%27');var fn=(p.fname||'').replace(/'/g,'');var u=(p.user||'').replace(/'/g,'');return'<div class="pt2"><div onclick="openLB(\''+src+'\','+(p.isVid?'true':'false')+',\''+u+'\',\'\')" style="position:absolute;inset:0">'+(p.isVid?'<video src="'+p.url+'" muted playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover"></video><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.25)"><div style="font-size:18px">▶️</div></div>':'<img src="'+p.url+'" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.parentNode.style.display=\'none\'">')+'</div>'+(u?'<div style="position:absolute;bottom:3px;left:3px;font-size:8px;background:rgba(0,0,0,.65);padding:1px 5px;border-radius:3px;color:rgba(255,255,255,.8)">'+u+'</div>':'')+'<button onclick="deletePhoto(this,\''+fn+'\',\''+pid+'\')" style="position:absolute;top:4px;right:4px;background:rgba(192,57,43,.85);border:none;border-radius:50%;width:22px;height:22px;color:#fff;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:700;z-index:10">✕</button></div>';}).join('')+'<div class="upb" onclick="pick(\''+pid+'\')">+</div>';
  }catch(e){}
  if(ld)ld.style.display='none';
}

// === FOOD MODAL ===
function openFood(id){
  var info=FOOD_INFO[id]||EXPERIENCE_INFO[id];if(!info)return;
  var img=FOOD_IMAGES[id]||'';
  var secs=[{i:'🍽️',l:'Què és',t:info.what},{i:'🥢',l:'Com es menja',t:info.how},{i:'📖',l:'Origen i context',t:info.context},{i:'👨‍👩‍👧',l:'Per a la familia',t:info.family},{i:'💴',l:'Preu orientatiu',t:info.price}].filter(function(s){return s.t;});
  var col=info.color||'#c0392b';
  var secsHtml=secs.map(function(s){return'<div class="ib" style="--ac:'+col+'66"><div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.9);margin-bottom:5px">'+s.i+' '+s.l+'</div><div style="font-size:12px;color:rgba(255,255,255,.62);line-height:1.65">'+s.t+'</div></div>';}).join('');
  $('md').innerHTML='<div class="mb" onclick="if(event.target===this)closeModal()"><div class="ms"><div style="position:relative;height:185px;flex-shrink:0;background:'+col+'22;overflow:hidden">'+(img?'<img src="'+img+'" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display=\'none\'">':'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:72px">'+(info.emoji||'🍽️')+'</div>')+'<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(15,15,34,1) 0%,rgba(15,15,34,.2) 50%,transparent 100%)"></div><button onclick="closeModal()" style="position:absolute;top:14px;right:14px;background:rgba(0,0,0,.6);border:none;border-radius:50%;width:34px;height:34px;color:#fff;font-size:16px;cursor:pointer">✕</button><div style="position:absolute;bottom:14px;left:18px"><div style="font-size:11px;font-weight:700;letter-spacing:2px;color:'+col+';text-transform:uppercase">'+(info.emoji||'')+' '+(info.name||id)+'</div></div></div><div class="msc">'+secsHtml+'</div></div></div>';
}


// === FOOD TAB ===
function renderFood(el){
  var foods=[{id:'sushi',e:'🍣',n:'Sushi',jp:'寿司',d:'Barra giratòria: econòmic i divertit',c:'#c0392b'},{id:'ramen',e:'🍜',n:'Ramen',jp:'ラーメン',d:'Sopa de fideus. Variants per a tots',c:'#e67e22'},{id:'takoyaki',e:'🐙',n:'Takoyaki',jp:'たこ焼き',d:'Boletes de polp. Especialitat Osaka!',c:'#8e24aa'},{id:'okonomiyaki',e:'🥞',n:'Okonomiyaki',jp:'お好み焼き',d:'Pizza japonesa. Cuines tu mateix',c:'#1976d2'},{id:'bento',e:'🍱',n:'Bento',jp:'弁当',d:'Al tren shinkansen. Experiència total',c:'#2e7d32'},{id:'curry',e:'🍛',n:'Curri',jp:'カレー',d:'Versió suau. Encanta als nens!',c:'#f57c00'},{id:'tonkatsu',e:'🍱',n:'Tonkatsu',jp:'とんかつ',d:'Cotxinets cruixents.',c:'#e67e22'},{id:'soba',e:'🍜',n:'Soba',jp:'そば',d:'Fideus de fajol. Refrescant.',c:'#5d4037'},{id:'unagi',e:'🐍',n:'Unagi',jp:'うなぎ',d:'Anguila laquejada. Luxe japonès.',c:'#8e24aa'},{id:'izakaya',e:'🍶',n:'Izakaya',jp:'居酒屋',d:'Taverna japonesa. Plats per compartir.',c:'#c0392b'},{id:'yakiniku',e:'🥩',n:'Yakiniku',jp:'焼肉',d:'Barbacoa a la taula. Wagyu!',c:'#e53935'},{id:'matcha',e:'🍵',n:'Matcha',jp:'抹茶',d:'Te verd en pols + cerimònia',c:'#2e7d32'}];
  var exps=[{id:'shinkansen_exp',e:'🚄',n:'Shinkansen',d:'Tren bala Tòquio-Kyoto'},{id:'karaoke_exp',e:'🎤',n:'Karaoke',d:'Sala privada per a tot el grup'},{id:'kabuki_exp',e:'🎭',n:'Kabuki',d:'Teatre tradicional japonès'},{id:'gion_matsuri_exp',e:'🎏',n:'Gion Matsuri',d:'Festival mil·lenari de Kyoto'},{id:'deer_feeding',e:'🦌',n:'Cèrvols de Nara',d:'Animals sagrats que s\'inclinen'},{id:'onsen_sento',e:'♨️',n:'Cerimònia del te',d:'Ritual zen amb wagashi'}];
  var fc=foods.map(function(f){var img=FOOD_IMAGES[f.id]||'';return'<div onclick="openFood(\''+f.id+'\')" style="flex-shrink:0;width:108px;background:var(--s1);border-radius:10px;overflow:hidden;border:1px solid '+f.c+'22;cursor:pointer"><div style="height:60px;background:'+f.c+'18;border-bottom:2px solid '+f.c+'33;overflow:hidden;position:relative">'+(img?'<img src="'+img+'" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.style.background=\''+f.c+'22\';this.style.display=\'none\'">':'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:26px">'+f.e+'</div>')+'</div><div style="padding:7px 8px 10px"><div style="font-size:11px;font-weight:700">'+f.n+'</div><div style="font-family:\'Noto Serif JP\',serif;font-size:12px;color:rgba(255,255,255,.2);margin-top:1px">'+f.jp+'</div><div style="font-size:9px;color:rgba(255,255,255,.38);margin-top:3px;line-height:1.4">'+f.d+'</div><div style="font-size:8px;color:'+f.c+';margin-top:4px;font-weight:700">toca →</div></div></div>';}).join('');
  var ec=exps.map(function(ex){var img=FOOD_IMAGES[ex.id]||'';return'<div onclick="openFood(\''+ex.id+'\')" class="card tap" style="overflow:hidden;margin-bottom:10px">'+(img?'<div style="height:95px;position:relative;overflow:hidden"><img src="'+img+'" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.style.display=\'none\'"><div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(13,13,18,.88),transparent)"></div><div style="position:absolute;bottom:8px;left:14px"><div style="font-size:15px;font-weight:700;color:#fff">'+ex.e+' '+ex.n+'</div><div style="font-size:10px;color:rgba(255,255,255,.5)">'+ex.d+'</div></div></div>':'<div style="padding:14px 16px;display:flex;gap:12px;align-items:center"><div style="font-size:28px">'+ex.e+'</div><div><div style="font-size:14px;font-weight:700;color:#fff">'+ex.n+'</div><div style="font-size:11px;color:var(--mu)">'+ex.d+'</div></div></div>')+'<div style="padding:6px 14px 10px"><div style="font-size:9px;color:var(--go);font-weight:700">📖 Guia completa</div></div></div>';}).join('');
  el.innerHTML='<div class="ph"><div class="ps">Descobreix</div><div class="pt">🍜 Menjar & Experiències</div></div><div style="padding:20px 0 100px"><div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;margin:0 20px 12px">Menjar japonès</div><div style="display:flex;gap:10px;overflow-x:auto;padding:0 20px 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch">'+fc+'</div><div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;margin:24px 20px 12px">Experiències especials</div><div style="padding:0 20px">'+ec+'</div></div>';
}

// === MEMORIES TAB ===
async function renderMemories(el){
  var isV=role==='viewer';
  el.innerHTML='<div class="ph"><div class="ps">'+(isV?'Àlbum familiar':'Fotos & Vídeos')+'</div><div class="pt">📸 '+(isV?'Records del viatge':'Memòries')+'</div><div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:5px">'+(isV?'Fotos i vídeos per lloc':'Les teves fotos i les del grup')+'</div></div><div style="padding:16px 20px 100px" id="mb2"><div style="text-align:center;padding:32px 0;color:var(--mu);font-size:12px">Carregant…</div></div>';
  var grp={};
  STAMPS.forEach(function(s){var loc=localGet(s.id);if(loc.length){grp[s.id]={stamp:s,items:loc.map(function(p){return Object.assign({},p,{isVid:p.isVid||p.isVideo||false});})};}});
  Object.keys(FOOD_INFO).forEach(function(k){var loc=localGet('food_'+k);if(loc.length)grp['food_'+k]={label:FOOD_INFO[k].emoji+' '+FOOD_INFO[k].name,items:loc};});
  if(sb&&online){
    try{
      var flds=await sb.storage.from(BUCKET).list('');
      for(var i=0;i<(flds.data||[]).length;i++){
        var f=flds.data[i];
        if(!f.id){
          var files=await sb.storage.from(BUCKET).list(f.name,{limit:50,sortBy:{column:'created_at',order:'desc'}});
          (files.data||[]).forEach(function(ff){
            var url=sb.storage.from(BUCKET).getPublicUrl(f.name+'/'+ff.name).data.publicUrl;
            var isVid=!!ff.name.match(/\.(mp4|mov|webm|avi)$/i);
            if(!grp[f.name])grp[f.name]={stamp:STAMPS.find(function(s){return s.id===f.name;}),items:[]};
            if(!grp[f.name].items.find(function(i2){return i2.url===url;}))grp[f.name].items.push({url:url,user:ff.name.split('_')[0],ts:new Date(ff.created_at).getTime(),isVid:isVid});
          });
        }
      }
    }catch(e){}
  }
  var body=$('mb2');if(!body)return;
  if(!Object.keys(grp).length){body.innerHTML='<div style="text-align:center;padding:40px 20px"><div style="font-size:50px;margin-bottom:16px">'+(isV?'🧡':'📷')+'</div><div style="font-size:15px;font-weight:700;color:rgba(255,255,255,.6);margin-bottom:8px">'+(isV?'Cap foto encara':'Cap foto o vídeo')+'</div><div style="font-size:12px;color:var(--mu)">'+(isV?'Quan els viatgers pengin fotos des de Japó, apareixeran aquí.':'Visita els llocs i penja les primeres fotos.')+'</div></div>';return;}
  var sorted=Object.entries(grp).sort(function(a,b){return Math.max.apply(null,b[1].items.map(function(i){return i.ts||0;}))-Math.max.apply(null,a[1].items.map(function(i){return i.ts||0;}));});
  body.innerHTML=sorted.map(function(entry){
    var pid=entry[0],g=entry[1];
    var lbl=g.stamp?(g.stamp.emoji+' '+g.stamp.name):(g.label||pid);
    var kanji=g.stamp&&g.stamp.kanji||'';
    var day=null;TRIP_DATA.forEach(function(c){c.days.forEach(function(d){if(d.places&&d.places.find(function(p){return p.id===pid;}))day=d;});});
    var items=g.items.slice().sort(function(a,b){return(b.ts||0)-(a.ts||0);});
    var cells=items.map(function(item){var src=(item.url||item.dataUrl||'').replace(/'/g,'%27');var u=(item.user||item.uploader||'').replace(/'/g,'');var isV=item.isVid||item.isVideo||!!(item.url||'').match(/\.(mp4|mov|webm)$/i);return'<div class="pt2" onclick="openLB(\''+src+'\','+isV+',\''+u+'\',\''+lbl.replace(/'/g,'').slice(0,20)+'\'">'+(isV?'<video src="'+(item.url||item.dataUrl||'')+'" muted playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover"></video><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.25)"><div style="font-size:18px">▶️</div></div>':'<img src="'+(item.url||item.dataUrl||'')+'" loading="lazy" onerror="this.parentNode.style.display=\'none\'">')+(u?'<div style="position:absolute;bottom:3px;left:3px;font-size:7px;background:rgba(0,0,0,.65);padding:1px 4px;border-radius:3px;color:rgba(255,255,255,.75)">'+u+'</div>':'')+'</div>';}).join('');
    return'<div style="margin-bottom:28px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--bd)"><div style="flex:1"><div style="font-size:14px;font-weight:700;color:#fff">'+lbl+'</div><div style="display:flex;gap:8px;align-items:center;margin-top:2px;flex-wrap:wrap">'+(kanji?'<div style="font-family:\'Noto Serif JP\',serif;font-size:12px;color:rgba(255,255,255,.25)">'+kanji+'</div>':'')+(day?'<div style="font-size:10px;color:var(--mu)">Dia '+day.day+' · '+day.date+'</div>':'')+'<div style="font-size:10px;color:var(--mu)">'+items.length+' element'+(items.length!==1?'s':'')+'</div></div></div>'+(g.stamp&&!isV?'<button onclick="openPlace(\''+pid+'\')" style="background:var(--s1);border:1px solid var(--bd);border-radius:6px;padding:5px 10px;color:var(--mu);font-size:10px;cursor:pointer;font-family:\'Zen Kaku Gothic New\',sans-serif">ℹ️</button>':'')+'</div><div class="pg" id="pgrid-'+pid+'">'+cells+(!isV?'<div class="upb" onclick="pick(\''+pid+'\')">+</div>':'')+'</div></div>';
  }).join('');
}

// === STAMPS TAB ===
function renderStamps(el){
  el=el||$('pg');if(!el)return;
  var u=user||{name:'?',emoji:'👤'};
  var coll=Object.keys(stamps).length,total=STAMPS.length;
  var cities=['Tòquio','Kyoto','Osaka'].map(function(cn){
    var css=STAMPS.filter(function(s){return s.city===cn;});
    var got=css.filter(function(s){return stamps[s.id];}).length;
    var ac=CITY_COLORS[cn];
    var cards=css.map(function(s){return sCard(s);}).join('');
    return'<div style="margin-bottom:24px"><div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--bd)"><div style="flex:1"><div style="font-size:9px;letter-spacing:3px;color:'+ac+';text-transform:uppercase;font-weight:700">'+cn+'</div><div style="font-family:\'Noto Serif JP\',serif;font-size:13px;color:rgba(255,255,255,.6)">'+(cn==='Tòquio'?'東京':cn==='Kyoto'?'京都':'大阪')+'</div></div><div style="font-size:18px;font-weight:700;color:'+ac+'">'+got+'<span style="font-size:10px;color:rgba(255,255,255,.3)">/'+css.length+'</span></div><div style="width:50px;height:4px;background:rgba(255,255,255,.08);border-radius:2px"><div style="height:100%;border-radius:2px;background:'+ac+';width:'+Math.round(got/css.length*100)+'%"></div></div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">'+cards+'</div></div>';
  }).join('');
  el.innerHTML='<div class="ph"><div style="display:flex;align-items:center;justify-content:space-between"><div><div class="ps">Passaport personal</div><div class="pt">🏮 Col·lecció</div></div><div style="position:relative;width:58px;height:58px;flex-shrink:0"><svg width="58" height="58" viewBox="0 0 58 58"><circle cx="29" cy="29" r="24" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="4"/><circle cx="29" cy="29" r="24" fill="none" stroke="var(--go)" stroke-width="4" stroke-dasharray="'+((coll/total)*150.8).toFixed(1)+' 150.8" stroke-linecap="round" transform="rotate(-90 29 29)"/></svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-size:14px;font-weight:700;color:var(--go);line-height:1">'+coll+'</div><div style="font-size:8px;color:rgba(255,255,255,.3)">/'+total+'</div></div></div></div><div style="margin-top:10px"><button onclick="showWelcome()" style="display:inline-flex;align-items:center;gap:6px;background:var(--s1);border:1px solid var(--bd);border-radius:20px;padding:5px 12px;font-size:11px;cursor:pointer;color:#fff;font-family:\'Zen Kaku Gothic New\',sans-serif">'+u.emoji+' '+u.name+'</button></div></div><div style="padding:16px 20px 100px"><div style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:10px;padding:10px 14px;margin-bottom:16px;font-size:11px;color:rgba(255,255,255,.7);line-height:1.5">🏮 <strong style="color:var(--go)">Sistema honorari</strong> — Toca qualsevol segell per col·leccionar-lo quan visiteu el lloc!</div>'+cities+'</div>';
}

function sCard(s){
  var got=!!stamps[s.id],just=newStamp===s.id;
  var col=got?s.color:'#3a3a4a';
  return'<div onclick="openStamp(\''+s.id+'\')" style="display:flex;flex-direction:column;align-items:center;cursor:pointer;padding:6px 4px"><div style="position:relative;'+(got?'filter:drop-shadow(0 0 8px '+s.color+'88)':'')+(just?';animation:s2 .5s cubic-bezier(.175,.885,.32,1.275) both':'')+'">'+sSVG(s.shape,col,80,!got,s.emoji,got)+'</div><div style="margin-top:5px;text-align:center;width:84px"><div style="font-size:9px;font-weight:700;line-height:1.2;color:'+(got?'#fff':'rgba(255,255,255,.3)')+'">'+s.name+'</div><div style="font-family:\'Noto Serif JP\',serif;font-size:11px;color:'+(got?s.color+'cc':'rgba(255,255,255,.15)')+';margin-top:1px">'+s.kanji+'</div>'+(got?'<div style="font-size:8px;color:'+s.color+'99;margin-top:2px">✓</div>':'<div style="font-size:8px;color:rgba(255,255,255,.2);margin-top:2px">toca</div>')+'</div></div>';
}

function openStamp(id){
  var s=STAMPS.find(function(x){return x.id===id;});if(!s)return;
  var got=!!stamps[id],just=newStamp===id;
  var btn=got
    ?'<div style="background:'+s.color+'22;border:1px solid '+s.color+'44;border-radius:10px;padding:14px 18px;text-align:center"><div style="font-size:20px;margin-bottom:6px">'+(just?'🎉':'✅')+'</div><div style="font-size:13px;color:#fff;font-weight:700">'+(just?'Segell aconseguit!':'Ja tens aquest segell')+'</div><div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:4px">'+(stamps[id]?new Date(stamps[id]).toLocaleDateString('ca'):'')+'</div><button onclick="unCollect(''+id+'');closeModal()" style="margin-top:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:7px 16px;color:rgba(255,255,255,0.4);font-size:11px;cursor:pointer;font-family:'Zen Kaku Gothic New',sans-serif">↩ Desfer segell</button></div>'
    :'<button onclick="doCollect(\''+id+'\',true);openStamp(\''+id+'\')" style="width:100%;padding:16px;background:linear-gradient(135deg,'+s.color+','+s.color+'cc);border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:\'Zen Kaku Gothic New\',sans-serif;box-shadow:0 4px 20px '+s.color+'44">🏮 Col·leccionar segell!</button>';
  $('md').innerHTML='<div class="mb" onclick="if(event.target===this)closeModal()" style="align-items:center;padding:24px"><div style="background:radial-gradient(ellipse at top,'+s.color+'18 0%,#0f0f1a 60%);border:1px solid '+s.color+'33;border-radius:20px;padding:32px 28px 28px;width:100%;max-width:340px;text-align:center;animation:pi .3s cubic-bezier(.175,.885,.32,1.275) both;position:relative"><button onclick="closeModal()" style="position:absolute;top:14px;right:14px;background:var(--s1);border:none;border-radius:50%;width:30px;height:30px;color:var(--mu);font-size:14px;cursor:pointer">✕</button><div style="display:flex;justify-content:center;margin-bottom:16px;'+(got?'filter:drop-shadow(0 0 20px '+s.color+'99)':'')+(just?';animation:s2 .6s cubic-bezier(.175,.885,.32,1.275) both':'')+'">'+sSVG(s.shape,got?s.color:'#3a3a4a',120,!got,s.emoji,got)+'</div><div style="display:inline-block;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:'+CITY_COLORS[s.city]+';background:'+CITY_COLORS[s.city]+'22;border-radius:4px;padding:3px 10px;margin-bottom:10px">'+s.city+' · Dia '+s.day+'</div><div style="font-family:\'Noto Serif JP\',serif;font-size:22px;font-weight:700;color:#fff;line-height:1.1">'+s.name+'</div><div style="font-family:\'Noto Serif JP\',serif;font-size:28px;color:'+s.color+'88;margin-top:4px">'+s.kanji+'</div><div style="margin-top:20px">'+btn+'</div></div></div>';
}

function unCollect(id){
  delete stamps[id];
  try{localStorage.setItem('jp_stamps',JSON.stringify(stamps));}catch(e){}
  sy('ok','↩ Segell desfet');
  if(tab==='stamps')renderStamps();
}

function doCollect(id,manual){
  if(stamps[id]&&!manual)return;
  stamps[id]=new Date().toISOString();
  try{localStorage.setItem('jp_stamps',JSON.stringify(stamps));}catch(e){}
  newStamp=id;
  setTimeout(function(){newStamp=null;if(tab==='stamps')renderStamps();},3000);
  var s=STAMPS.find(function(x){return x.id===id;});
  sy('ok',s?'🏮 '+s.name+'!':'✓ Col·leccionat');
  if(tab==='stamps')renderStamps();
}

function sSVG(shape,c,s,locked,emoji,collected){
  var cx=s/2,cy=s/2,inner='';
  if(shape==='torii')inner='<rect x="'+(cx-s*.28)+'" y="'+(cy-s*.28)+'" width="'+(s*.08)+'" height="'+(s*.38)+'" fill="'+c+'" rx="2"/><rect x="'+(cx+s*.20)+'" y="'+(cy-s*.28)+'" width="'+(s*.08)+'" height="'+(s*.38)+'" fill="'+c+'" rx="2"/><path d="M'+(cx-s*.36)+' '+(cy-s*.28)+'h'+(s*.72)+'v'+(s*.07)+'H'+(cx-s*.36)+'z" fill="'+c+'"/><path d="M'+(cx-s*.30)+' '+(cy-s*.18)+'h'+(s*.60)+'v'+(s*.05)+'H'+(cx-s*.30)+'z" fill="'+c+'"/>';
  else if(shape==='star'){var pts=Array.from({length:5},function(_,i){var o=s*.38,inn=s*.17,a=-Math.PI/2;return(cx+o*Math.cos(a+i*2*Math.PI/5))+','+(cy+o*Math.sin(a+i*2*Math.PI/5))+' '+(cx+inn*Math.cos(a+(i+.5)*2*Math.PI/5))+','+(cy+inn*Math.sin(a+(i+.5)*2*Math.PI/5));}).join(' ');inner='<polygon points="'+pts+'" fill="'+c+'"/>';}
  else if(shape==='circle')inner='<circle cx="'+cx+'" cy="'+cy+'" r="'+(s*.38)+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.055)+'" stroke-dasharray="'+(locked?'4,3':'none')+'"/>';
  else if(shape==='hexagon'){var hpts=Array.from({length:6},function(_,i){var r=s*.38,a=i*Math.PI/3-Math.PI/6;return(cx+r*Math.cos(a))+','+(cy+r*Math.sin(a));}).join(' ');inner='<polygon points="'+hpts+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.055)+'"/>';}
  else if(shape==='diamond')inner='<polygon points="'+cx+','+(cy-s*.40)+' '+(cx+s*.32)+','+cy+' '+cx+','+(cy+s*.40)+' '+(cx-s*.32)+','+cy+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.055)+'"/>';
  else if(shape==='castle')inner='<rect x="'+(cx-s*.28)+'" y="'+(cy-s*.10)+'" width="'+(s*.56)+'" height="'+(s*.30)+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.05)+'"/><rect x="'+(cx-s*.16)+'" y="'+(cy-s*.28)+'" width="'+(s*.32)+'" height="'+(s*.20)+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.05)+'"/><rect x="'+(cx-s*.28)+'" y="'+(cy-s*.22)+'" width="'+(s*.10)+'" height="'+(s*.12)+'" fill="'+c+'"/><rect x="'+(cx+s*.18)+'" y="'+(cy-s*.22)+'" width="'+(s*.10)+'" height="'+(s*.12)+'" fill="'+c+'"/>';
  else if(shape==='tower')inner='<polygon points="'+cx+','+(cy-s*.42)+' '+(cx-s*.18)+','+(cy+s*.22)+' '+(cx+s*.18)+','+(cy+s*.22)+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.055)+'"/><line x1="'+(cx-s*.10)+'" y1="'+cy+'" x2="'+(cx+s*.10)+'" y2="'+cy+'" stroke="'+c+'" stroke-width="'+(s*.04)+'"/><line x1="'+(cx-s*.14)+'" y1="'+(cy+s*.12)+'" x2="'+(cx+s*.14)+'" y2="'+(cy+s*.12)+'" stroke="'+c+'" stroke-width="'+(s*.04)+'"/>';
  else if(shape==='fan')inner=[-60,-30,0,30,60].map(function(a){return'<line x1="'+cx+'" y1="'+(cy+s*.10)+'" x2="'+(cx+s*.34*Math.sin(a*Math.PI/180))+'" y2="'+(cy+s*.10-s*.34*Math.cos(a*Math.PI/180))+'" stroke="'+c+'" stroke-width="'+(s*.045)+'" stroke-linecap="round"/>';}).join('')+'<path d="M '+(cx-s*.34)+' '+(cy+s*.10)+' A '+(s*.34)+' '+(s*.34)+' 0 0 1 '+(cx+s*.34)+' '+(cy+s*.10)+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.045)+'"/>';
  else if(shape==='flower')inner=[0,60,120,180,240,300].map(function(a){return'<ellipse cx="'+(cx+s*.18*Math.cos(a*Math.PI/180))+'" cy="'+(cy+s*.18*Math.sin(a*Math.PI/180))+'" rx="'+(s*.10)+'" ry="'+(s*.16)+'" transform="rotate('+a+' '+(cx+s*.18*Math.cos(a*Math.PI/180))+' '+(cy+s*.18*Math.sin(a*Math.PI/180))+')" fill="'+c+'" opacity="0.85"/>';}).join('')+'<circle cx="'+cx+'" cy="'+cy+'" r="'+(s*.08)+'" fill="'+c+'"/>';
  else if(shape==='leaf')inner='<path d="M '+cx+' '+(cy-s*.40)+' C '+(cx+s*.30)+' '+(cy-s*.20)+' '+(cx+s*.30)+' '+(cy+s*.20)+' '+cx+' '+(cy+s*.40)+' C '+(cx-s*.30)+' '+(cy+s*.20)+' '+(cx-s*.30)+' '+(cy-s*.20)+' '+cx+' '+(cy-s*.40)+' Z" fill="none" stroke="'+c+'" stroke-width="'+(s*.055)+'"/>';
  else if(shape==='bolt')inner='<polygon points="'+(cx+s*.08)+','+(cy-s*.40)+' '+(cx-s*.14)+','+(cy-s*.02)+' '+(cx+s*.05)+','+(cy-s*.02)+' '+(cx-s*.08)+','+(cy+s*.40)+' '+(cx+s*.18)+','+(cy+s*.04)+' '+(cx-s*.02)+','+(cy+s*.04)+'" fill="'+c+'"/>';
  else if(shape==='lantern')inner='<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(s*.22)+'" ry="'+(s*.32)+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.055)+'"/><line x1="'+cx+'" y1="'+(cy-s*.42)+'" x2="'+cx+'" y2="'+(cy-s*.32)+'" stroke="'+c+'" stroke-width="'+(s*.05)+'"/><line x1="'+cx+'" y1="'+(cy+s*.32)+'" x2="'+cx+'" y2="'+(cy+s*.42)+'" stroke="'+c+'" stroke-width="'+(s*.05)+'"/>';
  else if(shape==='deer')inner='<circle cx="'+cx+'" cy="'+(cy+s*.05)+'" r="'+(s*.18)+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.055)+'"/><line x1="'+cx+'" y1="'+(cy-s*.13)+'" x2="'+cx+'" y2="'+(cy-s*.38)+'" stroke="'+c+'" stroke-width="'+(s*.05)+'"/><path d="M '+cx+' '+(cy-s*.28)+' L '+(cx-s*.14)+' '+(cy-s*.42)+' M '+cx+' '+(cy-s*.28)+' L '+(cx+s*.14)+' '+(cy-s*.42)+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.05)+'" stroke-linecap="round"/>';
  else if(shape==='bamboo')inner=[-s*.14,0,s*.14].map(function(x,i){return'<rect x="'+(cx+x-s*.04)+'" y="'+(cy-s*.38+i*s*.06)+'" width="'+(s*.08)+'" height="'+(s*.70-i*s*.06)+'" rx="3" fill="none" stroke="'+c+'" stroke-width="'+(s*.045)+'"/>'+ [.1,.25,.40].map(function(y){return'<line x1="'+(cx+x-s*.04)+'" y1="'+(cy-s*.38+i*s*.06+s*y)+'" x2="'+(cx+x+s*.04)+'" y2="'+(cy-s*.38+i*s*.06+s*y)+'" stroke="'+c+'" stroke-width="'+(s*.03)+'"/>';}).join('');}).join('');
  else if(shape==='wave')inner='<path d="M '+(cx-s*.38)+' '+cy+' C '+(cx-s*.20)+' '+(cy-s*.24)+' '+cx+' '+(cy+s*.24)+' '+(cx+s*.20)+' '+cy+' C '+(cx+s*.28)+' '+(cy-s*.16)+' '+(cx+s*.38)+' '+(cy-s*.08)+' '+(cx+s*.38)+' '+cy+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.07)+'" stroke-linecap="round"/>';
  else inner='<circle cx="'+cx+'" cy="'+cy+'" r="'+(s*.38)+'" fill="none" stroke="'+c+'" stroke-width="'+(s*.055)+'"/>';
  return'<svg width="'+s+'" height="'+s+'" viewBox="0 0 '+s+' '+s+'" style="display:block"><circle cx="'+cx+'" cy="'+cy+'" r="'+(s*.47)+'" fill="none" stroke="'+c+'" stroke-width="'+(locked?s*.015:s*.025)+'" opacity="'+(locked?.2:.4)+'" stroke-dasharray="'+(locked?'3,4':'6,3')+'"/><circle cx="'+cx+'" cy="'+cy+'" r="'+(s*.42)+'" fill="'+(locked?'rgba(255,255,255,.02)':'rgba(255,255,255,.06)')+'" stroke="'+c+'" stroke-width="'+(locked?s*.015:s*.02)+'" opacity="'+(locked?.15:.5)+'"/>'+inner+(collected?'<text x="'+cx+'" y="'+(cy+s*.09)+'" text-anchor="middle" font-size="'+(s*.28)+'" style="pointer-events:none">'+emoji+'</text>':'')+(locked?'<g opacity=".4"><rect x="'+(cx-s*.06)+'" y="'+(cy-s*.02)+'" width="'+(s*.12)+'" height="'+(s*.10)+'" rx="2" fill="#888"/><path d="M '+(cx-s*.04)+' '+(cy-s*.02)+' A '+(s*.04)+' '+(s*.04)+' 0 0 1 '+(cx+s*.04)+' '+(cy-s*.02)+'" fill="none" stroke="#888" stroke-width="'+(s*.025)+'"/></g>':'')+'</svg>';
}


// === ADMIN TAB ===
function renderAdmin(el){
  var total=STAMPS.length,coll=Object.keys(stamps).length;
  var grid=STAMPS.map(function(s){
    var got=!!stamps[s.id];
    return'<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)"><div style="font-size:18px">'+s.emoji+'</div><div style="flex:1"><div style="font-size:12px;font-weight:700;color:'+(got?'#fff':'rgba(255,255,255,.35)')+'">'+s.name+'</div><div style="font-size:9px;color:'+CITY_COLORS[s.city]+';font-family:\'Noto Serif JP\',serif">'+s.kanji+' · '+s.city+'</div></div>'+(got?'<div style="font-size:9px;color:#5adc5a;font-weight:700">✓</div><button onclick="aRevoke(\''+s.id+'\')" style="font-size:9px;background:rgba(192,57,43,.2);border:1px solid rgba(192,57,43,.4);border-radius:6px;padding:3px 8px;color:#ff6b6b;cursor:pointer;font-family:\'Zen Kaku Gothic New\',sans-serif">Revocar</button>':'<button onclick="aUnlock(\''+s.id+'\')" style="font-size:9px;background:rgba(201,168,76,.2);border:1px solid rgba(201,168,76,.4);border-radius:6px;padding:3px 8px;color:var(--go);cursor:pointer;font-family:\'Zen Kaku Gothic New\',sans-serif">Desbloqueja</button>')+'</div>';
  }).join('');
  var sbOk=!!sb&&online;
  el.innerHTML='<div class="ph"><div class="ps">Sharon · Administradora</div><div class="pt">⚙️ Panell Admin</div></div><div style="padding:20px 20px 100px"><div style="background:var(--s1);border-radius:12px;padding:16px;border:1px solid var(--bd);margin-bottom:20px"><div style="font-size:10px;letter-spacing:2px;color:rgba(255,255,255,.3);text-transform:uppercase;margin-bottom:10px">Diagnòstic</div><div style="font-size:13px;color:#fff;margin-bottom:8px">'+(sbOk?'🟢 Supabase connectat':!sb?'🔴 Supabase no configurat':'🟡 Offline')+'</div><div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:12px">Bucket: family-media · '+(online?'Online':'Offline')+'</div><button onclick="aTest()" style="background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.4);border-radius:8px;padding:10px 16px;color:var(--go);font-size:12px;font-weight:700;cursor:pointer;font-family:\'Zen Kaku Gothic New\',sans-serif;width:100%">🧪 Prova de pujada</button><div id="atr" style="margin-top:10px;font-size:11px;line-height:1.6;display:none"></div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:24px"><div style="background:var(--s1);border-radius:10px;padding:14px;border:1px solid var(--bd);text-align:center"><div style="font-size:22px;font-weight:700;color:var(--go)">'+coll+'</div><div style="font-size:9px;color:var(--mu);margin-top:3px">Segells</div></div><div style="background:var(--s1);border-radius:10px;padding:14px;border:1px solid var(--bd);text-align:center"><div style="font-size:22px;font-weight:700;color:#e94560">'+(total-coll)+'</div><div style="font-size:9px;color:var(--mu);margin-top:3px">Pendents</div></div><div style="background:var(--s1);border-radius:10px;padding:14px;border:1px solid var(--bd);text-align:center"><div style="font-size:22px;font-weight:700;color:#5adc5a">'+Math.round(coll/total*100)+'%</div><div style="font-size:9px;color:var(--mu);margin-top:3px">Completat</div></div></div><div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;margin-bottom:12px">Accions</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px"><button onclick="aUnlockAll()" style="background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);border-radius:10px;padding:12px 16px;color:var(--go);font-size:13px;font-weight:700;cursor:pointer;font-family:\'Zen Kaku Gothic New\',sans-serif;text-align:left">🏮 Desbloqueja segells del dia actual</button><button onclick="aReset()" style="background:rgba(192,57,43,.08);border:1px solid rgba(192,57,43,.2);border-radius:10px;padding:12px 16px;color:#ff6b6b;font-size:13px;font-weight:700;cursor:pointer;font-family:\'Zen Kaku Gothic New\',sans-serif;text-align:left">🗑️ Reiniciar tots els segells</button></div><div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;margin-bottom:12px">Gestió de segells</div><div style="background:var(--s1);border-radius:12px;padding:12px 14px;border:1px solid var(--bd)">'+grid+'</div><div style="margin-top:24px"><button onclick="showWelcome()" style="width:100%;background:var(--s1);border:1px solid var(--bd);border-radius:10px;padding:12px;color:var(--mu);font-size:12px;cursor:pointer;font-family:\'Zen Kaku Gothic New\',sans-serif">Canviar d\'usuari</button></div></div>';
}

function aUnlock(id){stamps[id]=new Date().toISOString();try{localStorage.setItem('jp_stamps',JSON.stringify(stamps));}catch(e){}sy('ok','🏮 Segell desblocat!');renderAdmin($('pg'));}
function aRevoke(id){delete stamps[id];try{localStorage.setItem('jp_stamps',JSON.stringify(stamps));}catch(e){}sy('ok','✓ Revocat');renderAdmin($('pg'));}
function aUnlockAll(){var tr=tripDay();if(tr.st!=='during'||!tr.day){sy('er','No estem en viatge');return;}tr.day.places.forEach(function(p){stamps[p.id]=new Date().toISOString();});try{localStorage.setItem('jp_stamps',JSON.stringify(stamps));}catch(e){}sy('ok','🏮 Segells desbloquejats!');renderAdmin($('pg'));}
function aReset(){if(!confirm('Segur que vols reiniciar TOTS els segells?'))return;stamps={};try{localStorage.setItem('jp_stamps',JSON.stringify(stamps));}catch(e){}sy('ok','✓ Reiniciats');renderAdmin($('pg'));}
async function aTest(){
  var out=$('atr');if(!out)return;out.style.display='block';out.style.color='var(--go)';out.textContent='⏳ Provant…';
  if(!sb){out.style.color='#ff6b6b';out.textContent='❌ Supabase no inicialitzat.';return;}
  if(!online){out.style.color='#ff6b6b';out.textContent='❌ Sense connexió.';return;}
  try{
    var r=await sb.storage.from(BUCKET).list('',{limit:1});
    if(r.error)throw r.error;
    var blob=new Blob(['test'],{type:'text/plain'});
    var fn='test/sharon_test_'+Date.now()+'.txt';
    var r2=await sb.storage.from(BUCKET).upload(fn,blob,{contentType:'text/plain'});
    if(r2.error)throw r2.error;
    await sb.storage.from(BUCKET).remove([fn]);
    out.style.color='#5adc5a';out.textContent='✅ Tot funciona! Bucket accessible i pujades OK.';
  }catch(e){out.style.color='#ff6b6b';out.textContent='❌ Error: '+e.message;}
}

// === PACKING GUIDE ===
function showPackingGuide(){
  var secs=[
    {e:"🌡️",t:"Calor i humitat",col:"#e94560",items:["Juliol a Japó: 33-38°C amb humitat molt alta.","Roba lleugera transpirable (lli, cotó). Canvia cada dia.","Ventilador portàtil i paraigua petit plegable.","Crema solar SPF50+ i crema antipicor.","Gorra o barret per a l'ombra.","Toalletes corporals refrescants."]},
    {e:"🎒",t:"Equipatge · Principiant",col:"#c9a84c",items:["Diners en efectiu — molts llocs NOMÉS accepten efectiu.","Ampolla d'aigua reutilitzable.","Mocadors de paper — no hi ha papereres al carrer.","Desinfectant de mans portàtil.","Carregador portàtil (power bank) gran.","Passaport — porta'l sempre a sobre.","Adaptador d'endoll tipus americà."]},
    {e:"🎒",t:"Equipatge · Avançat",col:"#5a7d59",items:["Repel·lent de mosquits — sobretot a Kyoto prop del riu.","Bossa de plàstic per a les escombraries a la motxilla.","Ventilador portàtil de coll — mans lliures.","Sabates fàcils de posar i treure — als temples caldrà."]},
    {e:"👟",t:"Sabates i caminar",col:"#ff6b35",items:["Caminareu 15.000-20.000 passos diaris.","Porta sabates còmodes ja trencades — mai estrenar sabates noves.","Als temples hauràs de treure-les sovint.","Mitges còmodes i sense forats."]},
    {e:"📱",t:"Apps imprescindibles",col:"#1976d2",items:["Google Maps — descarrega offline Tòquio, Kyoto i Osaka ABANS.","Google Translate — descarrega japonès offline. La càmera llegeix cartells.","App transport: consulta saldo SUICA/ICOCA.","Visit Japan Web — formulari obligatori. Genera QR per a l'aeroport."]},
    {e:"🥢",t:"Etiqueta al restaurant",col:"#8e24aa",items:["Di 'Itadakimasu' abans de menjar.","Sorbar fideus fa soroll — és un compliment!","Bastonets: no els clavessis drets a l'arròs (símbol funerari).","No passis menjar de bastonet a bastonet.","Paga a la caixa, no a la taula.","El wasabi es posa directament al sushi, NO a la salsa de soja."]},
    {e:"🚇",t:"Etiqueta al transport",col:"#c0392b",items:["SILENCI total — ni trucades, ni parlar fort.","Motxilla a davant o als peus — no a l'esquena.","Cua sempre i en ordre estricte.","No mengis ni beguis (excepte Shinkansen)."]},
    {e:"⛩️",t:"Etiqueta als temples",col:"#2e7d32",items:["Parla fluix — és un lloc religiós actiu.","Renta't les mans a la font en entrar.","Treu-te les sabates quan hi hagi estoreta.","No toquis objectes sagrats."]},
    {e:"💬",t:"Frases essencials",col:"#607d8b",items:["Konnichiwa — Hola / Bon dia","Ohayou gozaimasu — Bon dia (al matí)","Arigatou gozaimasu — Moltes gràcies","Sumimasen — Perdona / Disculpa","Onegaishimasu — Si us plau","Itadakimasu — Bon profit (abans de menjar)","Toire wa doko desu ka? — On és el bany?"]},
  ];
  var html=secs.map(function(s){return'<div style="margin-bottom:20px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.07)"><div style="font-size:22px">'+s.e+'</div><div style="font-size:14px;font-weight:700;color:#fff">'+s.t+'</div></div>'+s.items.map(function(item){return'<div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)"><div style="color:'+s.col+';flex-shrink:0">•</div><div style="font-size:12px;color:rgba(255,255,255,.72);line-height:1.55">'+item+'</div></div>';}).join('')+'</div>';}).join('');
  $('md').innerHTML='<div class="mb" onclick="if(event.target===this)closeModal()"><div class="ms"><div class="mh"><div class="mhb"></div></div><div style="padding:14px 20px 0;flex-shrink:0"><button onclick="closeModal()" style="background:var(--s1);border:none;border-radius:8px;padding:6px 14px;color:var(--mu);font-size:12px;cursor:pointer;margin-bottom:12px;font-family:\'Zen Kaku Gothic New\',sans-serif">← Tornar</button><div class="ps">Preparació</div><div class="pt">🧳 Guia per al viatge</div><div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:4px">Equipatge · Etiqueta · Frases útils</div></div><div class="msc">'+html+'</div></div></div>';
}

// === BOOT ===
// Safety net for iOS - boot if DOMContentLoaded doesn't fire
setTimeout(function(){
  var ldg=document.getElementById('ldg');
  if(ldg&&ldg.parentNode)boot();
},3000);

var booted=false;
function dbg(msg){
  var e=document.getElementById('em2');
  if(e)e.textContent=msg;
  console.log('[boot]',msg);
}
function boot(){
  if(booted)return; booted=true;
  dbg('boot started...');
  initSB();
  setTimeout(function(){initSB();if(sb&&online){syncQ();startRT();}},1500);
  dbg('building nav...');
  buildNav();
  dbg('nav built, removing loader...');
  var ldg=$('ldg');if(ldg)ldg.remove();
  dbg('showing welcome...');
  if(!user)showWelcome();
  else render();
  dbg('done!');
  window.addEventListener('online',function(){
  online=true;initSB();syncQ();sy('ok','🌐 Connectat');
  var offBanner=document.getElementById('offbanner');
  if(offBanner)offBanner.remove();
});
window.addEventListener('offline',function(){
  online=false;sy('of','📵 Offline');
  if(!document.getElementById('offbanner')){
    var b=document.createElement('div');
    b.id='offbanner';
    b.style.cssText='position:fixed;top:0;left:0;right:0;z-index:400;background:#c0392b;color:#fff;text-align:center;padding:6px;font-size:11px;font-weight:700;font-family:Zen Kaku Gothic New,sans-serif';
    b.textContent='📵 Sense connexió — les fotos no es poden pujar fins que torni internet';
    document.body.appendChild(b);
  }
});
}

document.addEventListener('DOMContentLoaded', function(){
  boot();
});

