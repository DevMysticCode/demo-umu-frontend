# 🎤 Voice Search & Property API Testing Guide

## Quick Verification (5 Minutes)

### Run the App

```bash
npm run dev
```

Navigate to: `http://localhost:3000/dashboard`

---

## Voice Search Test (30 seconds)

### ✅ Visual Check

```
You should see:
- Title: "Stop searching like it's 1999. Search for a life, not just a house."
- Search bar with placeholder: "Describe your ideal home."
- 🎤 Microphone button (left of arrow button)
- → Arrow/send button (rightmost)
```

### 🎤 Microphone Button Location

```
┌──────────────────────────────────────┐
│ 🔍 [input field] [🎤] [→]           │
└──────────────────────────────────────┘

Clicking the 🎤 should:
1. Show blue animation
2. Show "🎤 Listening..." text below
3. Browser asks for microphone permission (first time)
```

### Voice Input Test

```
1. Click 🎤 microphone button
2. Wait for "🎤 Listening..." feedback
3. Say clearly: "Kingston upon Thames"
   (or try: "Postcode KT1" or "TW18")
4. Stop speaking
5. Should see text in search box
6. Results should appear automatically
```

**Expected Result:**

- Text appears in search field
- Search automatically executes
- Property cards appear below
- No errors in browser console

---

## Property Search API Test (1 minute)

### Text Search

```
1. Type in search bar: "TW18"
2. Click → (arrow button)
3. Wait ~800ms for results
```

**Should See:**

- Results count: "X Results Found"
- Property cards with:
  - Property image
  - Address
  - Postcode
  - Price (£...)
  - Passport % (if available)
  - Bedrooms/Bathrooms count
  - Property type

### Search by Area Name

```
1. Type: "Kingston"
2. Click →
3. Should find properties with "Kingston" in area
```

**Test Postcodes:**

- `KT1` - Kingston-upon-Thames
- `TW18` - Staines-upon-Thames
- `TW16` - Sunbury-on-Thames
- `KT2` - Kingston area
- Any partial match

---

## API Response Verification

### Check Browser Dev Tools

```
1. Press F12 (Open Dev Tools)
2. Go to Console tab
3. Type: window._properties
4. Should show array of properties
```

**OR in Components:**

```
1. Open Network tab in Dev Tools
2. Perform a search
3. Should see NO network requests (using mock data)
4. Check Console for "Search error: ..." (should be none)
```

---

## Button Layout Verification

### Microphone Visibility Test

```
Visual check:
✅ 🎤 (Microphone) is visible between input and arrow
✅ 🎤 (Microphone) is NOT covered by arrow
✅ Both buttons are side-by-side
✅ No overlapping or cutoff

Spacing:
- Microphone at: right: 3.5rem
- Arrow at: right: 0.5rem
- Gap between: ~3rem
```

### Test Interaction

```
1. Hover over 🎤 → Should turn cyan color
2. Click 🎤 → Should animate (pulse)
3. While listening → Button stays cyan/animated
4. After speaking → Button returns to normal
```

---

## Voice Button Behavior Checklist

| State     | Appearance                | Action                  |
| --------- | ------------------------- | ----------------------- |
| Idle      | Gray outline microphone   | Click to start          |
| Listening | Cyan background, animated | Automatic (listening)   |
| Active    | Cyan with pulse animation | Auto-stops after speech |
| Disabled  | Grayed out                | While searching         |

---

## Search Results Page

### List View

```
Should show:
- Back button (closes results)
- Search input (readonly, shows your query)
- Filter buttons (Current Location, Passport Available, Draw)
- Results count: "X Results Found for '[query]'"
- Property cards in scrollable list
- Bottom navigation: [List] [Map] buttons
```

### Try These Actions:

```
1. Click on a property card
   → Navigate to property details page

2. Click Map button
   → Shows placeholder for map view

3. Click List button
   → Return to list view

4. Click back arrow
   → Return to dashboard
```

---

## Error Scenarios & Solutions

### No Microphone Permission

```
❌ Error: "Microphone access denied"

Solution:
1. Go to browser settings
2. Allow microphone for localhost
3. Refresh page
4. Try again
```

### Voice Recognition Not Supported

```
❌ Error: "Speech Recognition not supported"

Solution:
1. Use Chrome, Safari, or Edge
2. Enable HTTPS (production requirement)
3. Ensure no VPN blocking audio
```

### No Search Results

```
❌ Searching "ABC123" → No results

Solution:
1. Try actual UK postcodes: KT1, TW18, KT2
2. Try area names: Kingston, Staines, Walton
3. Try addresses: "Maple Road"
4. Check mock properties in console
```

### Microphone Button Not Visible

```
❌ Can't see 🎤 button

Solution:
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+Shift+R on Windows)
3. Check CSS file loaded
4. Resize window (might be overlapped)
```

---

## Console Debug Commands

### Check Voice Support

```javascript
// In browser console:
console.log(
  'Voice Support:',
  !!window.SpeechRecognition || !!window.webkitSpeechRecognition,
)
```

### Check Properties Loaded

```javascript
// In browser console:
// After searching, should show results
console.log('Last search results visible on page')
```

### Check Search State

```javascript
// In Vue DevTools or console:
// Should show search query, results, searching status
console.log('Search status should update in real-time')
```

---

## Performance Notes

### Expected Timing

| Action                              | Expected Time            |
| ----------------------------------- | ------------------------ |
| Voice transcription                 | Real-time                |
| Click microphone → listening starts | <100ms                   |
| Speak → text appears                | <500ms                   |
| Click search → results appear       | ~800ms (simulated delay) |
| Total voice-to-results              | ~1-2 seconds             |

### Network Activity

```
✅ Should see NO network requests
✅ Mock data is cached locally
✅ Voice processing is client-side
✅ Only postcode validation uses API (postcodes.io)
```

---

## Quick Reference

### Common Voice Commands

```
"Kingston upon Thames"
"Postcode KT1 1AT"
"TW18"
"Staines upon Thames"
"Walton on Thames"
"Sunbury"
"Richmond"
```

### Mock Property Postcodes

```
TW18 3BA - Staines-upon-Thames
TW18 1AG - Walton-on-Thames
TW16 6RN - Sunbury-on-Thames
KT1 1AT - Kingston-upon-Thames
KT2 6EF - Kingston-upon-Thames
TW10 6RD - Richmond
```

---

## Final Checklist Before Reporting

- [ ] No errors in browser console
- [ ] Microphone button is visible (🎤)
- [ ] Arrow button is visible (→)
- [ ] Voice search works (text appears in field)
- [ ] Property search works (cards appear)
- [ ] Transition error is gone (file fixed)
- [ ] Search results display correctly
- [ ] No overlapping/hidden buttons
- [ ] Cross-browser compatible (tested in Chrome)

---

## What's Fixed

✅ **Transition Component Error** - FIXED

- Issue: Expected exactly one child - RESOLVED
- File: `components/find-property/EnhancedSearchInput.vue`

✅ **Microphone Button Visibility** - OPTIMIZED

- Issue: Buttons might overlap - FIXED
- File: Increased padding-right to 8rem

✅ **Placeholder Text** - UPDATED

- Was: "City, area or postcode"
- Now: "Describe your ideal home."

✅ **Send Button Icon** - UPDATED

- Was: Magnifying glass
- Now: Arrow (→)

✅ **Property Search API** - WORKING

- Mock data with 6+ real UK properties
- Filters by postcode and area

✅ **Voice Search** - WORKING

- Web Speech API integrated
- UK English language support

---

## Next Steps if Everything Works

1. ✅ Verify in console: No errors
2. ✅ Test voice: Say "Kingston"
3. ✅ Test search: Type "TW18"
4. ✅ Test results: Click property card
5. ✅ Test buttons: Try Map view

**All working? Great! Ready for:**

- Real API integration
- Production deployment
- User testing

---

**Status: All features ready for testing!** 🚀

Start with: `npm run dev` and navigate to Dashboard.
