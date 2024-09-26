document.addEventListener("DOMContentLoaded", () => {
    initializeContainers();
    handleUserAvailStatus();
    setupUnity();
});

const container = document.querySelector("#unity-container");
const canvas = document.querySelector("#unity-canvas");
const loadingBar = document.querySelector("#unity-loading-bar");
const progressBarFull = document.querySelector("#unity-progress-bar-full");
const fullscreenButton = document.querySelector("#unity-fullscreen-button");
const warningBanner = document.querySelector("#unity-warning");
const resultContainer = document.getElementById('result-container');
const userDetailContainer = document.getElementById('user-details-form');
const limitOverContainer = document.getElementById("limit-passed");
const winnerLabelElement = document.getElementById("winner-item");

function initializeContainers() {
    resultContainer.style.display = 'none';
    limitOverContainer.style.display = 'none';
}

function handleUserAvailStatus() {
    const isAvailed = localStorage.getItem("isAvailed");
    if (isAvailed === "true") {
        userDetailContainer.style.display = "none";
        limitOverContainer.style.display = 'block';
    }
}

function setupUnity() {
    const buildUrl = "Build";
    const config = {
        dataUrl: `${buildUrl}/unity-spin-the-wheel.data`,
        frameworkUrl: `${buildUrl}/unity-spin-the-wheel.framework.js`,
        codeUrl: `${buildUrl}/unity-spin-the-wheel.wasm`,
        streamingAssetsUrl: "StreamingAssets",
        companyName: "DefaultCompany",
        productName: "SpinTheWheel",
        productVersion: "1.0",
        showBanner: unityShowBanner,
    };

    adjustForMobile();

    loadingBar.style.display = "none";

    const script = document.createElement("script");
    script.src = `${buildUrl}/unity-spin-the-wheel.loader.js`;
    script.onload = () => {
        createUnityInstance(canvas, config, updateProgressBar).then((unityInstance) => {
            loadingBar.style.display = "none";
            fullscreenButton.onclick = () => document.makeFullscreen('unity-container');
        }).catch((message) => alert(message));
    };
    document.body.appendChild(script);
}

function adjustForMobile() {
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
        document.head.appendChild(meta);
        container.className = "unity-mobile";
        canvas.className = "unity-mobile";
    } else {
        setCanvasSize();
    }
}

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function updateProgressBar(progress) {
    progressBarFull.style.width = `${100 * progress}%`;
}

function unityShowBanner(msg, type) {
    const div = document.createElement('div');
    div.innerHTML = msg;
    warningBanner.appendChild(div);

    if (type === 'error') {
        div.style = 'background: red; padding: 10px;';
    } else if (type === 'warning') {
        div.style = 'background: yellow; padding: 10px;';
        setTimeout(() => removeBanner(div), 5000);
    }

    updateBannerVisibility();
}

function updateBannerVisibility() {
    warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
}

function removeBanner(div) {
    warningBanner.removeChild(div);
    updateBannerVisibility();
}

function showResultView() {
    localStorage.setItem("isAvailed", "true");
    let winnerLabel = localStorage.getItem("winner");
    console.log("Winner labnel", winnerLabel);
    winnerLabelElement.innerHTML = winnerLabel;
    container.style.display = 'none';
    document.body.removeChild(document.querySelector(`script[src*="unity-spin-the-wheel.loader.js"]`));
    resultContainer.style.display = 'block';
}

function hideUserDetailsForm() {
    userDetailContainer.style.display = 'none';
    container.style.display = 'block';
}

function submitUserDetails() {
    const username = document.getElementById('username').value;
    const mobile = document.getElementById('mobile').value;

    localStorage.setItem("username", username);
    localStorage.setItem("mobile", mobile);

    hideUserDetailsForm();
}

function copyToClipboard() {
    const copyText = document.getElementById("coupon-text").innerText;

    const elem = document.createElement("textarea");
    document.body.appendChild(elem);
    elem.value = copyText;
    elem.select();
    document.execCommand("copy");
    document.body.removeChild(elem);

    const message = document.getElementById("message");
    message.innerText = "Copied";

    setTimeout(() => message.innerText = "", 2000);
}
