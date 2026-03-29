<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@700;800&display=swap" rel="stylesheet" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<style>
    #snc-main-container { text-align: center; margin: 20px auto; padding: 20px; border: 2px dashed #e60000; border-radius: 12px; background: #fff; font-family: "Hind Siliguri", sans-serif; max-width: 500px;}
    .snc-init-btn { background: #0073aa; color: #fff !important; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px;}
    .snc-gen-btn { background: #e60000; color: #fff !important; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 10px; font-size: 16px;}
    .snc-control-panel { display: none; margin-top: 20px; text-align: left; }
    .snc-control-group { display: flex; flex-wrap: wrap; gap: 10px; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 10px; }
    .snc-input-item { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 120px; }
    .snc-input-item label { font-size: 13px; color: #333; font-weight: bold;}
    .snc-color-input { height: 40px; width: 100%; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; padding: 2px;}
    #snc-preview-img img { max-width: 100%; margin-top: 20px; border-radius: 10px; border: 4px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.1);}
    .snc-download { background: #28a745; color: #fff !important; padding: 12px 25px; text-decoration: none; display: inline-block; border-radius: 6px; font-weight: bold; margin-top: 15px; font-size: 16px;}
    .snc-credit { margin-top: 10px; font-size: 14px; color: #555; }
    .snc-credit a { color: #0073aa; text-decoration: none; font-weight: bold; }
</style>

<div id="snc-main-container">
    <button type="button" id="snc-init-trigger" class="snc-init-btn">🎨 নিউজ কার্ড টুল ওপেন করুন</button>

    <div id="snc-panel" class="snc-control-panel">
        <div class="snc-control-group">
            <div class="snc-input-item"><label>কার্ড রঙ</label><input type="color" id="snc-bg-color" value="#e60000" class="snc-color-input" /></div>
            <div class="snc-input-item"><label>বর্ডার রঙ</label><input type="color" id="snc-border-color" value="#ffcc00" class="snc-color-input" /></div>
            <div class="snc-input-item"><label>বর্ডার রেখা</label><input type="color" id="snc-stripe-color" value="#e60000" class="snc-color-input" /></div>
            <div class="snc-input-item"><label>শিরোনাম রঙ</label><input type="color" id="snc-text-color" value="#ffffff" class="snc-color-input" /></div>
            <div class="snc-input-item" style="min-width: 100%;"><label>ফন্ট সাইজ: <span id="sz-n">50</span>px</label><input type="range" id="snc-font-size" min="40" max="110" value="75" style="width: 100%;" /></div>
        </div>
        
        <div style="margin-bottom: 15px; background:#fff; padding:15px; border-radius:8px; border:1px solid #eee; text-align:center;">
            <input type="file" id="snc-img-upload" accept="image/*" style="display:none;" />
            <button type="button" onclick="document.getElementById('snc-img-upload').click()" style="background:#f39c12; color:#fff; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;">📷 ছবি পরিবর্তন করুন</button>
            <div id="img-info" style="font-size:12px; margin-top:8px; font-weight:bold;">প্রস্তুত হচ্ছে...</div>
            <div id="auto-load-credit" class="snc-credit" style="display:none;">ডিজাইন : <a href="https://www.shahin.bd/" target="_blank">Shahin.bd</a></div>
        </div>

        <button type="button" id="snc-trigger" class="snc-gen-btn">🖼️ কার্ড জেনারেট করুন</button>
        <p id="snc-status" style="display:none; color: #e60000; font-weight: bold; text-align:center;">⏳ প্রসেসিং হচ্ছে, অপেক্ষা করুন...</p>
        <div id="snc-qr-raw" style="display:none;"></div>
        <div id="snc-preview-img" style="text-align:center;"></div>
    </div>
</div>

<script>
    const bnNums = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
    const bnMonths = {'Jan':'জানুয়ারি','Feb':'ফেব্রুয়ারি','Mar':'মার্চ','Apr':'এপ্রিল','May':'মে','Jun':'জুন','Jul':'জুলাই','Aug':'আগস্ট','Sep':'সেপ্টেম্বর','Oct':'অক্টোবর','Nov':'নভেম্বর','Dec':'ডিসেম্বর'};

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
        const creditDiv = document.getElementById("auto-load-credit");
        const postImg = document.querySelector('.post-body img, .entry-content img, article img, .post img');
        
        if (postImg && postImg.src) {
            userImg = "https://images.weserv.nl/?url=" + encodeURIComponent(postImg.src.split('?')[0]);
            info.innerHTML = '<span style="color: green;">✅ পোস্টের ছবি অটো-লোড হয়েছে</span>';
            creditDiv.style.display = "block"; // ছবি পাওয়া গেলে ক্রেডিট দেখাবে
        } else {
            info.innerHTML = '<span style="color: #e60000;">⚠️ ছবি পাওয়া যায়নি, ম্যানুয়ালি আপলোড করুন</span>';
            creditDiv.style.display = "block"; // ছবি না পেলেও ক্রেডিট দেখাবে
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
        if (!userImg) { alert("দয়া করে ছবি যুক্ত করুন।"); return; }
        const btn = this;
        const status = document.getElementById("snc-status");
        btn.disabled = true; status.style.display = "block";

        await document.fonts.load(`bold 16px "Hind Siliguri"`);
        await document.fonts.ready;

        let dateEl = document.querySelector('.date-format, .published, .post-timestamp');
        let rawDate = dateEl ? dateEl.innerText.trim() : new Date().toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'});
        const finalDate = toBn(rawDate);
        const title = (document.querySelector(".entry-title, .post-title, h1")?.innerText || document.title).split('|')[0].trim();
        
        const qrBox = document.getElementById("snc-qr-raw");
        qrBox.innerHTML = "";
        new QRCode(qrBox, { text: window.location.href, width: 100, height: 100 });

        setTimeout(() => {
            generateFinalCanvas(userImg, finalDate, title, qrBox, btn, status);
        }, 800);
    };

    function generateFinalCanvas(imgSource, finalDate, title, qrBox, btn, status) {
        const qrImg = qrBox.querySelector("img")?.src || "";
        const bg = document.getElementById("snc-bg-color").value;
        const brd = document.getElementById("snc-border-color").value;
        const txt = document.getElementById("snc-text-color").value;
        const stripe = document.getElementById("snc-stripe-color").value;
        const fsz = document.getElementById("snc-font-size").value + "px";

        const off = document.createElement("div");
        off.style = `width: 1000px; height: auto; min-height: 1000px; position: absolute; left: -9999px; font-family: 'Hind Siliguri', sans-serif;`;
        
        off.innerHTML = `
            <div id="final-card-render" style="width:1000px; height:auto; min-height:1000px; box-sizing:border-box; display:flex; flex-direction:column; position:relative; border: 40px solid ${brd}; background: ${bg}; font-family: 'Hind Siliguri', sans-serif;">
                <div style="position:absolute; top:-24px; left:-24px; right:-24px; bottom:-24px; border: 6px solid ${stripe}; pointer-events:none; z-index:1;"></div>
                
                <div style="width:100%; height:540px; flex-shrink: 0; overflow:hidden; position:relative; border-bottom:12px solid ${brd}; background:#000;">
                    <img src="${imgSource}" style="width:100%; height:100%; object-fit:cover;" crossorigin="anonymous">
                    <img src="https://i.ibb.co/8CdfPmN/Purbakantho.png" style="position:absolute; top:20px; left:20px; height:110px; max-width:380px; object-fit:contain; z-index:100;">
                    <div style="position:absolute; bottom:15px; right:15px; background:${brd}; color:#000; padding:10px 25px; font-weight:800; font-size:24px; border-radius:5px; border:3.5px solid #000;">আপডেট: ${finalDate}</div>
                </div>

                <div style="flex: 1 0 auto; padding: 40px; text-align:center; color:${txt}; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <h1 style="font-size:${fsz}; margin-bottom:40px; line-height:1.2; font-weight:800; font-family: 'Hind Siliguri', sans-serif; width: 100%; word-wrap: break-word;">${title}</h1>
                    <div style="background:#fff; color:${bg}; padding:15px 60px; border-radius:60px; font-size:32px; font-weight:800; box-shadow: 0 5px 15px rgba(0,0,0,0.2); flex-shrink: 0;">বিস্তারিত কমেন্টে...</div>
                </div>

                <div style="height:120px; flex-shrink: 0; background:#000; display:flex; justify-content:space-between; align-items:center; padding:0 60px; border-top:10px solid ${brd}; margin-top: auto;">
                    <span style="font-size:45px; font-weight:bold; color:${brd};">purbakantho.com</span>
                    <img src="${qrImg}" style="width:85px; height:85px; border:3px solid #fff; background:#fff; border-radius:5px;">
                </div>
            </div>`;

        document.body.appendChild(off);

        html2canvas(off, { 
            useCORS: true, 
            scale: 2,
            backgroundColor: null,
            height: off.offsetHeight,
            windowHeight: off.offsetHeight
        }).then(canvas => {
            const finalImg = canvas.toDataURL("image/png");
            document.getElementById("snc-preview-img").innerHTML = `
                <img src="${finalImg}"><br>
                <a href="${finalImg}" download="Purbakantho_Card.png" class="snc-download">💾 ডাউনলোড করুন</a>
                <div class="snc-credit">ডিজাইন : <a href="https://www.shahin.bd/" target="_blank">Shahin.bd</a></div>
            `;
            btn.disabled = false; status.style.display = "none";
            document.body.removeChild(off);
        }).catch(err => {
            btn.disabled = false; status.style.display = "none";
        });
    }
</script>
