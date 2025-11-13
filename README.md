visControls Pro

Filename: visControlsPro.js
Author: Peter Polgari, peterp@forgeren.com

Version: 1.9.8
License: Non-commercial, no sharing, reuse, or distribution without written permission.

visControls Pro is a universal, real-time visual inspection and manipulation toolkit for images, SVGs, and background-image elements on any website. The script attaches a contextual overlay and a floating control widget that enables designers, auditors, developers, accessibility specialists, and digital forensic analysts to inspect, modify, save, compare, and annotate visual assets without altering the underlying webpage permanently.

The tool combines image transformation, layout debugging, accessibility highlighting, magnification, grid snapping, state persistence, background-image detection, and snapshot generation in a single self-contained userscript.

Key Purpose

visControls Pro was created to solve the recurring problem of inspecting images inside hostile, highly controlled, or locked-down webpages. Many modern sites block right-click, hide elements dynamically, use clipping masks, or embed images through complex wrapper structures. Designers, auditors, and developers often struggle to:

• Inspect image geometry
• Compare versions
• Extract assets
• Analyse forward-facing visual inconsistencies
• Test accessibility attributes
• Capture accurate viewport snapshots
• Investigate layout regressions

visControls Pro provides a complete, platform-independent solution that works without access to DevTools or site code, even on heavily protected pages.

Feature Overview
Image Interaction and Manipulation

• Real-time zoom in/out
• Rotate by 45° increments
• Move with mouse drag
• Optional grid snapping (0, 5, 10, 20 px)
• Reset transforms
• Per-image opacity control
• Hide/unhide any edited image
• Maintain visual layout without collapsing content
• Compare overlay (ghost layer) for before/after analysis
• Describe-this-image placeholder prompt for audits
• Persistent states via session or local storage

Background-Image Targeting

• Toggle background-image detection globally
• Full control over elements whose visuals come from CSS instead of <img> tags
• Forensic-friendly save methods for URLs that are normally inaccessible

Hard Mode (Precise Element Targeting)

• Turn hard mode ON to manually select non-clickable elements
• Elements highlight with green/red outlines on hover
• Clicking locks the image tools to that element
• Hard mode automatically turns OFF after selection to avoid noise
• Designed for hostile DOMs, masked content, overlays, or complex wrappers

Magnifier (2× → 4× → 8× → OFF)

• Cross-page magnifier that works on every element
• Captures live DOM snapshot for pixel-accurate zoom
• Moves with the cursor
• Cycles magnification level on click
• Exit magnifier with another click or Escape

Grid and Layout Tools

• Full-page grid overlay
• Grid snapping for image movement
• Supports 5, 10, and 20-pixel spacing
• Helps alignment audits and layout debugging

Saving Tools

• Save individual images (including SVG exports)
• Save background images where allowed
• Automatic fallback notes on CORS-restricted items
• Save all images as ZIP
• ZIP includes
• All extracted images
• Inline SVGs
• Background images if enabled
• A full readme.txt describing the page, time, browser, and warnings

Snapshot Tools

• Viewport snapshot (PNG)
• Uses html2canvas with CORS awareness
• Designed for audits, QA, and documentation

Accessibility Enhancements

• Live region announcements
• Keyboard shortcuts
• Tooltip descriptions
• ARIA-compliant toolbar and widget roles
• Hard mode supports visually impaired workflows by increasing selection clarity

Right-Click Restore

• Restores right-click functionality on pages that block it
• Does not override native browser behaviour
• Does not interfere with image controls

Visual Themes

• Light/dark toggle
• Internal widget icons with inverted colour scheme
• Settings allow future user preference persistence

Installation
1. Install a Userscript Manager

Recommended:
• Tampermonkey
• Violentmonkey
• Greasemonkey

2. Create a New Script

Copy the contents of visControlsPro.js into the new userscript file.

3. Save and Refresh

The widget appears fixed on the left edge of the screen.

Usage
Main Widget

Click the main button to reveal mini tools.
Each mini tool provides functionality such as grid, magnifier, hard mode, snapshot, theme switch, background-image toggle, reveal all, and power toggle.

Image Tools Overlay

Hover over any image to reveal contextual tools:
• Zoom
• Rotate
• Move
• Hide
• Save
• Opacity control
• Compare overlay
• Reset
• Describe

The overlay hides automatically when not in use.

Keyboard Shortcuts

• + or = zoom in
• - zoom out
• Left/Right arrow rotates
• Enter resets
• Escape closes overlay, magnifier, and hard mode

Storage and Persistence

The script supports:
• Mode 0: no storage
• Mode 1: session storage
• Mode 2: local storage

Persisted data includes:
• Scale
• Rotation
• Translation
• Placement
• Opacity
• Compare overlay state
• Hidden state

This ensures consistent behaviour between refreshes without altering the underlying page structurally.

Troubleshooting

The script may not capture cross-origin images due to browser CORS rules.
In those cases, it automatically generates .note.txt files containing a warning and full details.

If a site has a strict Content Security Policy, the script includes dynamic fallback loading for html2canvas and JSZip.

Shadow DOM elements may require hard mode for accurate selection.

Minimal layout shift may occur when moving persistent images, but the script compensates by maintaining space to prevent collapsing.

Changelog
v1.9.8

Fixes and improvements from user debugging sessions
• Corrected pointerEvents behaviour for placed vs non-placed images
• Ensured moved images do not collapse layout by preserving original spacing
• Ensured resets restore images to original flow position without visual jump
• Ensured reverse theme toggle applies to all widget and tool icons consistently
• Added missing 0,1,2 mode switch button
• Restored black tooltip styling for widget mini-buttons
• Tooltips fade out 300ms after leaving
• Fixed theme toggle widget icon shape rendering
• Restricted main widget spinning animation to click events only
• Corrected partially visible icons (hard mode, power, magnifier, save)
• Updated grid icon to #
• Updated outline and stroke-only icons for magnifier and save
• Hard mode now properly turns off immediately after a target is selected
• Additional stability fixes for drag-move behaviour and overlay attachment
• All fixes performed with zero changes to stable logic blocks

v1.9.7

Restored innerHTML SVG icon system after DOMParser caused breakage
Fixed pointer-events and z-index behaviour
Fixed several overlay masking issues

v1.9.6

Improved stability
Corrected image movement behaviour
Improved tooltip logic
Corrected background-image and SVG detection edge cases

v1.9.5

Rewrote icon system
Fixed scaling and stroke handling
Improved grid drawing over high-DPI
Improved magnifier drawing

v1.9.0 – v1.9.4

Major refactor
Introduced constant-time element selection
Improved state persistence
Added modal-safe opacity panel
Restored hard mode scanning

v1.8.x

Added magnifier
Added snapshot
Added save-all ZIP
Added background-image targeting toggle
Added reveal all
Improved cross-origin notes

v1.7.x

Stable release before major UI refactor
Hover overlay stable
Zoom, rotate, move stable
Ghost overlay introduced

v1.6.x

Refined overlay placement
Added grid controls
Added zoom/rotate hotkeys

v1.5.x

Added opacity handling
Added persistence modes
Added describe-this-image placeholder

v1.4.x

Improved toolbar
Added reset state logic
Added hide/unhide system

v1.3.x

Improved movement
Introduced snapping foundation

v1.2.x

Added SVG support
Added background-image extraction

v1.1.x

Added save single image
Added save SVG

v1.0.0

Initial release
Hover overlay
Zoom, rotate, move
Basic icon set
Right-click restoration
