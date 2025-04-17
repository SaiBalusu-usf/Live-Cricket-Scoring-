# Live Cricket Site

A minimal site that embeds a YouTube Live stream next to a live‑updating scorecard scraped from CricClubs.

## Quick Start

```bash
git clone <repo> live-cricket-site
cd live-cricket-site
npm install
npm run dev      # nodemon / hot reload
# Visit http://localhost:8080
```

1. Edit `client/index.html` and replace **`liveVideoId`** with your YouTube Live ID.  
   (YouTube URL: `https://www.youtube.com/watch?v=<ID>`)

2. If your match URL differs, update the constant in `server/index.js`.

## Deploy

Works out‑of‑the‑box on **Render, Vercel, Railway, Fly.io, Heroku,** or any VPS running Node 18+.

## Tech Stack

| Layer  | Library            |
| ------ | ------------------ |
| Server | Express 4, node‑fetch, Cheerio |
| Client | Plain HTML / CSS / JS |
| Scrape | Cheerio DOM parsing |

## License

MIT
