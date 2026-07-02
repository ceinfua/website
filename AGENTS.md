<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Language Convention

CEINFUA is a Paraguayan student center; its users speak Spanish. Any text a user actually reads in the running app must be in Spanish: JSX headings/labels/copy, form placeholders, nav links, and API error messages that get displayed in the UI (`NextResponse.json({ error: "..." })` strings returned from routes consumed by a page).

Code stays in English per normal convention: variable/function names, comments, model/enum names, file paths, commit messages, internal log output not shown to users.

`docs/` follows the same rule (Spanish), since it documents the project for the team, who read Spanish day to day — see `docs/proyecto.md` and `docs/local-dev-notes.md` for the established tone.
