// box-progress.js — box-progress widget for a Squarespace shop.
// Paste this between <script> and </script> in Settings > Developer Tools >
// Code Injection > Footer. See README.md.

(function () {

    // ======================= CONFIG: edit these values =======================
    const CONFIG = {
        // Pages on your own site
        SHOP_URL: '/shop',              // where "Back to Shop" and the widget go
        CART_URL: '/cart',              // where the "Cart" button goes

        // Items per box. Checkout is greyed out until the cart quantity
        // is a multiple of this number.
        BOX_SIZE: 6,

        // At this quantity or more, the widget asks the customer to email you.
        BULK_LIMIT: 97,
        BULK_EMAIL: 'orders@example.com',

        // Optional small picture shown in the widget. Leave '' for no picture.
        PRODUCT_IMAGE_URL: '',

        // EXAMPLE discount values (made up). They only change the widget text
        // and the "Estimated Total" on the cart page. The real discounts must
        // be set up in Squarespace: Commerce > Discounts. Make these match.
        EXAMPLE_FIRST_BOX_DISCOUNT: 1.00,     // flat amount saved for 1 full box
        EXAMPLE_PER_ITEM_DISCOUNT: 0.50,      // amount saved per item ...
        EXAMPLE_PER_ITEM_FROM_QTY: 12,        // ... once the cart has this many items

        CURRENCY: 'USD',
        LOCALE: 'en-US',

        // How often to check the cart, in milliseconds (paused while the tab is hidden)
        CART_CHECK_MS: 3000,

        // Confetti colors when a box is filled
        CONFETTI_COLORS: [
            '#F1C40F', // yellow
            '#27AE60', // green
            '#0055FF', // blue
            '#FFFFFF', // white
            '#DDDDDD'  // light grey
        ]
    };
    // ========================================================================

    window.addEventListener('load', function() {

        const BOX_SIZE = CONFIG.BOX_SIZE;
        const BULK_LIMIT = CONFIG.BULK_LIMIT;
        const BULK_EMAIL = CONFIG.BULK_EMAIL;

        // 1. CREATE WIDGET UI
        const imageHtml = CONFIG.PRODUCT_IMAGE_URL
            ? `<img src="${CONFIG.PRODUCT_IMAGE_URL}" class="bp-image" alt="">`
            : '';
        const widget = document.createElement('div');
        widget.id = 'box-progress-widget';
        // Keyboard access: the widget acts as a button (Enter or Space).
        widget.setAttribute('role', 'button');
        widget.tabIndex = 0;
        widget.innerHTML = `
            <div class="bar-content">
                <div class="bar-left">
                    ${imageHtml}
                    <div class="bar-text">
                        <div id="promo-main">Start Your Box <div class="min-msg">Minimum Order: ${BOX_SIZE}</div></div>
                        <div id="promo-sub">Buy ${BOX_SIZE} Save ${formatMoney(calcSavings(BOX_SIZE))}! Buy ${CONFIG.EXAMPLE_PER_ITEM_FROM_QTY} Save ${formatMoney(calcSavings(CONFIG.EXAMPLE_PER_ITEM_FROM_QTY))}!</div>
                    </div>
                </div>
                <div class="bar-right">
                    <div id="promo-count">0</div>
                </div>
            </div>
            <div id="progress-indicator"></div>
        `;
        document.body.appendChild(widget);

        // --- ANIMATION TRIGGER ---
        setTimeout(() => {
            widget.classList.add('widget-visible');
            setTimeout(() => {
                widget.classList.add('widget-interactive');
            }, 1000);
        }, 500);

        const countBadge = document.getElementById('promo-count');

        // 2. HELPER: Native Cart Reader
        function getNativeHeaderCount() {
            const selectors = ['.sqs-cart-quantity', '.icon-cart-quantity', '.cart-quantity'];
            for (let sel of selectors) {
                const el = document.querySelector(sel);
                if (el) {
                    const num = parseInt(el.textContent.trim());
                    if (!isNaN(num) && num > 0) return num;
                }
            }
            return 0;
        }

        // 3. HELPER: Calculate Savings (estimate only, see CONFIG)
        function calcSavings(q) {
            if (q < BOX_SIZE) return 0;                                                   // less than 1 box: no discount
            if (q < CONFIG.EXAMPLE_PER_ITEM_FROM_QTY) return CONFIG.EXAMPLE_FIRST_BOX_DISCOUNT; // flat amount
            return q * CONFIG.EXAMPLE_PER_ITEM_DISCOUNT;                                  // per item
        }

        function formatMoney(amount) {
            return amount.toLocaleString(CONFIG.LOCALE, {style:'currency', currency: CONFIG.CURRENCY});
        }

        // 4. HELPER: Confetti
        function fireConfetti() {
            const isMobile = window.innerWidth < 600;
            const originX = isMobile ? 0.5 : 0.9;
            const originY = 0.9;

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: originY, x: originX },
                colors: CONFIG.CONFETTI_COLORS,
                zIndex: 100000,
                disableForReducedMotion: true
            });
        }

        // 5. HELPER: Inject Message ABOVE Checkout Button
        function injectCheckoutWarning() {
            const btns = document.querySelectorAll('.cart-checkout-button, [data-test="checkout-button"]');
            btns.forEach(btn => {
                const parent = btn.parentNode;
                if (!parent.querySelector('.qty-warning-msg')) {
                    const msg = document.createElement('div');
                    msg.className = 'qty-warning-msg';
                    msg.innerText = `Please order in multiples of ${BOX_SIZE}\nFull boxes only`;
                    parent.insertBefore(msg, btn);
                }
            });
        }

        // 6. HELPER: Inject Navigation Buttons
        function injectNavButtons() {
            if (document.getElementById('custom-nav-wrapper')) return;
            const titleElement = document.querySelector('h1.ProductItem-details-title, h1.product-title, .ProductItem-summary h1, .product-item h1');

            if (titleElement) {
                const wrapper = document.createElement('div');
                wrapper.id = 'custom-nav-wrapper';

                const backBtn = document.createElement('a');
                backBtn.className = 'nav-btn back-btn';
                backBtn.href = CONFIG.SHOP_URL;
                backBtn.innerHTML = '← Back to Shop';

                const cartBtn = document.createElement('a');
                cartBtn.className = 'nav-btn cart-btn';
                cartBtn.href = CONFIG.CART_URL;
                cartBtn.innerHTML = `
                    CART
                    <svg class="nav-cart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                `;

                wrapper.appendChild(backBtn);
                wrapper.appendChild(cartBtn);
                titleElement.parentNode.insertBefore(wrapper, titleElement);
            }
        }

        // --- CART PAGE INJECTION LOGIC ---
        function updateCartPageDisplay(qty) {
            if (!document.querySelector('.cart-container') && !document.querySelector('.sqs-cart-container')) return;
            const subtotalEl = document.querySelector('.cart-subtotal-price, .sqs-cart-subtotal .price, [data-test="cart-subtotal"] .value');
            if (!subtotalEl) return;

            const discountAmount = calcSavings(qty);
            let discountRow = document.getElementById('custom-discount-row');
            let totalRow = document.getElementById('custom-total-row');

            if (discountAmount > 0) {
                let rawSub = subtotalEl.textContent.replace(/[^0-9.-]+/g,"");
                let subtotalVal = parseFloat(rawSub);
                if (isNaN(subtotalVal)) return;

                let finalTotal = subtotalVal - discountAmount;

                if (!discountRow) {
                    discountRow = document.createElement('div');
                    discountRow.id = 'custom-discount-row';
                    discountRow.className = 'custom-cart-row';
                    subtotalEl.parentNode.parentNode.appendChild(discountRow);
                }
                if (!totalRow) {
                    totalRow = document.createElement('div');
                    totalRow.id = 'custom-total-row';
                    totalRow.className = 'custom-cart-row';
                    subtotalEl.parentNode.parentNode.appendChild(totalRow);
                }

                discountRow.innerHTML = `<span>Quantity Discount Applied:</span> <span class="custom-discount-val">-${formatMoney(discountAmount)}</span>`;
                totalRow.innerHTML = `<span>Estimated Total:</span> <span class="custom-total-val">${formatMoney(finalTotal)}</span>`;
                document.body.classList.add('has-custom-discount');
            } else {
                if (discountRow) discountRow.remove();
                if (totalRow) totalRow.remove();
                document.body.classList.remove('has-custom-discount');
            }
        }

        // 7. THE LOGIC ENGINE
        let currentQty = 0;
        let lastKnownFullBoxes = -1;

        function updateWidget() {
            injectCheckoutWarning();
            injectNavButtons();

            fetch('/api/commerce/cart?t=' + Date.now())
            .then(response => response.json())
            .then(data => {
                let qty = 0;
                if (data && typeof data.totalQuantity !== 'undefined') {
                    qty = parseInt(data.totalQuantity);
                }
                if (qty === 0 || isNaN(qty)) {
                    const nativeQty = getNativeHeaderCount();
                    if (nativeQty > 0) qty = nativeQty;
                }
                if (isNaN(qty)) qty = 0;

                currentQty = qty;
                countBadge.textContent = qty;

                updateCartPageDisplay(qty);

                const currentFullBoxes = Math.floor(qty / BOX_SIZE);

                if (lastKnownFullBoxes !== -1) {
                    const boxesGained = currentFullBoxes - lastKnownFullBoxes;
                    if (boxesGained > 0) {
                        for (let i = 0; i < boxesGained; i++) {
                            setTimeout(fireConfetti, i * 300);
                        }
                    }
                }
                lastKnownFullBoxes = currentFullBoxes;

                const remainder = qty % BOX_SIZE;
                const isPerfect = (remainder === 0 && qty > 0);
                const fullBoxes = Math.floor(qty / BOX_SIZE);

                let mainMsg = "";
                let subMsg = "";
                let theme = "neutral";
                let pct = 0;

                if (qty >= BULK_LIMIT) {
                    theme = "bulk-order";
                    mainMsg = "Contact us for your custom discount";
                    subMsg = `<a href="mailto:${BULK_EMAIL}" class="email-link">${BULK_EMAIL}</a>`;
                    document.body.classList.add('cart-locked');
                    pct = 100;
                } else if (qty === 0) {
                    theme = "neutral";
                    mainMsg = `Start Your Box <div class="min-msg">Minimum Order: ${BOX_SIZE}</div>`;
                    subMsg = `Buy ${BOX_SIZE} Save ${formatMoney(calcSavings(BOX_SIZE))}!`;
                    document.body.classList.remove('cart-locked');
                } else if (isPerfect) {
                    document.body.classList.remove('cart-locked');
                    const currentSave = calcSavings(qty);
                    const nextTargetQty = qty + BOX_SIZE;
                    const nextSave = calcSavings(nextTargetQty);

                    if (nextTargetQty >= BULK_LIMIT) {
                        // last full box before the bulk limit
                        theme = "perfect";
                        mainMsg = `${fullBoxes} Boxes Perfect!`;
                        subMsg = `💰 You saved ${formatMoney(currentSave)}!`;
                    } else if (qty === BOX_SIZE) {
                        theme = "success";
                        mainMsg = "1 Box Full!";
                        subMsg = `You saved ${formatMoney(currentSave)}! Add ${BOX_SIZE} more to save ${formatMoney(nextSave)}!`;
                    } else {
                        theme = "perfect";
                        mainMsg = `${fullBoxes} Boxes Perfect!`;
                        subMsg = `💰 Saved ${formatMoney(currentSave)}. Add ${BOX_SIZE} to save ${formatMoney(nextSave)}!`;
                    }
                    pct = 100;
                } else {
                    document.body.classList.add('cart-locked');
                    theme = "locked";
                    const needed = BOX_SIZE - remainder;
                    const nextTargetQty = (fullBoxes + 1) * BOX_SIZE;
                    const nextSave = calcSavings(nextTargetQty);

                    if (qty < BOX_SIZE) {
                        mainMsg = `Box Incomplete <div class="min-msg">Minimum Order: ${BOX_SIZE}</div>`;
                        subMsg = `Add ${needed} to finish Box #1`;
                    } else {
                        mainMsg = `Finish Box #${fullBoxes + 1}`;
                        subMsg = `Add ${needed} to UNLOCK ${formatMoney(nextSave)} OFF!`;
                    }
                    pct = (remainder / BOX_SIZE) * 100;
                }

                widget.className = `theme-${theme} widget-visible widget-interactive`;
                const mainText = document.getElementById('promo-main');
                const subText = document.getElementById('promo-sub');
                const progressBar = document.getElementById('progress-indicator');
                if(mainText) mainText.innerHTML = mainMsg;
                if(subText) subText.innerHTML = subMsg;
                if(progressBar) progressBar.style.width = pct + "%";

            })
            .catch(err => console.error(err));
        }

        // Check the cart now, then every CONFIG.CART_CHECK_MS while the tab is visible.
        let pollTimer = null;
        function startPolling() {
            if (pollTimer) return;
            updateWidget();
            pollTimer = setInterval(updateWidget, CONFIG.CART_CHECK_MS);
        }
        function stopPolling() {
            clearInterval(pollTimer);
            pollTimer = null;
        }
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopPolling();
            else startPolling();
        });
        if (!document.hidden) startPolling();

        function activateWidget() {
            if (currentQty >= BULK_LIMIT) {
                window.location.href = `mailto:${BULK_EMAIL}`;
                return;
            }
            window.location.assign(CONFIG.SHOP_URL);
        }

        widget.addEventListener('click', (e) => {
            if (e.target.closest('#custom-nav-wrapper')) return;
            if (e.target.tagName === 'A') return;
            e.preventDefault();
            activateWidget();
        });

        widget.addEventListener('keydown', (e) => {
            if (e.target !== widget) return; // let the email link handle its own keys
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activateWidget();
            }
        });
    });
})();

// ---------------------------------------------------------------------------
// canvas-confetti v1.6.0 (minified), https://github.com/catdad/canvas-confetti
//
// ISC License
//
// Copyright (c) 2020, Kiril Vatev
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
// ---------------------------------------------------------------------------
!function(t,e){!function t(e,n,a,i){var o=!!(e.Worker&&e.Blob&&e.Promise&&e.OffscreenCanvas&&e.OffscreenCanvasRenderingContext2D&&e.HTMLCanvasElement&&e.HTMLCanvasElement.prototype.transferControlToOffscreen&&e.URL&&e.URL.createObjectURL);function r(){}function l(t){var a=n.exports.Promise,i=void 0!==a?a:e.Promise;return"function"==typeof i?new i(t):(t(r,r),null)}var c,s,u,h,f,d,m,g,b,v=(u=Math.floor(1e3/60),h={},f=0,"function"==typeof requestAnimationFrame&&"function"==typeof cancelAnimationFrame?(c=function(t){var e=Math.random();return h[e]=requestAnimationFrame((function n(a){f===a||f+u-1<a?(f=a,delete h[e],t()):h[e]=requestAnimationFrame(n)})),e},s=function(t){h[t]&&cancelAnimationFrame(h[t])}):(c=function(t){return setTimeout(t,u)},s=function(t){return clearTimeout(t)}),{frame:c,cancel:s}),M=(g={},function(){if(d)return d;if(!a&&o){var e=["var CONFETTI, SIZE = {}, module = {};","("+t.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join("\n");try{d=new Worker(URL.createObjectURL(new Blob([e])))}catch(t){return void 0!==typeof console&&"function"==typeof console.warn&&console.warn("🎊 Could not load worker",t),null}!function(t){function e(e,n){t.postMessage({options:e||{},callback:n})}t.init=function(e){var n=e.transferControlToOffscreen();t.postMessage({canvas:n},[n])},t.fire=function(n,a,i){if(m)return e(n,null),m;var o=Math.random().toString(36).slice(2);return m=l((function(a){function r(e){e.data.callback===o&&(delete g[o],t.removeEventListener("message",r),m=null,i(),a())}t.addEventListener("message",r),e(n,o),g[o]=r.bind(null,{data:{callback:o}})}))},t.reset=function(){for(var e in t.postMessage({reset:!0}),g)g[e](),delete g[e]}}(d)}return d}),p={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function y(t,e,n){return function(t,e){return e?e(t):t}(t&&null!=t[e]?t[e]:p[e],n)}function w(t){return t<0?0:Math.floor(t)}function x(t){return parseInt(t,16)}function C(t){return t.map(T)}function T(t){var e=String(t).replace(/[^0-9a-f]/gi,"");return e.length<6&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]),{r:x(e.substring(0,2)),g:x(e.substring(2,4)),b:x(e.substring(4,6))}}function I(t){t.width=document.documentElement.clientWidth,t.height=document.documentElement.clientHeight}function k(t){var e=t.getBoundingClientRect();t.width=e.width,t.height=e.height}function E(t,e,n,o,r){var c,s,u=e.slice(),h=t.getContext("2d"),f=l((function(e){function l(){c=s=null,h.clearRect(0,0,o.width,o.height),r(),e()}c=v.frame((function e(){!a||o.width===i.width&&o.height===i.height||(o.width=t.width=i.width,o.height=t.height=i.height),o.width||o.height||(n(t),o.width=t.width,o.height=t.height),h.clearRect(0,0,o.width,o.height),u=u.filter((function(t){return function(t,e){e.x+=Math.cos(e.angle2D)*e.velocity+e.drift,e.y+=Math.sin(e.angle2D)*e.velocity+e.gravity,e.wobble+=e.wobbleSpeed,e.velocity*=e.decay,e.tiltAngle+=.1,e.tiltSin=Math.sin(e.tiltAngle),e.tiltCos=Math.cos(e.tiltAngle),e.random=Math.random()+2,e.wobbleX=e.x+10*e.scalar*Math.cos(e.wobble),e.wobbleY=e.y+10*e.scalar*Math.sin(e.wobble);var n=e.tick++/e.totalTicks,a=e.x+e.random*e.tiltCos,i=e.y+e.random*e.tiltSin,o=e.wobbleX+e.random*e.tiltCos,r=e.wobbleY+e.random*e.tiltSin;if(t.fillStyle="rgba("+e.color.r+", "+e.color.g+", "+e.color.b+", "+(1-n)+")",t.beginPath(),"circle"===e.shape)t.ellipse?t.ellipse(e.x,e.y,Math.abs(o-a)*e.ovalScalar,Math.abs(r-i)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI):function(t,e,n,a,i,o,r,l,c){t.save(),t.translate(e,n),t.rotate(o),t.scale(a,i),t.arc(0,0,1,r,l,c),t.restore()}(t,e.x,e.y,Math.abs(o-a)*e.ovalScalar,Math.abs(r-i)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI);else if("star"===e.shape)for(var l=Math.PI/2*3,c=4*e.scalar,s=8*e.scalar,u=e.x,h=e.y,f=5,d=Math.PI/f;f--;)u=e.x+Math.cos(l)*s,h=e.y+Math.sin(l)*s,t.lineTo(u,h),l+=d,u=e.x+Math.cos(l)*c,h=e.y+Math.sin(l)*c,t.lineTo(u,h),l+=d;else t.moveTo(Math.floor(e.x),Math.floor(e.y)),t.lineTo(Math.floor(e.wobbleX),Math.floor(i)),t.lineTo(Math.floor(o),Math.floor(r)),t.lineTo(Math.floor(a),Math.floor(e.wobbleY));return t.closePath(),t.fill(),e.tick<e.totalTicks}(h,t)})),u.length?c=v.frame(e):l()})),s=l}));return{addFettis:function(t){return u=u.concat(t),f},canvas:t,promise:f,reset:function(){c&&v.cancel(c),s&&s()}}}function S(t,n){var a,i=!t,r=!!y(n||{},"resize"),c=y(n,"disableForReducedMotion",Boolean),s=o&&!!y(n||{},"useWorker")?M():null,u=i?I:k,h=!(!t||!s)&&!!t.__confetti_initialized,f="function"==typeof matchMedia&&matchMedia("(prefers-reduced-motion)").matches;function d(e,n,i){for(var o,r,l,c,s,h=y(e,"particleCount",w),f=y(e,"angle",Number),d=y(e,"spread",Number),m=y(e,"startVelocity",Number),g=y(e,"decay",Number),b=y(e,"gravity",Number),v=y(e,"drift",Number),M=y(e,"colors",C),p=y(e,"ticks",Number),x=y(e,"shapes"),T=y(e,"scalar"),I=function(t){var e=y(t,"origin",Object);return e.x=y(e,"x",Number),e.y=y(e,"y",Number),e}(e),k=h,S=[],F=t.width*I.x,N=t.height*I.y;k--;)S.push((o={x:F,y:N,angle:f,spread:d,startVelocity:m,color:M[k%M.length],shape:x[(c=0,s=x.length,Math.floor(Math.random()*(s-c))+c)],ticks:p,decay:g,gravity:b,drift:v,scalar:T},r=void 0,l=void 0,r=o.angle*(Math.PI/180),l=o.spread*(Math.PI/180),{x:o.x,y:o.y,wobble:10*Math.random(),wobbleSpeed:Math.min(.11,.1*Math.random()+.05),velocity:.5*o.startVelocity+Math.random()*o.startVelocity,angle2D:-r+(.5*l-Math.random()*l),tiltAngle:(.5*Math.random()+.25)*Math.PI,color:o.color,shape:o.shape,tick:0,totalTicks:o.ticks,decay:o.decay,drift:o.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:3*o.gravity,ovalScalar:.6,scalar:o.scalar}));return a?a.addFettis(S):(a=E(t,S,u,n,i)).promise}function m(n){var o=c||y(n,"disableForReducedMotion",Boolean),m=y(n,"zIndex",Number);if(o&&f)return l((function(t){t()}));i&&a?t=a.canvas:i&&!t&&(t=function(t){var e=document.createElement("canvas");return e.style.position="fixed",e.style.top="0px",e.style.left="0px",e.style.pointerEvents="none",e.style.zIndex=t,e}(m),document.body.appendChild(t)),r&&!h&&u(t);var g={width:t.width,height:t.height};function b(){if(s){var e={getBoundingClientRect:function(){if(!i)return t.getBoundingClientRect()}};return u(e),void s.postMessage({resize:{width:e.width,height:e.height}})}g.width=g.height=null}function v(){a=null,r&&e.removeEventListener("resize",b),i&&t&&(document.body.removeChild(t),t=null,h=!1)}return s&&!h&&s.init(t),h=!0,s&&(t.__confetti_initialized=!0),r&&e.addEventListener("resize",b,!1),s?s.fire(n,g,v):d(n,g,v)}return m.reset=function(){s&&s.reset(),a&&a.reset()},m}function F(){return b||(b=S(null,{useWorker:!0,resize:!0})),b}n.exports=function(){return F().apply(this,arguments)},n.exports.reset=function(){F().reset()},n.exports.create=S}(function(){return void 0!==t?t:"undefined"!=typeof self?self:this||{}}(),e,!1),t.confetti=e.exports}(window,{});
