import re
import os

repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
emblem_path = os.path.join(repo_root, "apps", "frontend", "public", "emblem-of-india-gold.svg")
favicon_path = os.path.join(repo_root, "apps", "frontend", "public", "favicon.svg")

with open(emblem_path, "r", encoding="utf-8") as f:
    emblem_svg = f.read()

content_match = re.search(r"<svg[^>]*>(.*?)</svg>", emblem_svg, re.DOTALL)
if not content_match:
    raise RuntimeError("Failed to match svg tag in emblem-of-india-gold.svg")

inner_paths = content_match.group(1).strip()
inner_paths = re.sub(r"<title>.*?</title>", "", inner_paths)

# Target height in 256x256 square: 196, leaving 30px top and bottom padding
scale = 196.0 / 231.92
scaled_w = 145.52 * scale
tx = (256.0 - scaled_w) / 2.0
ty = (256.0 - 196.0) / 2.0

new_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <radialGradient id="gov-bg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#142C5D"/>
      <stop offset="100%" stop-color="#071329"/>
    </radialGradient>
    <linearGradient id="gold-rim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#997A15"/>
    </linearGradient>
    <linearGradient id="emblem-gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFF2A8"/>
      <stop offset="40%" stop-color="#E5C158"/>
      <stop offset="100%" stop-color="#BF9522"/>
    </linearGradient>
  </defs>

  <!-- National Circular Crest Badge -->
  <circle cx="128" cy="128" r="122" fill="url(#gov-bg)" stroke="url(#gold-rim)" stroke-width="6"/>
  <circle cx="128" cy="128" r="114" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>

  <!-- Official State Emblem of India (Lion Capital of Ashoka & Satyameva Jayate) -->
  <g transform="translate({tx:.3f}, {ty:.3f}) scale({scale:.5f})" fill="url(#emblem-gold)">
    {inner_paths}
  </g>
</svg>
"""

with open(favicon_path, "w", encoding="utf-8") as f:
    f.write(new_svg)

print(f"Successfully generated {favicon_path} (size: {len(new_svg)} bytes)")
