from PIL import Image, ImageDraw
import glob

def remove_background(filepath):
    try:
        img = Image.open(filepath).convert("RGBA")
        w, h = img.size
        
        # Get the exact background color from the corner
        bg_color = img.getpixel((0, 0))
        target_color = (0, 0, 0, 0)
        
        print(f"Removing background color {bg_color} from {filepath}")
        
        # Flood fill from all 4 corners
        ImageDraw.floodfill(img, xy=(0, 0), value=target_color, thresh=15)
        ImageDraw.floodfill(img, xy=(w-1, 0), value=target_color, thresh=15)
        ImageDraw.floodfill(img, xy=(0, h-1), value=target_color, thresh=15)
        ImageDraw.floodfill(img, xy=(w-1, h-1), value=target_color, thresh=15)
        
        img.save(filepath)
        print(f"Successfully processed {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    files = glob.glob('public/images/process/step*.png')
    for f in files:
        remove_background(f)
