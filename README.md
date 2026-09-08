# Portfolio Terminal

This is a personal portfolio reimagined as an interactive, draggable terminal window. Built with Astro, React, and Tailwind CSS, it offers a unique way to explore my projects, skills, and contact information through a command-line interface.

<p align="center">
  <img src="public/screenshot.png" alt="Screenshot of the portfolio terminal" width="600"/>
</p>

## ✨ Features

- **Interactive Terminal UI**: A familiar command-line interface for navigating the portfolio.
- **Draggable & Resizable Window**: The terminal can be moved and resized like a native application window, thanks to `react-draggable` and `re-resizable`.
- **macOS-like Controls**: Classic red, yellow, and green window buttons for an authentic feel.
- **Command-Based Navigation**: Use simple, intuitive commands to explore different sections.
- **Command History**: Cycle through previously entered commands using the up and down arrow keys.
- **Tab Completion**: Completes as far as the candidates agree, and lists them when it cannot.
- **Shell Shortcuts**: `Ctrl+L` clears the screen, `Ctrl+C` interrupts a running command.
- **Clickable Commands**: Every command the terminal names is also a button, so the whole portfolio is navigable without a keyboard.
- **Deep Links**: `/#exp` opens straight to a section, skipping the intro.
- **Responsive Design**: Adapts smoothly to various screen sizes.

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **UI Library**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🧞 Available Commands

All commands are run from the terminal prompt:

| Command   | Action                                      |
| :-------- | :------------------------------------------ |
| `about`   | Displays a brief introduction about me.     |
| `exp`     | Lists my professional experience.           |
| `skills`  | Shows a list of technical skills.           |
| `contact` | Provides ways to get in touch.              |
| `resume`  | Downloads my CV as a PDF.                   |
| `help`    | Shows this list of available commands.      |
| `repeat`  | Replays the intro animation.                |
| `clear`   | Clears all output from the terminal screen. |

A couple of undocumented commands are in there too — try the ones you would
reach for in a real shell.

### Keys

| Key      | Action                                                     |
| :------- | :--------------------------------------------------------- |
| `Tab`    | Complete the command. Press again to list the candidates.   |
| `↑` / `↓`| Walk through command history.                               |
| `Ctrl+L` | Clear the screen, keeping whatever is typed.                |
| `Ctrl+C` | Interrupt the running command. Falls back to copy when text is selected. |

### Linking to a section

Appending a command as a fragment runs it on load and skips the intro:

```
/#about   /#exp   /#skills   /#contact   /#resume
```

Running one of those commands updates the fragment, so the address bar is
always shareable.

## 🛠️ Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    cd <repo-folder>
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Start the development server:**
    ```sh
    npm run dev
    ```

The application will be available at `http://localhost:4321`.

## 📄 The resume PDF

The `resume` command serves `public/resume.pdf`. That file is not in the
repository — drop your own copy there before deploying, or the command will
hand visitors a 404.

## 🔗 Absolute URLs

The canonical link and the `og:image` need an origin. It comes from
`VERCEL_PROJECT_PRODUCTION_URL`, which Vercel points at the production domain,
so attaching a custom domain needs no code change. `PUBLIC_SITE_URL` overrides
it; local builds fall back to `http://localhost:4321`.
