// Purbakantho News Card Tool - Fixed for CORS & Generation
const bnNums = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
const bnMonths = {'Jan':'জানুয়ারি','Feb':'ফেব্রুয়ারি','Mar':'মার্চ','Apr':'এপ্রিল','May':'মে','Jun':'জুন','Jul':'জুলাই','Aug':'আগস্ট','Sep':'সেপ্টেম্বর','Oct':'অক্টোবর','Nov':'নভেম্বর','Dec':'ডিসেম্বর'};

function toBn(str) {
    if(!str) return "";
    let out = str;
    for (let k in bnMonths) out = out.replace(new RegExp(k, 'g'), bnMonths[k]);
    for (let k in bnNums) out = out.replace(new RegExp(k, 'g'), bnNums[k]);
    return out;
}

document.getElementById("snc-font-size").oninput = function() { document.getElementById("sz-n").innerText = this.value; };
let userImg = null;

document.getElementById("snc-init-trigger").onclick = function() { 
    this.style.display = "none"; 
    document.getElementById("snc-panel").style.display = "block";
    autoDetectPostImage();
};

function autoDetectPostImage() {
    const info = document.getElementById("img-info");
    const postImg = document.querySelector('.post-body img, .entry-content img, article img, .post img');
    if (postImg && postImg.src) {
        // Fix for CORS: Using weserv.nl as a proxy
        let cleanSrc = postImg.src.split('=')[0].split('?')[0];
        userImg = "https://images.weserv.nl/?url=" + encodeURIComponent(cleanSrc) + "&norefer";
        info.innerHTML = '<span style="color: green;">✅ ছবি পাওয়া গেছে</span>';
        document.getElementById("auto-load-credit").style.display = "block";
    } else {
        info.innerHTML = '<span style="color: #e60000;">⚠️ ছবি পাওয়া যায়নি</span>';
    }
}

document.getElementById("snc-img-upload").onchange = function(e) {
    if(!e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(ev) { 
        userImg = ev.target.result; 
        document.getElementById("img-info").innerText = "✅ নতুন ছবি যুক্ত হয়েছে";
        document.getElementById("img-info").style.color = "green";
    };
    reader.readAsDataURL(e.target.files[0]);
};

document.getElementById("snc-trigger").onclick = async function() {
    if (!userImg) { alert("ছবি দিন!"); return; }
    const btn = this;
    const status = document.getElementById("snc-status");
    btn.disabled = true; status.style.display = "block";

    await document.fonts.load(`bold 16px "Hind Siliguri"`);
    
    let dateEl = document.querySelector('.date-format, .published, .post-timestamp');
    let rawDate = dateEl ? dateEl.innerText.trim() : new Date().toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'});
    const finalDate = toBn(rawDate);
    const title = (document.querySelector(".entry-title, .post-title, h1")?.innerText || document.title).split('|')[0].trim();
    
    const qrBox = document.getElementById("snc-qr-raw");
    qrBox.innerHTML = "";
    new QRCode(qrBox, { text: window.location.href, width: 100, height: 100 });

    setTimeout(() => {
        generateFinalCanvas(userImg, finalDate, title, qrBox, btn, status);
    }, 1000);
};

function generateFinalCanvas(imgSource, finalDate, title, qrBox, btn, status) {
    const qrImg = qrBox.querySelector("img")?.src || "";
    const bg = document.getElementById("snc-bg-color").value;
    const brd = document.getElementById("snc-border-color").value;
    const txt = document.getElementById("snc-text-color").value;
    const stripe = document.getElementById("snc-stripe-color").value;
    const fsz = document.getElementById("snc-font-size").value + "px";

    const off = document.createElement("div");
    off.style = `width: 1000px; min-height: 1000px; position: absolute; left: -9999px; font-family: 'Hind Siliguri', sans-serif;`;
    
    off.innerHTML = `
        <div style="width:1000px; display:flex; flex-direction:column; position:relative; border:40px solid ${brd}; background:${bg}; padding-bottom:20px;">
            <div style="position:absolute; top:-24px; left:-24px; right:-24px; bottom:-24px; border:6px solid ${stripe};"></div>
            <div style="width:100%; height:540px; overflow:hidden; position:relative; border-bottom:12px solid ${brd}; background:#000;">
                <img src="${imgSource}" style="width:100%; height:100%; object-fit:cover;" crossorigin="anonymous">
                <img src="https://i.ibb.co/8CdfPmN/Purbakantho.png" style="position:absolute; top:20px; left:20px; height:110px;">
                <div style="position:absolute; bottom:15px; right:15px; background:${brd}; color:#000; padding:10px 25px; font-weight:800; font-size:24px; border-radius:5px; border:3.5px solid #000;">আপডেট: ${finalDate}</div>
            </div>
            <div style="flex:1; padding:40px; text-align:center; color:${txt}; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <h1 style="font-size:${fsz}; line-height:1.2; font-weight:800; margin-bottom:30px;">${title}</h1>
                <div style="background:#fff; color:${bg}; padding:15px 60px; border-radius:60px; font-size:32px; font-weight:800;">বিস্তারিত কমেন্টে...</div>
            </div>
            <div style="height:120px; background:#000; display:flex; justify-content:space-between; align-items:center; padding:0 60px; border-top:10px solid ${brd};">
                <span style="font-size:45px; font-weight:bold; color:${brd};">purbakantho.com</span>
                <img src="${qrImg}" style="width:85px; height:85px; border:3px solid #fff; border-radius:5px;">
            </div>
        </div>`;

    document.body.appendChild(off);

    html2canvas(off, { 
        useCORS: true, 
        allowTaint: false,
        scale: 2 
    }).then(canvas => {
        const finalImg = canvas.toDataURL("image/png");
        document.getElementById("snc-preview-img").innerHTML = `
            <img src="${finalImg}"><br>
            <a href="${finalImg}" download="Card.png" class="snc-download">💾 ডাউনলোড করুন</a>
        `;
        btn.disabled = false; status.style.display = "none";
        document.body.removeChild(off);
    }).catch(err => {
        btn.disabled = false; status.style.display = "none";
        console.error(err);
    });
}
