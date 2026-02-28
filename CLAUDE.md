# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PokéFlex is a CSS Flexbox learning exercise. It's a fully static vanilla JS/HTML/CSS project with no build system, no package manager, and no dependencies. The app displays Pokémon cards fetched from the [PokeBuild API](https://pokebuildapi.fr/api/v1/pokemon/).

## Running the Project

Open `index.html` directly in a browser, or use the VS Code Live Server extension (configured to port 5501 in [.vscode/settings.json](.vscode/settings.json)).

## Architecture

The project has three core files:

- **[index.html](index.html)** — Static structure. Uses a `<template id="pokemon-card-template">` element that JavaScript clones per card. All JavaScript-targeted elements use `data-field` or `data-stat` attributes.
- **[app.js](app.js)** — Pre-written application logic. Fetches Pokémon by name, caches results in `localStorage` with `pokeflex_` prefix, clones and populates the card template via `data-*` attributes. `DEFAULT_POKEMON = "Gruikui"` at the top controls which Pokémon loads on startup.
- **[style.css](style.css)** — Where all student work happens. The exercise goal is to apply flexbox properties to the `-flex` classes.

## Key Constraints

**Do not modify `app.js`** — it is pre-written and complete.

**Do not modify class names or `data-*` attributes in `index.html`** — `app.js` targets them directly.

## CSS Naming Convention

Every container that needs `display: flex` has a class ending in `-flex`:

| Class | Element |
|---|---|
| `.header-flex` | `<header>` |
| `.main-flex` | `<main>` |
| `.search-flex` | `<section>` wrapping search |
| `.search-form-flex` | `<form>` |
| `.search-input-flex` | Input + button wrapper |
| `.cards-flex` | Cards container |
| `.card-flex` | Individual card |
| `.card-image-flex` | Image wrapper |
| `.card-info-flex` | Name/ID/generation block |
| `.card-types-flex` | Type badges container |
| `.card-stats-flex` | Stats container |
| `.stat-row-flex` | Label + value row |
