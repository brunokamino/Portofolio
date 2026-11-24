const $=s=>document.querySelector(s);
const localCategories=['Massas e macarrão','Bolos','Receitas de vó','Artesanais','Saladas','Doces','Almoço de domingo','Almoço de domingo','Sobremesas'];
const local=window.LOCAIS.map((r,n)=>({...r,c:localCategories[n],local:true,source:'Receitas de Vó',difficulty:r.e}));
const R=[...window.CATALOGO,...local].map((r,n)=>({...r,id:n}));
const cats=['Todas',...new Set(R.map(r=>r.c))];
let cat='Todas',onlyFav=false,limit=24,slide=0,active,portions=1,saved=[];
try{saved=JSON.parse(localStorage.getItem('receitas-de-vo-fav')||'[]')}catch{}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const img=r=>window.FOTOS?.[r.img]||'img/'+r.img+'.jpg';
const card=r=>`<article class="card" tabindex="0" role="button" onclick="openRecipe(${r.id})" onkeydown="if(event.target===this&&event.key==='Enter')openRecipe(${r.id})"><img src="${img(r)}" loading="lazy" alt="Foto ilustrativa de ${esc(r.c)}"><button class="heart ${saved.includes(r.id)?'saved':''}" onclick="event.stopPropagation();toggle(${r.id})" aria-label="Favoritar ${esc(r.t)}">${saved.includes(r.id)?'♥':'♡'}</button><div class="body"><span class="tag">${esc(r.c)}</span><h3>${esc(r.t)}</h3><div class="meta">${r.time?'◷ '+r.time+' min · ':''}${esc(r.source)}</div><span class="photoLabel">Foto ilustrativa</span></div></article>`;
function render(){
 const q=norm($('#query').value),time=$('#time').value,diff=$('#difficulty').value;
 const m=R.filter(r=>(cat==='Todas'||r.c===cat)&&(!onlyFav||saved.includes(r.id))&&(!time||(r.time&&r.time<=Number(time)))&&(!diff||r.difficulty===diff)&&norm([r.t,r.c,r.country,r.d,...(r.ingredients||[]),...(r.i||[]).map(x=>x[1])].join(' ')).includes(q));
 $('#grid').innerHTML=m.slice(0,limit).map(card).join('')||'<p class="empty">Nenhuma receita encontrada.</p>';
 $('#more').hidden=m.length<=limit;$('#count').textContent=m.length+' receitas';
 $('#listTitle').textContent=onlyFav?'Meus favoritos':cat==='Todas'?'Todas as receitas':cat;
 $('#hero').hidden=!!q||cat!=='Todas'||onlyFav||!!time||!!diff;$('#highlights').hidden=$('#hero').hidden;
 $('#fav').textContent=onlyFav?'♥':'♡';
 $('#nav').innerHTML=cats.map(c=>`<button class="${c===cat&&!onlyFav?'active':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
}
function choose(c){cat=c;onlyFav=false;limit=24;render()}
function toggle(id){saved=saved.includes(id)?saved.filter(n=>n!==id):[...saved,id];try{localStorage.setItem('receitas-de-vo-fav',JSON.stringify(saved))}catch{}render();renderRow()}
function renderRow(){$('#row').innerHTML=R.filter(r=>r.c==='Almoço de domingo').slice(0,12).map(card).join('')}
const featured=[local[0],local[1],local[3],local[7]].map(r=>R.find(x=>x.t===r.t&&x.local));
function carousel(){
 $('#slides').innerHTML=featured.map((r,i)=>`<article class="slide ${i===slide?'active':''}" style="background-image:url('${img(r)}')"><div class="hero-content"><span class="badge">Receita em destaque</span><h2>${esc(r.t)}</h2><p>${esc(r.d)}</p><button class="cta" onclick="openRecipe(${r.id})">Ver receita · ${r.time} min</button></div></article>`).join('');
 $('#dots').innerHTML=featured.map((r,i)=>`<button class="dot ${i===slide?'active':''}" aria-label="Destaque ${i+1}" onclick="setSlide(${i})"></button>`).join('');
}
function setSlide(i){slide=(i+featured.length)%featured.length;document.querySelectorAll('.slide').forEach((x,n)=>x.classList.toggle('active',n===slide));document.querySelectorAll('.dot').forEach((x,n)=>x.classList.toggle('active',n===slide))}
function openRecipe(id){active=R[id];portions=active.p||1;detail();$('#modal').showModal()}
function detail(){
 const r=active;
 let ingredients=r.local?r.i.map(([a,b])=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(a*portions/r.p)+' '+b):r.ingredients||[];
 $('#details').innerHTML=`<img class="modalphoto" src="${img(r)}" alt="Foto ilustrativa"><div class="detail"><span class="tag">${esc(r.c)}</span><h2>${esc(r.t)}</h2><p class="meta">${esc(r.source)}${r.country?' · '+esc(r.country):''}${r.time?' · '+r.time+' min':''}</p><p class="photoLabel">Fotografia ilustrativa; não representa necessariamente o prato exato.</p>${r.d?'<p>'+esc(r.d)+'</p>':''}${r.local?`<div class="portion"><button onclick="portion(-1)">−</button><strong>${portions} porções</strong><button onclick="portion(1)">+</button></div>`:''}${ingredients.length?'<h3>Ingredientes</h3>'+ingredients.map(i=>'<label class="ingredient" style="display:block;margin:8px 0"><input type="checkbox"> <span>'+esc(i)+'</span></label>').join(''):''}${r.local?'<h3>Modo de preparo</h3><ol>'+r.s.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>':`<h3>Receita original</h3><p>Veja o passo a passo, quantidades completas e orientações na fonte consultada.</p><a class="source" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Abrir receita em ${esc(r.source)}</a>`}${r.country?'<p class="meta">Confira possíveis substituições de ingredientes importados antes de cozinhar.</p>':''}${r.credit?'<p class="meta">'+esc(r.credit)+'</p>':''}</div>`;
}
function portion(v){portions=Math.max(1,portions+v);detail()}
$('#nav').onclick=e=>{if(e.target.dataset.cat)choose(e.target.dataset.cat)};
$('#query').oninput=$('#time').onchange=$('#difficulty').onchange=()=>{limit=24;render()};
$('#fav').onclick=()=>{onlyFav=!onlyFav;cat='Todas';limit=24;render()};
$('#more').onclick=()=>{limit+=24;render()};
$('#surprise').onclick=()=>openRecipe(Math.floor(Math.random()*R.length));
$('#prev').onclick=()=>setSlide(slide-1);$('#next').onclick=()=>setSlide(slide+1);
$('#close').onclick=()=>$('#modal').close();$('#modal').onclick=e=>{if(e.target===$('#modal'))$('#modal').close()};
render();renderRow();carousel();setInterval(()=>{if(!document.hidden&&!$('#modal').open&&!$('#hero').hidden)setSlide(slide+1)},6500);
