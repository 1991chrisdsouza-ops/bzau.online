const prizes = [
  "No Win", "Bet $10 Get $50", "$1,000 Cash", "$250 Cash",
  "100% Match Up To $500", "100 Free Spins", "50 Free Spins",
  "$5 Free Play", "$2 Free Play", "10 Free Spins"
];

const allowedWinners = [1, 4];
const wheel = document.querySelector("#wheel");
const start = document.querySelector("#start");
const statusText = document.querySelector("#status");
const reward = document.querySelector("#reward");
const rewardName = document.querySelector("#reward-name");
const claimButton = document.querySelector("#claim");

let spinning = false;
let state = {
  played:
    localStorage.getItem("spinClaimed") === "yes" ||
    localStorage.getItem("spinClaimed-v2") === "yes",
  winner: Number(localStorage.getItem("spinWinner"))
};

function showSavedReward(winner) {
  const validWinner = allowedWinners.includes(Number(winner))
    ? Number(winner)
    : 1;

  state.winner = validWinner;
  localStorage.setItem("spinWinner", String(validWinner));
  rewardName.textContent = prizes[validWinner];
  reward.hidden = false;
  start.disabled = true;
  start.textContent = "CLAIM NOW";
  statusText.textContent = "YOUR OFFER IS READY";
}

/* Remove notification subscriptions installed by older site versions. */
async function removeOldPushSetup() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      const subscription = await registration.pushManager?.getSubscription();
      if (subscription) await subscription.unsubscribe();
      await registration.unregister();
    }
    localStorage.removeItem("pushAccepted");
  } catch (error) {
    console.warn("Old push cleanup failed:", error);
  }
}

async function loadState() {
  try {
    const response = await fetch("/api/status", { cache: "no-store" });
    if (response.ok) {
      const serverState = await response.json();
      state.played = serverState.played;
      if (allowedWinners.includes(Number(serverState.winner))) {
        state.winner = Number(serverState.winner);
      }
    }
  } catch (error) {
    console.error("Status check failed:", error);
  }

  if (state.played) {
    showSavedReward(state.winner);
  }
}

async function requestSpin() {
  try {
    const response = await fetch("/api/spin", { method: "POST" });
    if (response.ok) return await response.json();
  } catch (error) {
    console.error("Spin request failed:", error);
  }

  if (state.played) return { allowed: false };
  localStorage.setItem("spinClaimed", "yes");
  return { allowed: true, fallback: true };
}

start.onclick = async function () {
  if (spinning || state.played) return;

  start.disabled = true;
  statusText.textContent = "CHECKING...";
  const claim = await requestSpin();

  if (!claim.allowed) {
    state.played = true;
    statusText.textContent = "ALREADY CLAIMED";
    showSavedReward(claim.winner || state.winner);
    return;
  }

  state.played = true;
  localStorage.setItem("spinClaimed", "yes");
  spinning = true;
  statusText.textContent = "GOOD LUCK!";

  const winner = allowedWinners.includes(Number(claim.winner))
    ? Number(claim.winner)
    : allowedWinners[Math.floor(Math.random() * allowedWinners.length)];
  state.winner = winner;
  localStorage.setItem("spinWinner", String(winner));
  const landing = 360 - winner * 36 - 18;
  wheel.style.transform = `rotate(${1440 + landing}deg)`;

  setTimeout(function () {
    statusText.textContent = "REWARD READY";
    start.textContent = "CLAIM NOW";
    rewardName.textContent = prizes[winner];
    reward.hidden = false;
    spinning = false;
  }, 4400);
};

claimButton.onclick = function () {
  if (typeof fbq === "function") {
    fbq("track", "Lead");
    fbq("trackCustom", "ClaimReward", { offer: rewardName.textContent });
  }

  window.location.href =
    "https://record.betzillopartners.com/_Lu3m47EoZY6ZM7hnoUx_dWNd7ZgqdRLk/16/";
};

removeOldPushSetup();
loadState();