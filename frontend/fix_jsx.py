import os

ui_dir = "/Users/taha/Documents/code/JNJD/frontend/src/ui"

for f in os.listdir(ui_dir):
    if f.endswith(".jsx"):
        old_path = os.path.join(ui_dir, f)
        new_path = os.path.join(ui_dir, f.replace(".jsx", ".tsx"))
        
        with open(old_path, "r") as file:
            content = file.read()
            
        with open(new_path, "w") as file:
            file.write("// @ts-nocheck\n" + content)
            
        os.remove(old_path)

print("Renamed .jsx to .tsx and added @ts-nocheck")
