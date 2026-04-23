import os
import re

src_dir = "/Users/taha/Documents/code/JNJD/jnjd_front/src"
dest_dir = "/Users/taha/Documents/code/JNJD/frontend/src/ui"

os.makedirs(dest_dir, exist_ok=True)

files = os.listdir(src_dir)

for file in files:
    if not file.endswith(".jsx"):
        continue
        
    with open(os.path.join(src_dir, file), "r") as f:
        content = f.read()
        
    new_content = "import React, { useState, useEffect, useRef } from 'react';\n"
    
    if "motion." in content or "<motion." in content or "AnimatePresence" in content:
        new_content += "import { motion, AnimatePresence } from 'framer-motion';\n"
        
    if file != "icons.jsx" and file != "utils.jsx":
        new_content += "import * as Icons from './icons';\n"
        new_content += "import { cn } from './utils';\n"
        
        # Replace <Icon... /> with <Icons.Icon... />
        content = re.sub(r'<Icon([a-zA-Z0-9_]+)', r'<Icons.Icon\1', content)
        
    if file == "icons.jsx":
        # remove Object.assign
        content = re.sub(r'Object\.assign\(window,\s*\{([^}]+)\}\);', r'export { \1 };', content)
        
    if file == "utils.jsx":
        # remove Object.assign
        content = re.sub(r'Object\.assign\(window,\s*\{([^}]+)\}\);', r'export { \1 };', content)
        
    # Find main functions
    functions = re.findall(r'function\s+([A-Z][a-zA-Z0-9_]*)\s*\(', content)
    
    new_content += "\n" + content
    
    if file not in ["icons.jsx", "utils.jsx"]:
        for func in functions:
            new_content += f"\nexport {{ {func} }};\n"
            
    with open(os.path.join(dest_dir, file), "w") as f:
        f.write(new_content)

print("Ported files to ui directory.")
