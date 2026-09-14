# 🔧 Data Persistence & Tab Navigation Guide

## ✅ Understanding How Your Data Works

Your Automotive QE app now has **proper data persistence** across all tabs. Here's what you need to know:

---

## 📊 What Data is Saved Automatically

### ✅ Fully Editable & Saved
These can be modified and changes persist across tabs:

1. **Projects** - Create, edit, delete, duplicate
2. **Investigations** - Create and update investigations
3. **Corrective Actions (8D)** - Create and update actions
4. **Filters** - Project, date, machine, process filters
5. **UI State** - Sidebar collapsed/expanded, active project

### 📋 Sample Data (Read-Only)
These start with sample data to demonstrate the app:

- Production Records
- CMM Reports
- Characteristics
- Incoming Inspections
- In-Process Inspections
- Fixtures & Gauges
- MSA Studies
- PFMEA Entries
- Control Plan Entries
- Knowledge Matrix

**Why sample data?** These modules show you what the app can do. You can:
- View and analyze the sample data
- Export it as a backup
- Import your own data to replace it
- Clear all data to start fresh

---

## 🔄 How Tab Navigation Works

### ✅ Data Persists Across Tabs
When you navigate between tabs:

1. **All your data stays in memory** - Nothing is lost
2. **Changes are auto-saved** - Saved to localStorage automatically
3. **Filters persist** - Your filter selections stay active
4. **Active project stays** - Your selected project is remembered

### 📊 What You See on Each Tab

**Dashboard Tab:**
- Shows KPIs based on current filters
- Displays charts for production, defects, scrap
- Shows "Sample Data" banner if using demo data

**Projects Tab:**
- Shows all your projects
- You can add/edit/delete projects
- Changes save immediately

**CMM Reports Tab:**
- Shows CMM report library
- Sample reports are pre-loaded
- You can import your own reports

**Analysis Tabs (SPC, Capability, etc.):**
- Analyze the data from CMM reports
- Charts and statistics update based on filters
- Data persists as you navigate

---

## 💾 How to Work with Your Data

### Scenario 1: Using Sample Data (Demo Mode)
```
1. Open the app - sample data loads automatically
2. Explore the features with demo data
3. Navigate between tabs - data persists
4. Make changes to projects/investigations - they save
5. Export backup if needed (Settings → Export)
```

### Scenario 2: Using Your Own Data
```
1. Go to Settings
2. Click "Clear All Data" to remove sample data
3. Import your data files:
   - Production data (CSV/Excel)
   - CMM reports (Excel/CSV)
   - Inspection records
4. Your data replaces the sample data
5. All changes save automatically
```

### Scenario 3: Switching Between Data Sets
```
1. Export your current data (Settings → Export)
2. Clear all data (Settings → Clear)
3. Import different data set (Settings → Import)
4. Work with new data
5. To switch back, import your previous export
```

---

## 🎯 Common Questions

### Q: "Why does the data look the same when I switch tabs?"
**A:** The data is persisting correctly! You're seeing the same data because:
- Sample data is pre-loaded to demonstrate features
- Your changes to projects/investigations are saved
- The data doesn't change unless you modify it

### Q: "I made changes but they disappeared!"
**A:** Check what you changed:
- ✅ Projects, investigations, corrective actions - These save
- ❌ Production, CMM reports, inspections - These are sample data (read-only)
- To modify sample data, you need to import your own data files

### Q: "How do I use my own data instead of sample data?"
**A:** 
1. Go to the relevant tab (Production, CMM Reports, etc.)
2. Use the import/upload function
3. Your data replaces the sample data
4. Or: Settings → Clear All Data → Import your backup

### Q: "Is my data safe when I navigate?"
**A:** Yes! All data is:
- Stored in browser localStorage
- Auto-saved on every change
- Persists across tab navigation
- Survives browser restart

### Q: "How do I know if I'm seeing sample or my data?"
**A:** Look for the blue banner at the top of the Dashboard:
- "Viewing Sample Data" = Demo data
- No banner = Your own data

---

## 🛠️ Data Management Best Practices

### ✅ Do:
- Export your data regularly (Settings → Export)
- Keep backup files with dates
- Import your own data to replace samples
- Use projects to organize your work
- Create investigations for issues

### ❌ Don't:
- Assume sample data is your data
- Forget to export before clearing
- Edit the JSON backup manually
- Rely on a single backup file

---

## 📊 Data Flow Diagram

```
User Action (Add Project, Update Investigation, etc.)
    ↓
State Updates in Context
    ↓
useEffect Detects Change
    ↓
Auto-Save to localStorage
    ↓
Green "Saved" Indicator Shows
    ↓
User Navigates to Different Tab
    ↓
Component Re-renders with Same Data
    ↓
Data Appears Consistent ✓
```

---

## 🔍 Troubleshooting

### Problem: "Data seems to reset when I navigate"
**Solution:**
1. Check the Dashboard banner - are you seeing sample data?
2. Make changes to projects (these save)
3. Navigate away and back
4. Your project changes should still be there
5. If not, check browser console for errors (F12)

### Problem: "I can't edit production/CMM data"
**Solution:**
- This is expected - sample data is read-only
- To use your own data:
  1. Go to Production Data tab
  2. Click "Upload CSV/XLSX"
  3. Import your data file
  4. Your data replaces the sample

### Problem: "My project changes disappeared"
**Solution:**
1. Check if localStorage is enabled
2. Try a different browser
3. Clear browser cache
4. Import from your last backup
5. Check browser console for errors

---

## 📝 Summary

### What Saves Automatically:
✅ Projects (add/edit/delete)
✅ Investigations (create/update)
✅ Corrective Actions (create/update)
✅ Filters and UI state
✅ Active project selection

### What's Sample Data (Read-Only):
📋 Production records
📋 CMM reports
📋 Characteristics
📋 Inspections
📋 Fixtures & gauges
📋 MSA studies
📋 PFMEA entries
📋 Control plans
📋 Knowledge matrix

### How to Use Your Own Data:
1. Export sample data as backup (optional)
2. Clear all data (Settings → Clear)
3. Import your data files
4. Or: Import a previous backup

---

## 🎉 You're All Set!

Your data now persists correctly across all tabs. The sample data is there to demonstrate the app's capabilities. You can:

- ✅ Explore features with sample data
- ✅ Make changes to projects/investigations (they save!)
- ✅ Import your own data to replace samples
- ✅ Export/import backups anytime
- ✅ Navigate between tabs without losing data

**The app is working as designed!** 🚗📊✨
