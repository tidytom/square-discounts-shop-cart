# Square Discounts Shop Cart

A drop-in widget for Squarespace shops that sell items in boxes (for example, boxes of 6): it shows customers how full their box is and nudges them to order full boxes.

## What it does
- Shows a small box-progress widget in the bottom corner of every page. It counts the items in the cart, shows a progress bar for the current box, and fires confetti when a box is filled.
- Greys out the checkout button and shows "Please order in multiples of 6" until the cart quantity is a multiple of the box size.
- On the cart page, adds an estimated discount line ("Quantity Discount Applied") and an "Estimated Total".
- When the cart reaches a bulk limit, asks the customer to email you for a custom discount.
- On product pages, adds **← Back to Shop** and **CART** buttons above the product title.
- The widget is a button: click it, or press Tab to reach it and then Enter, to go to the shop (or to email you when the bulk limit is reached).

## What you need
- A Squarespace website with Squarespace Commerce (a store).
- A Squarespace plan that includes **Code Injection**. It is not available on every plan.
- About 10 minutes.

## Install
1. Download this repository (green **Code** button, then **Download ZIP**) and unzip it.
2. Open `box-progress.js` in a text editor and change the values in the **CONFIG** block at the top (see **Settings and options**). At least set `BULK_EMAIL` and `SHOP_URL`.
3. In Squarespace, go to **Settings > Developer Tools > Code Injection**.
4. In the **Footer** box, type `<script>`, paste the whole content of `box-progress.js` on the next line, and then type `</script>` on the last line. Click **Save**.
5. Open **Custom CSS** in Squarespace (if you cannot find it, type "Custom CSS" in the Squarespace search). Paste the whole content of `box-progress.css`. Click **Save**.
6. Optional: `theme.css` has a few layout tweaks (a shorter footer and a smaller mobile menu icon). They are not needed for the widget. Paste them into **Custom CSS** too if you want them.
7. Set up the real discounts in **Commerce > Discounts** (see the next section). The widget does not change any prices by itself.

## How to use
1. Open your live site (code injection does not always run inside the Squarespace editor preview).
2. Add an item to the cart. Within a few seconds the widget counts it and shows, for example, **Box Incomplete** and "Add 5 to finish Box #1".
3. When the cart has a full box, the widget turns green and says **1 Box Full!**, and the checkout button works again.
4. Open the cart page to see the **Quantity Discount Applied** and **Estimated Total** lines.
5. Check that the estimated total matches what Squarespace shows at checkout. If it does not, change the example discount values in CONFIG.

## Settings and options
All settings are in the **CONFIG** block at the top of `box-progress.js`:

| Setting | Example value | What it does |
| --- | --- | --- |
| `SHOP_URL` | `'/shop'` | Page that **← Back to Shop** and the widget open. |
| `CART_URL` | `'/cart'` | Page that the **CART** button opens. |
| `BOX_SIZE` | `6` | Items per box. |
| `BULK_LIMIT` | `97` | At this many items or more, the widget asks the customer to email you. |
| `BULK_EMAIL` | `'orders@example.com'` | Email address for bulk orders. Change this. |
| `PRODUCT_IMAGE_URL` | `''` | Optional picture in the widget. Leave empty for no picture. |
| `EXAMPLE_FIRST_BOX_DISCOUNT` | `1.00` | **Example only.** Amount saved for one full box. |
| `EXAMPLE_PER_ITEM_DISCOUNT` | `0.50` | **Example only.** Amount saved per item ... |
| `EXAMPLE_PER_ITEM_FROM_QTY` | `12` | ... once the cart has this many items. |
| `CURRENCY`, `LOCALE` | `'USD'`, `'en-US'` | How money amounts are written. |
| `CART_CHECK_MS` | `3000` | How often the cart is checked, in milliseconds. |
| `CONFETTI_COLORS` | yellow, green, blue, white, light grey | Confetti colors. |

**Matching discounts in Squarespace.** The discount numbers in CONFIG are made-up examples. They only change the text in the widget and the estimated total on the cart page. To give customers a real discount:
1. Go to **Commerce > Discounts** in Squarespace.
2. Create **automatic** discounts that give the same amounts as your CONFIG values. Depending on your rules, you may need one discount for each box count (for example, a fixed amount off for orders over a minimum subtotal).
3. Test a few cart sizes and compare the widget's estimate with the Squarespace checkout total.

The widget colors are in `box-progress.css` under "Widget color themes".

## Safety notes
- **The checkout lock is a prompt, not enforcement.** It only greys out the checkout button with CSS. Squarespace itself does not know about the box rule. A customer can still check out with an odd quantity (for example with the keyboard, an express checkout button, or with scripts turned off). If you must enforce box sizes, use product variants or quantity limits in Squarespace.
- **The discount line is an estimate.** The real price is always the one Squarespace calculates at checkout from your Commerce discounts.
- The script reads the shopper's own cart from your site (`/api/commerce/cart`) every few seconds while the tab is open and visible. It stops while the tab is hidden. It sends nothing to any other site and stores nothing.
- To undo, delete the code from **Code Injection > Footer** and **Custom CSS**, then click **Save**.

## Troubleshooting
- **The widget does not appear.** Check that the code is in the **Footer** box, wrapped in `<script>` and `</script>`, and view the live site, not the editor preview. Check that your plan includes Code Injection.
- **The widget shows 0 items.** The script reads Squarespace's internal cart address `/api/commerce/cart`, which Squarespace does not officially document and may change. As a backup it reads the cart count in the site header.
- **The checkout button is not greyed out, or the Back/Cart buttons are missing.** Your template may use different class names. The script looks for `.cart-checkout-button` or `[data-test="checkout-button"]` for checkout, and for the product title in `h1.ProductItem-details-title` or similar.
- **The estimated total is wrong.** Change the `EXAMPLE_` discount values so they match your Squarespace discounts.

## How it works
`box-progress.js` is plain JavaScript with no build step. After the page loads it adds the widget, then checks Squarespace's cart JSON (`/api/commerce/cart`) every `CART_CHECK_MS` milliseconds, pausing on the `visibilitychange` event when the tab is hidden. From the quantity it picks a state (empty, incomplete box, full box, bulk), updates the text and progress bar, and toggles `cart-locked` and `has-custom-discount` classes on `<body>` that the CSS uses to grey out checkout and strike through the subtotal. Confetti uses the bundled [canvas-confetti](https://github.com/catdad/canvas-confetti) v1.6.0 library by Kiril Vatev (ISC license; the license text is included at the end of `box-progress.js`).

## License

MIT. See [LICENSE](LICENSE).
