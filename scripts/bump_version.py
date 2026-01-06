#!/usr/bin/env python3
"""
Simple script to bump the version in pyproject.toml
Usage: python scripts/bump_version.py [major|minor|patch]
"""

import sys
import re
from pathlib import Path

def bump_version(version_type="patch"):
    """Bump version in pyproject.toml"""
    
    pyproject_path = Path("pyproject.toml")
    if not pyproject_path.exists():
        print("❌ pyproject.toml not found!")
        return False
    
    # Read current content
    content = pyproject_path.read_text()
    
    # Find current version
    version_match = re.search(r'version = "(\d+)\.(\d+)\.(\d+)"', content)
    if not version_match:
        print("❌ Could not find version in pyproject.toml")
        return False
    
    major, minor, patch = map(int, version_match.groups())
    
    # Bump version based on type
    if version_type == "major":
        major += 1
        minor = 0
        patch = 0
    elif version_type == "minor":
        minor += 1
        patch = 0
    elif version_type == "patch":
        patch += 1
    else:
        print(f"❌ Invalid version type: {version_type}")
        return False
    
    old_version = f"{version_match.group(1)}.{version_match.group(2)}.{version_match.group(3)}"
    new_version = f"{major}.{minor}.{patch}"
    
    # Replace version in content
    new_content = re.sub(
        r'version = "\d+\.\d+\.\d+"',
        f'version = "{new_version}"',
        content
    )
    
    # Write back to file
    pyproject_path.write_text(new_content)
    
    print(f"✅ Version bumped from {old_version} to {new_version}")
    print(f"📝 Updated pyproject.toml")
    print(f"🚀 Commit and push to trigger publishing!")
    
    return True

if __name__ == "__main__":
    version_type = sys.argv[1] if len(sys.argv) > 1 else "patch"
    bump_version(version_type)