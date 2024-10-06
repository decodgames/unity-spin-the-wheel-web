document.addEventListener("DOMContentLoaded", () => {
    initializeContainers();
    handleUserAvailStatus();
    adjustForMobile();

    // Clear error message on input
    document.getElementById('username').addEventListener('input', () => {
        const usernameError = document.getElementById('username-error');
        usernameError.textContent = "";
    });

    document.getElementById('mobile').addEventListener('input', function (e) {
        const mobileError = document.getElementById('mobile-error');
        mobileError.textContent = "";

        // Access the value using e.target.value
        e.target.value = e.target.value.replace(/\D/g, '');

        // Limit the input to 10 digits
        if (e.target.value.length > 10) {
            e.target.value = e.target.value.slice(0, 10);
        }
    });

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
const imageElement = document.getElementById("winner-item");
const pElement = document.getElementById("winner-label");
const p_DetailElement = document.getElementById("winner-detail");
const couponText = document.getElementById("coupon-text");
const couponDetailsDiv = document.getElementById('coupon-details');
const ctaAnchorElemt = document.getElementById('cta');
const imageResultElement = document.getElementById('result-item');
const resultDesciptionResultElement = document.getElementById('result-description');

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

    // Show the loading bar
    loadingBar.style.display = "block";
    progressBarFull.style.width = "0%"; // Reset progress

    const script = document.createElement("script");
    script.src = `${buildUrl}/unity-spin-the-wheel.loader.js`;

    script.onload = () => {
        createUnityInstance(canvas, config, (progress) => {
            updateProgressBar(progress);  // Update the progress bar as the game loads

            if (progress >= 1) {
                // Hide the loading bar when fully loaded
                loadingBar.style.display = "none";
            }
        }).then((unityInstance) => {
            fullscreenButton.onclick = () => unityInstance.SetFullscreen(1); // Enable fullscreen functionality
        }).catch((message) => alert(message)); // Catch and display any error during loading
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
    // Set local storage to indicate that the coupon has been availed
    localStorage.setItem("isAvailed", "true");

    // Get winner information and coupon details from localStorage
    const winnerLabel = localStorage.getItem("winner");
    const couponDetails = JSON.parse(localStorage.getItem("couponDetails"));
    const couponDescription = JSON.parse(localStorage.getItem("couponDescription"));

    if (!couponDetails || !couponDescription) {
        console.error("Coupon details or description missing from localStorage.");
        return;
    }

    if (couponDetails.status) {
        displayCouponDetails(winnerLabel, couponDetails, couponDescription);
    } else {
        displayLimitOverMessage(couponDetails.message);
    }

    // Hide the game container and remove the game script
    container.style.display = 'none';
    removeGameScript();
}

function displayCouponDetails(winnerLabel, couponDetails, couponDescription) {
    const termsAndConditions = couponDescription.data.campaign_details.terms_and_conditions;
    const howToUse = couponDescription.data.campaign_details.how_to_use;

    // Display coupon code
    couponText.innerText = couponDetails.data.coupon_code;

    // Append how to use and terms & conditions to the coupon details div
    couponDetailsDiv.innerHTML += howToUse;
    couponDetailsDiv.innerHTML += termsAndConditions;

    // Display winner details
    const winnerObject = getWinner(winnerLabel);
    const imageSource = `https://decodgames.github.io/assets/${winnerObject.name}.png`;

    pElement.innerText = winnerLabel;
    p_DetailElement.innerHTML = `You Won ${winnerObject.value}% Off On ${winnerLabel} On Your Next Order`;
    imageElement.src = imageSource;

    // Set CTA link (if valid)
    const link = couponDetails.data.isCTAvalid ? couponDetails.data.CTAredirect : couponDetails.data.redirect_url;
    ctaAnchorElemt.href = link;

    // Display the result container
    resultContainer.style.display = 'flex';
}

function displayLimitOverMessage(message) {
    // Display limit over message
    resultDesciptionResultElement.innerText = message;

    // Hide result container and show limit over container
    resultContainer.style.display = "none";
    limitOverContainer.style.display = 'block';
}

function removeGameScript() {
    // Remove the Unity spin the wheel game script from the DOM
    const unityScript = document.querySelector(`script[src*="unity-spin-the-wheel.loader.js"]`);
    if (unityScript) {
        document.body.removeChild(unityScript);
    }
}


function hideUserDetailsForm() {
    userDetailContainer.style.display = 'none';
    container.style.display = 'block';
}

function submitUserDetails() {
    const username = document.getElementById('username').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const usernameError = document.getElementById('username-error');
    const mobileError = document.getElementById('mobile-error');

    // Reset error messages
    // usernameError.style.display = 'none';
    // mobileError.style.display = 'none';

    usernameError.textContent = "";
    mobileError.textContent = "";

    let isValid = true;

    // Validate username
    if (!username) {
        usernameError.textContent = "Please enter your name.";
        // usernameError.style.display = 'block';
        isValid = false;
    }

    // Validate mobile number
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
        mobileError.textContent = "Please enter a valid 10-digit mobile number.";
        // mobileError.style.display = 'block';
        isValid = false;
    }

    // If the form is valid, proceed with submission
    if (isValid) {
        localStorage.setItem("username", username);
        localStorage.setItem("mobile", mobile);

        if (saveUserDetails()) {
            hideUserDetailsForm();
            setupUnity();
        } else {
            localStorage.setItem("isAvailed", "true");
            handleUserAvailStatus();
        }


        // resultContainer.style.display = 'block';
    }
}

function saveUserDetails() {
    return true;
}

function copyCouponToClipboard() {
    const copyText = couponText.innerText;

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


function getWinner(segment) {
    switch (segment) {
        case "Fish Curry":
            return {
                name: "fish-curry",
                value: "20"
            };
        case "Vanilla Shake":
            return {
                name: "vanilla-shake",
                value: "10"
            };
        case "Vanilla Lassi":
            return {
                name: "vanilla-lase",
                value: "10"
            };
        case "Paneer Tikka":
            return {
                name: "paneer-tikka",
                value: "20"
            };
        case "Egg Fried Rice":
            return {
                name: "egg-fried-rice",
                value: "15"
            };
        case "Parotta Salna":
            return {
                name: "parotta-salna",
                value: "20"
            };
        default:
            return null;
    }
}