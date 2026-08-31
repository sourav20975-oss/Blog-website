# [Solved] "python was not found" — Run Without Arguments to Install From the Microsoft Store

Fresh Windows laptop, you type `python` in the terminal, and Windows replies:

```
Python was not found; run without arguments to install from the Microsoft Store,
or disable this shortcut from Settings > Manage app execution aliases
```

Annoying — but the fix takes two minutes. Here's both routes.

## Why Does This Happen?

The error means the Python interpreter's location isn't in your **PATH environment variable**. Either Python isn't installed at all, or it's installed but Windows doesn't know where to find it.

## Fix 1: Fresh Install (Most Common Solution)

If Python isn't installed yet:

1. Download it from the official site: [python.org/downloads](https://www.python.org/downloads/)
2. Run the installer.
3. **CRITICAL**: tick the checkbox **"Add python.exe to PATH"** (on older installers: *"Add Python to environment variables"*) at the bottom of the first screen.

**Tick "Add python.exe to PATH" at the bottom of the first installer screen.**

That single checkbox prevents this entire problem. Done!

## Fix 2: Python Is Already Installed — Add It to PATH Manually

If `python` exists on disk but the terminal can't see it:

### Step 1: Find Where Python Lives

Common locations:

- `%AppData%\Programs\Python\Python311`
- `%AppData%\Programs\Python\Python311\Scripts`

(Not sure? See the companion guide on finding your Python installation path — try `where python` after opening a fresh terminal, or search for `python.exe` in C:\\Users\\<you>\\AppData.)

Copy both paths.

### Step 2: Open Environment Variables

Search **"Environment Variables"** in the Start menu → open it → click the **Environment Variables…** button in System Properties.

### Step 3: Edit the SYSTEM Path (Not User!)

1. In the **System variables** section (bottom box), select **Path** → click **Edit**.
2. Click **New** → paste the Python folder path.
3. Click **New** again → paste the `Scripts` folder path.
4. OK your way out of all dialogs.

> ⚠️ **Important**: add the paths under **System variables**, not User variables. Using the User section is a classic trap — it can fix `python --version` but break `pip` installs with a different error later.

### Step 4: Verify

Open a **brand new** terminal (old ones keep stale PATH):

```
python --version
pip --version
```

Both should now respond happily.

## Bonus: Disable the Fake Store Alias

If you'd rather never see the Microsoft Store suggestion again:
**Settings → Apps → Advanced app settings → App execution aliases** → turn OFF both `python.exe` and `python3.exe` aliases.

## Conclusion

The "Python was not found" error = PATH problem. Either reinstall with the PATH checkbox ticked, or manually add your existing Python + Scripts folders to the System Path. New terminal, verify, done. Happy coding!

