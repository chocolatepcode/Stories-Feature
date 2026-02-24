# Stories Feature

A client-side Instagram Stories clone that allows users to post short, ephemeral content that disappears after 24 hours.

## Overview

This project implements a "Story" feature similar to those found in popular social media platforms like Instagram and WhatsApp. Users can upload images that are stored in the browser's local storage and automatically removed after 24 hours.

## Features

- **Add Stories**: Click the plus button to upload an image
- **View Stories**: Click on any story to view it in full-screen
- **Swipe Navigation**: Swipe left/right or use arrow buttons to navigate between stories
- **Auto-advance**: Stories automatically advance after 5 seconds
- **24-Hour Expiry**: Stories automatically disappear after 24 hours
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Image Resizing**: Images are automatically resized to max 1080px x 1920px

## Project Structure

```
stories-feature/
├── src/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Responsive styles
│   └── app.js          # Application logic
├── tests/              # Test files
├── README.md           # This file
└── .gitignore          # Git ignore policy
```

## Technologies Used

- **JavaScript**: Vanilla JavaScript (no frameworks)
- **localStorage**: Client-side storage for stories
- **CSS3**: Responsive design with animations
- **HTML5**: Semantic markup

## How to Run

1. Open `src/index.html` in a web browser
2. Click the "+" button to add a story
3. Upload an image from your device
4. Click on stories to view them

## Usage

### Adding a Story
1. Click the "+" button in the stories bar
2. Click or drag to upload an image
3. Preview the image and click "Post Story"

### Viewing Stories
- Click on any story to open the full-screen viewer
- Swipe left/right to navigate between stories
- Click on the left or right side of the screen to navigate
- Use arrow keys for keyboard navigation
- Press Escape or click the X to close

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Limitations

- Stories are stored in localStorage (limited capacity)
- Stories persist only in the browser where they were created
- No server-side storage or sync between devices

## Credits

Created as part of the [Frontend Developer Roadmap](https://roadmap.sh/projects/stories-feature) learning path.