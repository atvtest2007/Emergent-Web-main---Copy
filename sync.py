import json
import os
import shutil

dir1 = r"C:\Users\Admin\OneDrive\Documents\Emergent-Web-main - Copy"
dir2 = r"C:\Users\Admin\OneDrive\Documents\Emergent-Web-main - Copy2"

with open(r"C:\Users\Admin\OneDrive\Documents\Emergent-Web-main - Copy\diff.json", "r") as f:
    diff = json.load(f)

print("Deleting extra files from dir1...")
for f in diff["missing_in_dir2"]:
    path = os.path.join(dir1, f)
    if os.path.exists(path):
        if os.path.isfile(path):
            os.remove(path)
            print(f"Deleted {f}")
        else:
            shutil.rmtree(path)
            print(f"Deleted directory {f}")

print("\nCopying missing files from dir2 to dir1...")
for f in diff["missing_in_dir1"]:
    src = os.path.join(dir2, f)
    dst = os.path.join(dir1, f)
    if os.path.exists(src):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        print(f"Copied {f}")

print("\nOverwriting modified files from dir2 to dir1...")
for f in diff["modified"]:
    src = os.path.join(dir2, f)
    dst = os.path.join(dir1, f)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Overwrote {f}")

print("\nSynchronization complete.")
