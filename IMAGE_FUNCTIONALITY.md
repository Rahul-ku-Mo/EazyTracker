# Image Functionality in NewCardDescriptionEditor

## Overview
The NewCardDescriptionEditor now supports image functionality, allowing users to paste images directly into the card description editor, similar to the main panel editor.

## Features Added

### 1. Image Support
- **Paste Images**: Users can paste images directly from clipboard (Ctrl+V / Cmd+V)
- **Automatic Upload**: Images are automatically uploaded to S3 storage
- **Loading States**: Shows upload progress with loading indicators
- **Error Handling**: Displays user-friendly error messages if upload fails

### 2. Image Display
- **Responsive Images**: Images are automatically resized to fit the editor
- **Maximum Dimensions**: Images have reasonable maximum dimensions (500px height)
- **Loading Overlay**: Shows loading spinner during upload
- **Image Styles**: Properly styled with rounded corners and smooth transitions

### 3. Technical Implementation

#### Components Added:
- `ImageNode`: Custom Lexical node for handling images
- `ImagesPlugin`: Plugin for handling image insertion commands
- `CopyImagePlugin`: Plugin for handling clipboard image paste
- `EditorRefPlugin`: Required for image plugin functionality

#### Dependencies:
- Uses the existing upload file progress store (`useUploadFileProgressStore`)
- Integrates with AWS S3 for image storage
- Maintains compatibility with existing editor functionality

### 4. Usage

#### For Users:
1. **Paste Image**: 
   - Copy an image to clipboard (from any source)
   - Click in the card description editor
   - Paste (Ctrl+V / Cmd+V)
   - Image will appear with a loading indicator
   - Once uploaded, the final image will be displayed

#### For Developers:
```typescript
// The editor now includes ImageNode in its configuration
const initialConfig = {
  namespace: "CardDescriptionEditor",
  theme,
  onError,
  nodes: [ListNode, ListItemNode, ImageNode] as any,
};

// Required plugins for image functionality
<ImagesPlugin />
<EditorRefPlugin editorRef={editorRef} />
<CopyImagePlugin ref={editorRef} />
```

### 5. Environment Requirements
Make sure these environment variables are set:
- `VITE_API_URL`: Backend API URL
- `VITE_AWS_S3_BUCKET`: S3 bucket name
- `VITE_AWS_REGION`: AWS region (defaults to 'ap-south-1')

### 6. File Structure
```
src/_components/Card/
├── NewCardDescriptionEditor.tsx (updated)
├── _editor/
│   ├── ImageNode/
│   │   ├── index.tsx
│   │   └── styles.css
│   └── Plugins/
│       ├── ImagePlugin.tsx
│       ├── CopyImagePlugin.tsx
│       └── ...
```

### 7. Styling
Images inherit styles from `_editor/ImageNode/styles.css` which provides:
- Responsive image sizing
- Loading state overlays
- Hover effects
- Proper alignment and spacing

## Testing
To test the image functionality:
1. Start the development server
2. Create a new card
3. Click in the description field
4. Copy an image from anywhere (browser, file system, etc.)
5. Paste it into the editor
6. Verify the image appears with loading state
7. Confirm the final image is displayed after upload

## Notes
- Images are uploaded to S3 with unique filenames
- Upload progress is tracked using Zustand store
- Error handling includes user-friendly messages
- Images maintain aspect ratio and have reasonable size limits 