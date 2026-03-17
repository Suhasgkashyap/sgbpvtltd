# How to Add Product Images

## Option 1: Download from Website (Recommended)

1. Visit https://sgbagroindustries.com/product-category/all-products/
2. Right-click on each product image and select "Save image as..."
3. Save the images to the `public/products/` folder with these exact names:
   - `brush-cutter-trolley.jpg` - SGB Brush Cutter Trolley
   - `bc-520-brush-cutter.jpg` - SGB BC-520 Brush Cutter
   - `carry-cart.jpg` - SGB Carry Cart
   - `cycle-weeder.jpg` - SGB Cycle Weeder
   - `g45l-brush-cutter.jpg` - SGB G45L Brush Cutter
   - `wheel-barrow.jpg` - SGB Wheel Barrow

## Option 2: Use Your Own Images

If you have product photos:
1. Resize them to approximately 800x600px (or maintain 4:3 aspect ratio)
2. Save them as JPG or PNG format
3. Place them in `public/products/` with the names listed above

## Image Requirements

- Format: JPG or PNG
- Recommended size: 800x600px or similar 4:3 aspect ratio
- File size: Keep under 500KB for faster loading
- Background: White or transparent background works best

## Testing

After adding images:
1. Restart your development server if it's running
2. Refresh your browser
3. The product cards should now show actual images instead of emojis
4. If an image fails to load, it will automatically fallback to the emoji icon

## Fallback Behavior

The code includes automatic fallback:
- If an image is missing or fails to load, it will show an emoji icon
- This ensures your site always looks good even if some images are missing
