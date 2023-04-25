I tried creating dynamic charts given

1. `base`
2. `target`
3. `interval`

with the moshi API -> `http://api.mochi.pod.town/api/v1/defi/coins/compare?base=${base}&target=${target}&interval=${interval}`

[But](https://community.cloudflare.com/t/rendering-svg-using-canvas-with-cloudflare-workers/90952/3) apparently I can't seem to use canvas thing in a Cloudflare worker Environment.

---

To test this

1. To run the worker locally `wrangler dev index.js`
2. Make request to `WRANGLER_ENDPOINT?base="BASE"&target="TARGET"&interval="INTERVAL"`
