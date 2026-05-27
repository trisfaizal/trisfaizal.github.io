# TRISF

Premium minimalist landing page for TRISF, built as a lightweight static website for GitHub Pages.

## Stack

- Pure HTML, CSS, and JavaScript
- GitHub Pages deployment via GitHub Actions
- Custom domain: `trisf.my.id`

## Structure

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── contact/
│   └── index.html
├── assets/
│   ├── css/
│   │   └── main.css
│   ├── img/
│   └── js/
│       └── main.js
├── CNAME
├── index.html
└── README.md
```

## Deployment

The site deploys automatically on every push to `main`.

GitHub repository setting:

`Settings` -> `Pages` -> `Build and deployment` -> `Source` -> `GitHub Actions`

Workflow:

1. Checkout repository
2. Configure GitHub Pages
3. Upload static site artifact
4. Deploy to GitHub Pages

## Development

Open `index.html` directly in a browser, or serve the repository root with any static file server.
