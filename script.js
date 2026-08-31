(()=>{
  "use strict";
  const wheel=document.getElementById("wheel");
  const start=document.getElementById("start");
  const status=document.getElementById("status");
  const reward=document.getElementById("reward");
  const claim=document.getElementById("claim");

  // Replace this with your sports affiliate URL.
  const CLAIM_URL="https://record.betzillopartners.com/_Lu3m47EoZY7T2Fu8bIPGIGNd7ZgqdRLk/19/";
  const STORAGE_KEY="bz-sports-wheel-claimed-v1";
  const WINNING_INDEX=1; // Bet $10 Get $50 — this is the only possible result.
  let spinning=false;

  function finalRotationFor(index){
    const segment=360/10;
    const segmentCentre=index*segment;
    const fullTurns=6*360;
    return fullTurns-segmentCentre;
  }

  function showClaimed(){
    status.textContent="YOUR REWARD IS READY";
    start.textContent="VIEW REWARD";
  }

  if(localStorage.getItem(STORAGE_KEY)==="1") showClaimed();

  start.addEventListener("click",()=>{
    if(localStorage.getItem(STORAGE_KEY)==="1"){
      reward.hidden=false;
      return;
    }
    if(spinning) return;
    spinning=true;
    start.disabled=true;
    status.textContent="SPINNING…";
    document.body.classList.add("spinning");
    wheel.style.transform=`rotate(${finalRotationFor(WINNING_INDEX)}deg)`;

    window.setTimeout(()=>{
      document.body.classList.remove("spinning");
      localStorage.setItem(STORAGE_KEY,"1");
      spinning=false;
      start.disabled=false;
      showClaimed();
      reward.hidden=false;
    },5700);
  });

  claim.addEventListener("click",()=>{
    claim.disabled=true;
    claim.textContent="LOADING…";
    window.location.assign(CLAIM_URL);
  });
})();
