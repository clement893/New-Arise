# Theme Fix Quick Reference

## 🚀 Quick Start

### Starting a Batch

1. **Create branch**:
   ```bash
   git checkout -b theme-fix-batch-N
   ```

2. **Fix files** according to batch plan

3. **Verify** (PowerShell):
   ```powershell
   .\scripts\theme-fix-batch.ps1 -BatchNumber N -BatchName "Batch Name"
   ```

4. **Commit & Push**:
   ```bash
   git add .
   git commit -m "fix(theme): migrate batch N - [description]"
   git push origin theme-fix-batch-N
   ```

5. **Update progress**: Edit `THEME_FIX_PROGRESS.md`

---

## 🔄 Common Patterns

### Pattern Replacements

| Find | Replace | Notes |
|------|---------|-------|
| `bg-white dark:bg-gray-900` | `bg-background` | Main background |
| `text-gray-900 dark:text-white` | `text-foreground` | Primary text |
| `bg-gray-50 dark:bg-gray-900` | `bg-muted` | Secondary background |
| `text-gray-600 dark:text-gray-400` | `text-muted-foreground` | Secondary text |
| `border-gray-200 dark:border-gray-700` | `border-border` | Borders |
| `bg-gray-100 dark:bg-gray-800` | `bg-muted` | Muted background |
| `hover:bg-gray-100 dark:hover:bg-gray-800` | `hover:bg-muted` | Hover states |
| `text-gray-500 dark:text-gray-400` | `text-muted-foreground` | Muted text |
| `bg-gray-800 dark:bg-gray-900` | `bg-muted` | Dark backgrounds |

### Keep As-Is (Already Theme-Aware)

- ✅ `bg-primary-*` - Already uses CSS variables
- ✅ `bg-secondary-*` - Already uses CSS variables
- ✅ `bg-danger-*` - Already uses CSS variables
- ✅ `bg-warning-*` - Already uses CSS variables
- ✅ `bg-info-*` - Already uses CSS variables
- ✅ `bg-success-*` - Already uses CSS variables

### Special Cases

- **Gradients**: Keep gradient structure, replace colors:
  - `from-primary-50 to-primary-100` ✅ (already theme-aware)
  - `from-gray-50 to-gray-100` → `from-muted to-muted` (if needed)

- **Overlays**: 
  - `bg-black/50` → Keep (overlay opacity)
  - `bg-black/70` → Keep (overlay opacity)

---

## ✅ Verification Checklist

After each batch:

- [ ] TypeScript: `cd apps/web && pnpm type-check` ✅
- [ ] Build: `cd apps/web && pnpm build` ✅
- [ ] Visual: Check pages/components in browser
- [ ] Theme: Toggle dark/light mode
- [ ] Git: Commit and push
- [ ] Report: Update progress tracker

---

## 🚨 Troubleshooting

### TypeScript Error
- Check if class name is valid
- Verify Tailwind config includes the class
- Check for typos

### Build Error
- Check build logs
- Verify all imports are correct
- Check for syntax errors

### Visual Issue
- Verify theme variables are defined
- Check if dark mode class is applied
- Test in both light and dark mode

---

## 📝 Commit Message Format

```
fix(theme): migrate batch N - [Batch Name]

- Updated [X] files
- Replaced [pattern] with [replacement]
- Verified TypeScript and build
```

---

## 📊 Batch Order

1. Batch 1: Core Layout (CRITICAL)
2. Batch 2: Core UI (CRITICAL)
3. Batch 3: Dashboard/Admin Layouts (HIGH)
4. Batch 4: Auth Pages (HIGH)
5. Batch 5: Public Pages (MEDIUM)
6. Batch 6: Profile/Settings (MEDIUM)
7. Batch 7: Client/ERP Portals (MEDIUM)
8. Batch 8: Content/Forms (LOW)
9. Batch 9: Advanced UI (LOW)
10. Batch 10: Feature Components (LOW)
11. Batch 11: Admin Components (LOW)
12. Batch 12: Remaining/Cleanup (LOW)

---

**Ready to start? Begin with Batch 1!**

