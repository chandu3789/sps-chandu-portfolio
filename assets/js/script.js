document.addEventListener("DOMContentLoaded",()=>{
  const canvas=document.getElementById("fx-canvas"),ctx=canvas.getContext("2d");
  const webs=[];let active=null;
  function resize(){const d=window.devicePixelRatio||1;canvas.width=innerWidth*d;canvas.height=innerHeight*d;canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";ctx.setTransform(d,0,0,d,0,0)}
  resize();addEventListener("resize",resize);

  function thwip(x,y){
    const e=document.createElement("div");e.className="thwip-text";e.textContent=["THWIP!","ZAP!","WHACK!"][Math.floor(Math.random()*3)];
    e.style.left=x+"px";e.style.top=y+"px";document.body.appendChild(e);
    requestAnimationFrame(()=>{e.style.opacity=1;e.style.transform=`translate(-50%,-50%) scale(1.3) rotate(${(Math.random()-.5)*25}deg)`});
    setTimeout(()=>{e.style.opacity=0;e.style.transform="translate(-50%,-50%) scale(.6)";setTimeout(()=>e.remove(),250)},320);
  }
  function down(x,y){
    const w={a:{x,y},b:{x,y},live:true,age:0,op:1};
    active=w;
    webs.push(w);
    thwip(x,y);
    // Keep each shot visible for 10 seconds, then fade it out.
    setTimeout(()=>{
      w.live=false;
      w.age=1.5;
      if(active===w) active=null;
    },2000);
  }
  function move(x,y){if(active)active.b={x,y}}
  function up(){active=null}
  addEventListener("mousedown",e=>down(e.clientX,e.clientY));addEventListener("mousemove",e=>move(e.clientX,e.clientY));addEventListener("mouseup",up);
  addEventListener("touchstart",e=>down(e.touches[0].clientX,e.touches[0].clientY),{passive:true});addEventListener("touchmove",e=>move(e.touches[0].clientX,e.touches[0].clientY),{passive:true});addEventListener("touchend",up,{passive:true});

  function web(x1,y1,x2,y2,op){
    ctx.strokeStyle=`rgba(185,18,23,${op*.35})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    const r=24;ctx.strokeStyle=`rgba(185,18,23,${op*.6})`;ctx.lineWidth=1;
    for(let ring=.35;ring<=1;ring+=.25){ctx.beginPath();for(let i=0;i<=12;i++){const a=i/12*Math.PI*2,rr=r*ring,px=x1+Math.cos(a)*rr,py=y1+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke()}
    ctx.beginPath();ctx.arc(x2,y2,5,0,Math.PI*2);ctx.fillStyle=`rgba(185,18,23,${op})`;ctx.fill()
  }
  function loop(){ctx.clearRect(0,0,innerWidth,innerHeight);for(let i=webs.length-1;i>=0;i--){const w=webs[i];if(!w.live){w.age+=.016;if(w.age>1.5)w.op=Math.max(0,1-(w.age-1.5)*2)}if(w.op>0)web(w.a.x,w.a.y,w.b.x,w.b.y,w.op);else webs.splice(i,1)}requestAnimationFrame(loop)}
  loop();

  // Highlight the section currently being viewed.
  const navLinks=[...document.querySelectorAll(".topbar ul a")];
  const navSections=navLinks.map(a=>document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        navLinks.forEach(a=>a.classList.remove("nav-active"));
        const current=navLinks.find(a=>a.getAttribute("href")==="#"+entry.target.id);
        if(current) current.classList.add("nav-active");
      }
    });
  },{rootMargin:"-30% 0px -55% 0px",threshold:0});
  navSections.forEach(s=>observer.observe(s));

  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray(".section-fade").forEach((el,i)=>gsap.from(el,{scrollTrigger:{trigger:el,start:"top 88%"},y:45,opacity:0,duration:.8,delay:i*.03,ease:"power3.out"}));
    gsap.from(".hero-copy > *",{y:35,opacity:0,stagger:.1,duration:.8,ease:"back.out(1.5)"});
    gsap.from(".portrait-frame",{scale:.88,opacity:0,rotation:2,duration:1.1,delay:.15,ease:"power3.out"});
    gsap.utils.toArray(".skill-card,.project-card").forEach((el,i)=>gsap.from(el,{scrollTrigger:{trigger:el,start:"top 92%"},y:25,opacity:0,duration:.6,delay:(i%4)*.06,ease:"power2.out"}));
  }
});

  // Contact form: send directly through Web3Forms (no Gmail/Outlook popup).
  const WORK_EMAIL="purnasaichandusanapala13@gmail.com";
  const contactForm=document.getElementById("contact-form");
  const formStatus=document.getElementById("form-status");
  if(contactForm){
    contactForm.addEventListener("submit",async e=>{
      e.preventDefault();
      const submitBtn=contactForm.querySelector(".send-btn");
      const originalText=submitBtn.innerHTML;
      submitBtn.disabled=true;
      submitBtn.innerHTML='SENDING... <i class="fa-solid fa-spinner fa-spin"></i>';
      if(formStatus) formStatus.textContent="";
      try{
        const response=await fetch(contactForm.action,{method:"POST",body:new FormData(contactForm),headers:{Accept:"application/json"}});
        const result=await response.json();
        if(response.ok && result.success){
          contactForm.reset();
          if(formStatus) formStatus.textContent="MESSAGE SENT ✓ — I'll get back to you soon.";
        }else throw new Error(result.message||"Unable to send message.");
      }catch(error){
        if(formStatus) formStatus.textContent="MESSAGE NOT SENT — Please try again.";
      }finally{
        submitBtn.disabled=false;
        submitBtn.innerHTML=originalText;
      }
    });
  }

  // Copy the professional email.
  const copyEmail=document.getElementById("copy-email");
  if(copyEmail){
    copyEmail.addEventListener("click",async()=>{
      try{
        await navigator.clipboard.writeText(WORK_EMAIL);
        copyEmail.innerHTML='<i class="fa-solid fa-check"></i> EMAIL COPIED';
        setTimeout(()=>copyEmail.innerHTML='<i class="fa-solid fa-copy"></i> COPY WORK EMAIL',1800);
      }catch(err){
        window.prompt("Copy this work email:",WORK_EMAIL);
      }
    });
  }

  // Certificate Modal / Lightbox
  const certModal = document.getElementById("cert-modal");
  const certModalImg = document.getElementById("cert-modal-img");
  const certCloseBtn = document.querySelector(".cert-modal-close");
  const certOverlay = document.querySelector(".cert-modal-overlay");

  function openCert(src, altText) {
    if (!certModal || !certModalImg) return;
    certModalImg.src = src;
    certModalImg.alt = altText || "Certificate";
    certModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCert() {
    if (!certModal) return;
    certModal.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => {
      if (!certModal.classList.contains("active") && certModalImg) {
        certModalImg.src = "";
      }
    }, 350);
  }

  document.querySelectorAll(".cert-view-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const certSrc = btn.getAttribute("data-cert");
      const certTitle = btn.closest(".cert-item")?.querySelector(".cert-name")?.textContent || "Certificate";
      if (certSrc) openCert(certSrc, certTitle);
    });
  });

  if (certCloseBtn) certCloseBtn.addEventListener("click", closeCert);
  if (certOverlay) certOverlay.addEventListener("click", closeCert);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && certModal?.classList.contains("active")) {
      closeCert();
    }
  });
