#!/usr/bin/env python3
"""
Script to remove trailing whitespace from files
"""
import re
import sys
from pathlib import Path

def fix_trailing_whitespace(file_path):
    """Remove trailing whitespace from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove trailing whitespace from each line
        lines = content.split('\n')
        cleaned_lines = [line.rstrip() for line in lines]
        new_content = '\n'.join(cleaned_lines)
        
        # Preserve original newline at end if it existed
        if content.endswith('\n'):
            new_content += '\n'
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}", file=sys.stderr)
        return False

def main():
    files_to_fix = [
        "AUDIT_ASSESSMENTS_NEW_ARISE.md",
        "IMPLEMENTATION_COMPLETE_SUMMARY.md",
        "apps/web/src/app/[locale]/dashboard/assessments/360-feedback/results/page.tsx",
        "apps/web/src/app/[locale]/dashboard/assessments/360-feedback/results/page_old.tsx",
        "apps/web/src/app/[locale]/dashboard/assessments/tki/results/page.tsx",
        "apps/web/src/app/[locale]/dashboard/assessments/tki/results/page_old.tsx",
        "apps/web/src/app/[locale]/dashboard/assessments/wellness/results/page.tsx",
        "apps/web/src/data/mbtiQuestions.ts",
        "backend/app/api/v1/endpoints/assessments.py",
        "backend/app/models/assessment.py",
        "backend/app/services/feedback360_service.py",
        "backend/app/services/mbti_service.py",
        "backend/app/services/tki_service.py",
        "backend/app/services/wellness_service.py",
    ]
    
    fixed_count = 0
    for file_path in files_to_fix:
        path = Path(file_path)
        if path.exists():
            if fix_trailing_whitespace(path):
                print(f"Fixed: {file_path}")
                fixed_count += 1
        else:
            print(f"Not found: {file_path}", file=sys.stderr)
    
    print(f"\nFixed trailing whitespace in {fixed_count} files")

if __name__ == "__main__":
    main()
