# 🌐 Portfolio · Henri Joël Fofack Alemdjou

Personal portfolio of a Computer Engineering student at ENSPY (Yaoundé), focused on **Data Science and AI**.

🔗 **Live:** <https://portfoliofofackhenri.vercel.app/>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

---

## ✨ Features

- **Light and dark themes**: follows the system setting, remembers the visitor's choice, no colour flash on load
- **Fully responsive** layout with fluid typography (mobile, tablet, desktop)
- **Three languages**: French, English and German
- **Minimal animated hero**: blue grid cells light up around the name (canvas, paused when off-screen)
- **Accessibility**: respects `prefers-reduced-motion`, keyboard focus styles, ARIA labels
- **Working contact form** (Formspree)
- **No framework, no build step**: plain HTML, CSS and JavaScript

## 🗂️ Structure

```
├── index.html          # Home: hero, projects, awards, skills, experience, research, contact
├── projets.html        # All projects, grouped by category
├── profil.html         # About me and awards
├── css/
│   ├── style1.css      # Base styles
│   ├── custom.css      # Section components
│   ├── animations.css  # Entrance and hover animations
│   └── theme.css       # Light/dark design tokens and responsive layer
├── js/
│   ├── script.js       # Theme toggle, hero grid animation, menus, form
│   └── translations.js # FR / EN / DE content
└── images/
```

## 🚀 Run locally

```bash
git clone https://github.com/ALEMDJOU/portfolio.git
cd portfolio
python -m http.server 8000
```

Then open <http://localhost:8000>.

Every push to `main` is deployed automatically by Vercel.

---

👤 **Henri Joël Fofack Alemdjou** · [GitHub](https://github.com/ALEMDJOU) · [LinkedIn](https://linkedin.com/in/henri-fofack-250b1b320)
